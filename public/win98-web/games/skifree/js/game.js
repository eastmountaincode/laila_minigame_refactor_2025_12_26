/* eslint-disable no-undef */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-case-declarations */
import Lift from './lift.js';
import Skier from './skier.js';
import User from './user.js';
import Util from './util.js';
import socket from './socket.js';
import NPCHandler from './npc.js';
import Yeti from './yeti.js';
import Slalom from './slalom.js';
import Chat from './chat.js';
import Gamepad from './gamepad.js';

export default class Game {
	constructor() {
		this.util = new Util();
		this.user = new User(this);
		this.skier = new Skier(this);
		this.lift = new Lift(this);
		this.npcHandler = new NPCHandler(this);
		this.yeti = new Yeti(this);
		this.slalom = new Slalom(this);
		this.chat = new Chat(this);
		this.gamepad = new Gamepad(this);
		this.resCoefficient = 1 / 18000;
		this.objectFreq = {
			treeSmallFreq: [24, 'tree_small'],
			treeLargeFreq: [12, 'tree_large'],
			treeBareFreq: [12, 'tree_bare'],
			bumpGroupFreq: [12, 'bump_group'],
			bumpSmallFreq: [12, 'bump_small'],
			bumpLargeFreq: [12, 'bump_large'],
			rockFreq: [4, 'rock'],
			stumpFreq: [4, 'stump'],
			jumpFreq: [4, 'jump']
		};
		this.jumpVBase = 0.7;
		this.jumpVMult = 0.0022;
		this.collisionsEnabled = true;
		this.doImageLoadCheck = true;
		this.hideHUD = false;
		this.images = [];
		this.skierTrailColor = '#DDDDDD';
		// BeFree: session-scoped counter of how many times the player has been reset by the
		// tree-wall modal. Controls which poem line shows and when the "Take off your skis"
		// button appears. Not persisted — resets on page reload.
		// Start at 0 for the full experience: three tree-wall resets before the
		// "Take off your skis" crossing.
		this.wallResetCount = 0;
		// Modal fires this many milliseconds after the skier's first crash of the session.
		// Tweak to taste — 2000–2500 felt about right in the first playtest.
		this.WALL_RESET_DELAY_MS = 1000;
		this.WALL_POEMS = [
			"The forest, the inner mind of the forest, cannot be penetrated.",
			"Each tree a name you have forgotten.",
			"The path closes behind you the moment you choose it.",
		];
		// Walking/exit cutscene tuning.
		// Max speed cap while walking (skier uses normal mouse-based input, just slower).
		this.WALKING_SPEED = 70;
		// Forward world distance walked (matches HUD distance) before the exit cutscene
		// kicks in.
		this.WALKING_DISTANCE = 250;
		// Pixels of skier render-offset (downward drift during exit cutscene) before the
		// fade-to-black starts. At WALKING_SPEED=70 this is ~2.3s into the cutscene.
		this.EXIT_FADE_START_OFFSET = 160;
		this.EXIT_FADE_MS = 2000;          // fade-to-black duration after fade trigger
		// Additional hold on a fully black screen after the fade completes, before the
		// Game Over dialog appears.
		this.GAME_OVER_DIALOG_DELAY_MS = 1500;
		this.getHTMLElements();
		this.loadAssets();
		this.darkModeOff();
		this.init();
	}

	// initialize game settings and generate game objects for start of game
	init() {
		this.mousePos = {x: 0, y: 0};
		this.gameWidth = Math.max(screen.width, window.innerWidth);
		this.gameHeight = Math.max(screen.height, window.innerHeight);
		this.skier.init();
		this.yeti.init();
		this.lift.init();
		this.slalom.init();
		this.isPaused = false;
		this.yDist = 0;
		this.wallModalShown = false;
		this.firstCrashTime = null;
		// 'skiing' → 'walking' (after "Take off your skis") → 'exit' (walks off-screen)
		// → 'game-over' (fade done, modal showing).
		this.mode = 'skiing';
		this.walkDistance = 0;
		this.fadeStartTime = null;
		// Hide the fade overlay if a previous run left it visible — snap back, don't animate.
		if (typeof document !== 'undefined') {
			const fadeEl = document.getElementById('exit-fade');
			if (fadeEl) {
				fadeEl.style.transition = 'none';
				fadeEl.classList.remove('active');
				requestAnimationFrame(() => { fadeEl.style.transition = ''; });
			}
		}
		this.timestampFire = this.util.timestamp();
		this.skierTrail = [];
		this.currentTreeFireImg = this.tree_bare_fire1;
		this.stylePointsToAwardOnLanding = 0;
		this.style = 0;
		socket.emit('new_point', 0);
		this.logo = { x: -50, y: -40 };
		this.gameInfoBtn.title = 'Pause';
	}

	// restart the gamestate
	restart() {
		this.init();
		this.setUpGameObjects();
		this.npcHandler.setUpNPCs();
	}

	// load game assets
	loadAssets() {
		this.tree_small = this.util.loadImage('./img/tree_small.png', this);
		this.tree_large = this.util.loadImage('./img/tree_large.png', this);
		this.tree_bare = this.util.loadImage('./img/tree_bare.png', this);
		this.tree_bare_fire1 = this.util.loadImage('./img/tree_bare_fire1.png', this);
		this.tree_bare_fire2 = this.util.loadImage('./img/tree_bare_fire2.png', this);
		this.bump_small = this.util.loadImage('./img/bump_small.png', this);
		this.bump_large = this.util.loadImage('./img/bump_large.png', this);
		this.bump_group = this.util.loadImage('./img/bump_group.png', this);
		this.rock = this.util.loadImage('./img/rock.png', this);
		this.stump = this.util.loadImage('./img/stump.png', this);
		this.jump = this.util.loadImage('./img/jump.png', this);
		this.offlineImg = this.util.loadImage('./img/offline.png', this);
		this.restart_img = this.util.loadImage('./img/restart.png', this);
		this.logoImg = this.util.loadImage('./img/skifreejs.png', this);

		this.user.loadAssets();
		this.skier.loadAssets();
		this.lift.loadAssets();
		this.npcHandler.loadAssets();
		this.yeti.loadAssets();
		this.slalom.loadAssets();
		this.images = this.images.concat(this.user.images, this.skier.images, this.lift.images, this.npcHandler.images, this.slalom.images);
	}

	getHTMLElements() {
		this.gamePausedText = document.getElementById('game-paused-text');
		this.restartImg = document.getElementById('restart-img');
		this.restartBtn = document.getElementById('restart-btn');
		this.restartBtn.onclick = () => { this.restart(); };
		this.gameInfo = document.getElementById('game-info');
		this.gameInfoBtn = document.getElementById('game-info-btn');
		this.gameInfoBtn.onclick = () => { this.gameInfoBtn.blur(); this.togglePause(); };
		this.gameInfoBtn.oncontextmenu = () => { this.gameInfoBtn.blur(); };
		this.gameInfoTime = document.getElementById('game-info-time');
		this.gameInfoDist = document.getElementById('game-info-dist');
		this.gameInfoSpeed = document.getElementById('game-info-speed');
		this.gameInfoStyle = document.getElementById('game-info-style');
		this.offlineInd = document.getElementById('offline-ind');
		navigator.onLine ? this.goOnline() : this.goOffline();
	}

	// adapt game to the size of the window
	resizeCanvas(newWidth, newHeight) {
		this.gameWidth = newWidth;
		this.gameHeight = newHeight;

		this.skier.x = this.gameWidth / 2;
		this.skier.y = this.gameHeight / 3;

		this.setUpGameObjects();
		this.npcHandler.setUpNPCs();
	}

	// initialize game objects on screen at start of game
	setUpGameObjects() {
		this.treesSmall = [];
		this.treesLarge = [];
		this.treesBare = [];
		this.bumpsGroup = [];
		this.bumpsSmall = [];
		this.bumpsLarge = [];
		this.rocks = [];
		this.jumps = [];
		this.stumps = [];

		this.calculateGameObjectCount();
		for (let n = 0; n < this.gameObjectCount; n++) {
			let type = this.getRandomGameObjectType();
			this.spawnNewGameObjectAtStart(type);
		}

		this.spawnTreeWallAfterStart();
	}

	// Horizontal tree-line wall. Past a fixed absolute Y (measured by cumulative vertical
	// distance skied — lateral movement doesn't count), every position is covered in trees.
	// We track the skier's cumulative map position and the bounds of the already-spawned
	// tree region in absolute map coords. Each frame we extend the spawned region to cover
	// (viewport + buffer) around the skier, spawning only the newly-exposed strips.
	TREE_WALL_CONFIG = {
		spacing: 26,
		jitter: 7,
		types: ['tree_large', 'tree_large', 'tree_small', 'tree_bare'],
		// How far outside the viewport (in world units) we keep tree coverage pre-spawned.
		// Must stay well inside hasGameObjectBeenPassed's ±width*3/4 threshold — i.e.
		// bufferX < width/4 (~160 for a 640-wide viewport), otherwise trees spawned on the
		// leading edge get immediately recycled as "passed" the instant we create them.
		bufferX: 80,
		bufferY: 200,
	};

	spawnTreeWallAfterStart() {
		// Cumulative skier position in absolute map coords (0,0 at game start/reset).
		this.skierMapX = 0;
		this.skierMapY = 0;
		// The tree line: absolute Y past which everything is trees. Only forward distance
		// counts — lateral motion doesn't bring the wall closer.
		this.treeLineMapY = this.slalom.startY + 150;
		// Bounds of the already-spawned tree region in absolute map coords.
		this.wallSpawnedMinX = 0;
		this.wallSpawnedMaxX = 0;
		this.wallSpawnedMaxY = this.treeLineMapY;
		this._expandTreeWall();
	}

	updateTreeWall(step) {
		if (this.treeLineMapY == null) return;
		this.skierMapX += this.skier.xv * step;
		this.skierMapY += this.skier.yv * step;
		this._expandTreeWall();
	}

	_expandTreeWall() {
		const cfg = this.TREE_WALL_CONFIG;
		const viewHalfW = window.innerWidth / 2 + cfg.bufferX;
		const viewAhead = window.innerHeight + cfg.bufferY;

		const visibleMinX = this.skierMapX - viewHalfW;
		const visibleMaxX = this.skierMapX + viewHalfW;
		const visibleMaxY = this.skierMapY + viewAhead;

		if (visibleMaxY <= this.treeLineMapY) return;

		// Snap bounds to spacing grid so subsequent fills align cleanly with prior ones.
		const s = cfg.spacing;
		const alignMin = (v) => Math.floor(v / s) * s;
		const alignMax = (v) => Math.ceil(v / s) * s;

		const newMinX = Math.min(this.wallSpawnedMinX, alignMin(visibleMinX));
		const newMaxX = Math.max(this.wallSpawnedMaxX, alignMax(visibleMaxX));
		const newMaxY = Math.max(this.wallSpawnedMaxY, alignMax(visibleMaxY));

		// 1. Forward extension (within current X band).
		if (newMaxY > this.wallSpawnedMaxY && this.wallSpawnedMaxX > this.wallSpawnedMinX) {
			const fillY1 = Math.max(this.wallSpawnedMaxY, this.treeLineMapY);
			this._fillTreeWallRegionMap(this.wallSpawnedMinX, this.wallSpawnedMaxX, fillY1, newMaxY);
		}
		// 2. Left extension (full depth of updated spawned region).
		if (newMinX < this.wallSpawnedMinX) {
			this._fillTreeWallRegionMap(newMinX, this.wallSpawnedMinX, this.treeLineMapY, newMaxY);
		}
		// 3. Right extension.
		if (newMaxX > this.wallSpawnedMaxX) {
			this._fillTreeWallRegionMap(this.wallSpawnedMaxX, newMaxX, this.treeLineMapY, newMaxY);
		}

		this.wallSpawnedMinX = newMinX;
		this.wallSpawnedMaxX = newMaxX;
		this.wallSpawnedMaxY = newMaxY;
	}

	// Player gave up on skiing: walk through the forest with collisions disabled.
	_enterWalkingMode() {
		this.mode = 'walking';
		this.walkDistance = 0;
		this.skier.enterWalking();
	}

	// After walking a certain distance, the world freezes and the skier drifts off-screen.
	_enterExitCutscene() {
		this.mode = 'exit';
		this.skier.enterExit();
	}

	// Skier has left the viewport — fade to black, then show the final dialog.
	_startFadeToGameOver() {
		this.fadeStartTime = this.util.timestamp();
		const fadeEl = document.getElementById('exit-fade');
		if (fadeEl) {
			fadeEl.style.transitionDuration = `${this.EXIT_FADE_MS}ms`;
			fadeEl.classList.add('active');
		}
		setTimeout(() => this._showGameOverDialog(),
			this.EXIT_FADE_MS + this.GAME_OVER_DIALOG_DELAY_MS);
	}

	// Close the BeFree $Window in the parent Win98 desktop. Same-origin iframe, so we can
	// reach the enclosing os-gui window element via frameElement → closest('.os-window').
	_closeBeFreeWindow() {
		const iframe = window.frameElement;
		const windowEl = iframe && iframe.closest && iframe.closest('.os-window');
		const $win = windowEl && windowEl.$window;
		if ($win && typeof $win.close === 'function') {
			$win.close();
		}
	}

	_showGameOverDialog() {
		this.mode = 'game-over';
		const showDialog = window.parent && window.parent.ShowDialogWindow;
		if (typeof showDialog !== 'function') return;
		try { new Audio('/assets/win95/chord.wav').play().catch(() => {}); } catch {}
		showDialog({
			title: 'BeFree',
			text: 'Game over.',
			modal: true,
			buttons: [{
				label: 'OK',
				isDefault: true,
				action: () => this._closeBeFreeWindow(),
			}],
		});
	}

	// Show the BeFree tree-wall dialog using the parent Win98 desktop's ShowDialogWindow
	// (same API as every other app on the desktop — e.g. EverythingIsFineSweeper). Same-
	// origin iframe so we can reach parent.ShowDialogWindow directly.
	_showWallModal() {
		this.wallModalShown = true;
		const showDialog = window.parent && window.parent.ShowDialogWindow;
		if (typeof showDialog !== 'function') {
			// Shouldn't happen in the Tender OS build, but don't wedge the game if it does.
			console.warn('[BeFree] parent.ShowDialogWindow unavailable; skipping wall modal.');
			return;
		}

		// Same sound the Denial consent modal plays. chord.wav lives at the site root.
		try { new Audio('/assets/win95/chord.wav').play().catch(() => {}); } catch {}

		const isFourthCrossing = this.wallResetCount >= this.WALL_POEMS.length;
		if (isFourthCrossing) {
			showDialog({
				title: 'BeFree',
				text: 'You cannot ski through the forest.',
				modal: true,
				buttons: [{
					label: 'Take off your skis',
					isDefault: true,
					action: () => this._enterWalkingMode(),
				}],
			});
		} else {
			showDialog({
				title: 'BeFree',
				text: this.WALL_POEMS[this.wallResetCount],
				modal: true,
				buttons: [{
					label: 'OK',
					isDefault: true,
					action: () => {
						this.wallResetCount++;
						// restart() -> init() sets wallModalShown = false.
						this.restart();
					},
				}],
			});
		}
	}

	_fillTreeWallRegionMap(mapX1, mapX2, mapY1, mapY2) {
		const cfg = this.TREE_WALL_CONFIG;
		const arrByType = {
			tree_small: this.treesSmall,
			tree_large: this.treesLarge,
			tree_bare: this.treesBare,
		};
		// Convert absolute map coords to skier-relative coords at spawn time.
		const offsetX = -this.skierMapX;
		const offsetY = -this.skierMapY;
		for (let mapY = mapY1; mapY < mapY2; mapY += cfg.spacing) {
			for (let mapX = mapX1; mapX < mapX2; mapX += cfg.spacing) {
				const jx = mapX + offsetX + this.util.randomInt(-cfg.jitter, cfg.jitter + 1);
				const jy = mapY + offsetY + this.util.randomInt(-cfg.jitter, cfg.jitter + 1);
				const type = cfg.types[this.util.randomInt(0, cfg.types.length)];
				this.spawnNewGameObject(type, jx, jy);
				const arr = arrByType[type];
				arr[arr.length - 1].isWallTree = true;
			}
		}
	}

	// determine the total number of game objects proportional to game window area
	calculateGameObjectCount() {
		let area = window.innerWidth * window.innerHeight;
		this.gameObjectCount = Math.floor(area * this.resCoefficient);
		console.log('game object count: ' + this.gameObjectCount);
	}

	// create array to manage the weighted frequencies of the different game object types
	createGameObjectFreqArray() {
		this.objectFreqArray = [];
		for (let key in this.objectFreq) {
			if (this.objectFreq.hasOwnProperty(key)) {
				let count = this.objectFreq[key][0];
				for (let n = 0; n < count; n++) {
					this.objectFreqArray.push(this.objectFreq[key][1]);
				}
			}
		}
	}

	// return a random game object type weighted based on the frequency value for each type
	getRandomGameObjectType() {
		if (!this.objectFreqArray) {
			this.createGameObjectFreqArray();
		}
		let i = this.util.randomInt(0, this.objectFreqArray.length);
		return this.objectFreqArray[i];
	}

	// spawn a game object of random type at a random location on screen
	spawnNewGameObjectAtStart(type) {
		let xy = this.getRandomCoordinateAtStart();
		this.spawnNewGameObject(type, xy.x, xy.y);
	}

	// determine whether or not a game object is occupying the specified location
	isLocationOccupiedByGameObject(xy, getDistanceBetweenPointsFunc) {
		let gameObjectsListsToCheck = [[{ x: 0, y: 0 }], this.treesSmall, this.treesLarge, this.treesBare, this.rocks, this.jumps,
			this.stumps, this.lift.liftTowers, this.slalom.gates, [this.logo, { x: this.logo.x + 75, y: this.logo.y }]];
		for (let gameObjectList of gameObjectsListsToCheck) {
			if (locationOccupiedHelper(gameObjectList)) return true;
		}
		return false;

		function locationOccupiedHelper(gameObjectList) {
			let minSpaceBetween = 80;
			for (let obj of gameObjectList) {
				let dist = getDistanceBetweenPointsFunc(xy.x, xy.y, obj.x, obj.y);
				if (dist < minSpaceBetween) return true;
			}
			return false;
		}
	}

	// get a random coordinate onscreen or offscreen at start of game
	getRandomCoordinateAtStart() {
		let space = 80, width = window.innerWidth, height = this.gameHeight;
		let searching = true, attempts = 0, maxAttempts = 10, xy;

		while (searching && attempts < maxAttempts) {
			xy = getRandomCoordinateAtStartHelper(this.util.randomInt);
			if (!this.isLocationOccupiedByGameObject(xy, this.util.getDistanceBetweenPoints)) {
				searching = false;
				break;
			} else {
				attempts++;
			}
		}
		return xy;

		function getRandomCoordinateAtStartHelper(randomIntFunc) {
			return { x: randomIntFunc(-width * 3 / 4, width * 3 / 4), y: randomIntFunc(-height / 3 - space, height) };
		}
	}

	// get an x/y coordinate pair for a location nearby offscreen
	getRandomCoordinateOffScreen() {
		let space = 80, width = window.innerWidth, height = this.gameHeight;
		let searching = true, attempts = 0, maxAttempts = 10, xy;

		while (searching && attempts < maxAttempts) {
			xy = getRandomCoordinateOffScreenHelper(this.util.randomInt);
			if (!this.isLocationOccupiedByGameObject(xy, this.util.getDistanceBetweenPoints)) {
				searching = false;
				break;
			} else {
				attempts++;
			}
		}

		return xy;

		function getRandomCoordinateOffScreenHelper(randomIntFunc) {
			switch (randomIntFunc(0, 3)) {
			case 0:
				// offscreen left
				return { x: randomIntFunc(-width * 3 / 4, -width / 2 - space), y: randomIntFunc(-height / 3 - space, height * 2 / 3) };
			case 1:
				// offscreen right
				return { x: randomIntFunc(width / 2, width * 3 / 4), y: randomIntFunc(-height / 3 - space, height * 2 / 3) };
			default:
				// offscreen down
				return { x: randomIntFunc(-width * 3 / 4, width * 3 / 4), y: randomIntFunc(height * 2 / 3, height) };
			}
		}
	}

	// spawn a new game object of specified type at the specified coordinates
	spawnNewGameObject(type, x, y) {
		let newObj;
		switch (type) {
		case 'bump_group':
			newObj = { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 64, hbHeight: 32, jumpOverHeight: 8, onCollision: this.slowOnCollision, img: this.bump_group };
			if (!this.bumpsGroup) this.bumpsGroup = [];
			this.bumpsGroup.push(newObj);
			return;
		case 'bump_small':
			newObj = { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 16, hbHeight: 4, jumpOverHeight: 4, onCollision: this.slowOnCollision, img: this.bump_small };
			if (!this.bumpsSmall) this.bumpsSmall = [];
			this.bumpsSmall.push(newObj);
			return;
		case 'bump_large':
			newObj = { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 24, hbHeight: 8, jumpOverHeight: 8, onCollision: this.slowOnCollision, img: this.bump_large };
			this.bumpsLarge.push(newObj);
			return;
		case 'tree_small':
			newObj = { game: this, x: x, y: y, hbXOffset: 8, hbYOffset: 22, hbWidth: 14, hbHeight: 10, jumpOverHeight: 32, hasCollided: false, onCollision: this.crashOnCollision, npcCanCrashInto: true, img: this.tree_small, drawThresholdY: -5 };
			if (!this.treesSmall) this.treesSmall = [];
			this.treesSmall.push(newObj);
			return;
		case 'tree_large':
			newObj = { game: this, x: x, y: y, hbXOffset: 9, hbYOffset: 52, hbWidth: 15, hbHeight: 12, jumpOverHeight: 64, hasCollided: false, onCollision: this.crashOnCollision, npcCanCrashInto: true, img: this.tree_large, drawThresholdY: -37 };
			this.treesLarge.push(newObj);
			return;
		case 'tree_bare':
			newObj = { game: this, x: x, y: y, hbXOffset: 7, hbYOffset: 18, hbWidth: 9, hbHeight: 9, jumpOverHeight: 27, hasCollided: false, onCollision: this.crashOnCollision, npcCanCrashInto: true, img: this.tree_bare, drawThresholdY: 1 , isOnFire: false};
			this.treesBare.push(newObj);
			return;
		case 'rock':
			newObj = { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 23, hbHeight: 11, jumpOverHeight: 11, hasCollided: false, onCollision: this.crashOnCollision, npcCanCrashInto: true, img: this.rock };
			this.rocks.push(newObj);
			return;
		case 'jump':
			newObj = { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 32, hbHeight: 8, jumpOverHeight: 8, hasCollided: false, onCollision: this.jumpOnCollision, img: this.jump };
			this.jumps.push(newObj);
			return;
		case 'stump':
			newObj = { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 16, hbHeight: 11, jumpOverHeight: 11, hasCollided: false, onCollision: this.crashOnCollision, npcCanCrashInto: true, img: this.stump };
			this.stumps.push(newObj);
			return;
		default:
			console.log('invalid game object type: ' + type);
		}
	}

	// update the gamestate
	update(now, step) {
		let gamepadInfo = this.gamepad.update();
		if (this.isPaused) return;
		this.currentTime = now;
		this.skier.update(gamepadInfo, step);
		// In skiing and walking modes the world scrolls, so run all of these. In exit /
		// game-over the world is frozen — skip them to save a lot of CPU.
		const worldActive = this.mode === 'skiing' || this.mode === 'walking';
		if (worldActive) {
			this.lift.update(step);
			this.npcHandler.update(step);
			this.yeti.update(step);
			this.updateSkierTrail(step);
			this.updateLogo(step);
			this.slalom.update(step);
		}

		// Walking still scrolls the world so these loops still need to run. Only the exit
		// cutscene fully freezes the world — skipping the per-object update + recycling
		// + tree-wall streaming in exit is a big perf win on the way out.
		if (worldActive) {
			this.updateGameObjects(this.bumpsGroup, step);
			this.updateGameObjects(this.bumpsSmall, step);
			this.updateGameObjects(this.bumpsLarge, step);
			this.updateGameObjects(this.treesSmall, step);
			this.updateGameObjects(this.treesLarge, step);
			this.updateGameObjects(this.treesBare, step);
			this.updateGameObjects(this.rocks, step);
			this.updateGameObjects(this.jumps, step);
			this.updateGameObjects(this.stumps, step);
			this.updateTreeWall(step);

			// update total distance traveled vertically
			this.yDist += this.skier.yv * step;
		}

		// BeFree: a fixed delay after the session's first crash, interrupt with the reset
		// modal (poem line, OK → restart). After 3 resets, the button becomes "Take off
		// your skis" — see _showWallModal.
		if (this.mode === 'skiing'
			&& !this.wallModalShown
			&& this.firstCrashTime != null
			&& now - this.firstCrashTime >= this.WALL_RESET_DELAY_MS) {
			this._showWallModal();
		}

		// Walking → exit cutscene after a fixed distance walked.
		if (this.mode === 'walking') {
			this.walkDistance += this.skier.yv * step;
			if (this.walkDistance >= this.WALKING_DISTANCE) {
				this._enterExitCutscene();
			}
		}

		// Exit cutscene → start fade once the skier has walked far enough downward.
		// We check the render offset, not skier.y: skier.y stays fixed so the world
		// doesn't pan during the cutscene (see Skier._updateExit for why).
		if (this.mode === 'exit' && this.fadeStartTime == null
			&& (this.skier._exitYOffset || 0) > this.EXIT_FADE_START_OFFSET) {
			this._startFadeToGameOver();
		}

		// flip the tree-on-fire image back and forth to create flicker effect
		if (now - this.timestampFire >= 50) {
			if (this.currentTreeFireImg == this.tree_bare_fire1) {
				this.currentTreeFireImg = this.tree_bare_fire2;
			} else {
				this.currentTreeFireImg = this.tree_bare_fire1;
			}
			this.timestampFire = now;
		}
	}

	// recycle position of uphill offscreen game objects once they are passed, check if any are colliding with the skier or other skiers/snowboarders, and update position
	updateGameObjects(gameObjects, step) {
		for (let i = 0; i < gameObjects.length; i++) {
			let object = gameObjects[i];

			// recycle the position of uphill offscreen game objects once they are passed
			if (this.hasGameObjectBeenPassed(object)) {
				this.recycleGameObject(gameObjects, i);
				
			}
			// if the skier hits an object they haven't hit already, mark it as hit and do collision action if applicable
			else if (this.isGameObjectCollidingWithSkier(object) && this.skier.jumpOffset < object.jumpOverHeight) {
				if (typeof object.onCollision !== 'undefined') {
					if (typeof object.hasCollided !== 'undefined') {
						if (!object.hasCollided) {
							object.onCollision();
							object.hasCollided = true;
						}
					} else {
						object.onCollision();
					}
				}
			}

			// if an other skier hits an object...
			for (let i = 0; i < this.npcHandler.otherSkiers.length; i++) {
				let otherSkier = this.npcHandler.otherSkiers[i];
				if (!otherSkier.isCrashed && this.npcHandler.isGameObjectCollidingWithNPC(otherSkier, object)) {
					if (typeof object.npcCanCrashInto !== 'undefined' && object.npcCanCrashInto) {
						this.npcHandler.crashOtherSkierOnCollision(otherSkier);
					}
				}
			}

			// if a snowboarder hits an object...
			for (let i = 0; i < this.npcHandler.snowboarders.length; i++) {
				let snowboarder = this.npcHandler.snowboarders[i];
				if (!snowboarder.isCrashed && this.npcHandler.isGameObjectCollidingWithNPC(snowboarder, object)) {
					if (typeof object.npcCanCrashInto !== 'undefined' && object.npcCanCrashInto) {
						this.npcHandler.crashSnowboarderOnCollision(snowboarder);
					}
				}
			}
			
			// update position of game objects
			object.x -= this.skier.xv * step;
			object.y -= this.skier.yv * step;
		}
	}

	// update the trail behind the skier
	updateSkierTrail(step) {
		if (!this.skier.isAlive) return;

		// add coordinate to skier trail
		if (!this.skier.isStopped && !this.skier.isJumping) {
			this.skierTrail.push({ x: 2, y: 24 });
		}
		
		for (let i = 0; i < this.skierTrail.length; i++) {
			// update position of skier trail coordinates
			this.skierTrail[i].x -= this.skier.xv * step;
			this.skierTrail[i].y -= this.skier.yv * step;

			// delete offscreen skier trail
			if (this.skierTrail[i].y < -window.innerHeight / 3) {
				this.skierTrail.splice(i, 1);
			}
		}
	}

	// update the position of the game logo
	updateLogo(step) {
		this.logo.x -= this.skier.xv * step;
		this.logo.y -= this.skier.yv * step;
	}

	// delete the game object and spawn a new game object of random type off screen
	recycleGameObject(gameObjects, i) {
		const obj = gameObjects[i];
		gameObjects.splice(i, 1);
		// Wall trees mostly delete (the streamer adds fresh ones) but occasionally respawn
		// as a random object — that's the source of the chaotic jumps/rocks flooding the map.
		if (obj && obj.isWallTree && Math.random() >= 0.25) return;
		let xy = this.getRandomCoordinateOffScreen();
		let type = this.getRandomGameObjectType();
		this.spawnNewGameObject(type, xy.x, xy.y);
	}

	// return true if the given game object is offscreen uphill or is far enough away horizontally
	hasGameObjectBeenPassed(object) {
		let space = 80, width = window.innerWidth, height = window.innerHeight;
		return object.y < -height / 3 - space
			|| object.x < -width * 3 / 4
			|| object.x > width * 3 / 4;
	}

	// determine if the game object is colliding with the skier
	isGameObjectCollidingWithSkier(object) {
		if (!this.collisionsEnabled) return false;
		// Once the player has taken off their skis, they walk straight through everything.
		if (this.mode !== 'skiing') return false;
		let rect1 = this.skier.hitbox;
		let rect2 = { x: object.x + object.hbXOffset, y: object.y + object.hbYOffset, width: object.hbWidth, height: object.hbHeight };
		return this.util.areRectanglesColliding(rect1, rect2);
	}

	// make the skier crash
	crashOnCollision() {
		this.game.skier.isCrashed = true;
		this.game.recordAndResetStyle();
		// Only wall-tree crashes start the reset timer — hitting a random stump or tree
		// above the tree line shouldn't count toward "stuck in the forest".
		if (this.game.firstCrashTime == null && this.isWallTree) {
			this.game.firstCrashTime = this.game.util.timestamp();
		}
		if (typeof this.isOnFire !== undefined) {
			if (this.game.skier.isJumping) {
				this.isOnFire = true;
			}
		}
	}

	// make the skier jump
	jumpOnCollision() {
		if (!this.game.skier.isCrashed && !this.game.skier.isJumping) {
			let jumpV = this.game.skier.yv * this.game.jumpVMult + this.game.jumpVBase;
			this.game.skier.jumpV = jumpV;
			this.game.skier.isJumping = true;
			this.game.stylePointsToAwardOnLanding = jumpV * 5;
		}
	}

	// make the skier slow down
	slowOnCollision() {
		undefined;
	}

	// send score to server and then reset back to 0
	recordAndResetStyle() {
		if (!this.isOffline && this.user.isLoggedIn && this.style > this.user.userData.score) {
			socket.emit('new_score', { _id: this.user.userData._id, username: this.user.userData.username, score: this.style });
			socket.once('updated_score', (res) => {
				console.log('socket: updated_score', res);
				if (res.ok) {
					window.localStorage.removeItem('loginToken');
					window.localStorage.setItem('loginToken', res.data);
					this.user.validateLoginToken();
					this.user.refreshLeaderboard(this.user.leaderboardScoreCount);
				} else this.user.signOut();
			});
		}
	}

	// return info about the instantaneous skier-to-mouse angle and velocity vectors
	getMouseAndVelocityInfo(gamepadInfo) {
		if (gamepadInfo) {
			this.mousePos.x = (this.gameWidth / 2) + 7 + (10 * gamepadInfo.gamepadAnalogVectors[0]);
			this.mousePos.y = (this.gameHeight / 3) + 32 + (10 * gamepadInfo.gamepadAnalogVectors[1]);
		}

		let mouseDiffX = -(this.mousePos.x - ((this.gameWidth / 2) + 7));
		let mouseDiffY = -(this.mousePos.y - ((this.gameHeight / 3) + 32));
		let mouseAtanDegrees = this.util.degrees(Math.atan(mouseDiffY / mouseDiffX));
		let mouseAngle = 0, mouseDiffXVector = 0, mouseDiffYVector = 0;

		if (mouseDiffX > 0) {
			mouseAngle = mouseAtanDegrees;
			mouseDiffXVector = -Math.cos(this.util.radians(mouseAngle));
			mouseDiffYVector = -Math.sin(this.util.radians(mouseAngle));
		} else if (mouseDiffX < 0) {
			if (mouseDiffY > 0) {
				mouseAngle = 180 + mouseAtanDegrees;
			} else if (mouseDiffY < 0) {
				mouseAngle = -180 + mouseAtanDegrees;
			}
			mouseDiffXVector = -Math.cos(this.util.radians(mouseAngle));
			mouseDiffYVector = -Math.sin(this.util.radians(mouseAngle));
		} else if (mouseDiffX == 0) {
			if (mouseDiffY > 0) {
				mouseAngle = -90;
			} else {
				mouseAngle = 90;
			}
			mouseDiffXVector = Math.cos(this.util.radians(mouseAngle));
			mouseDiffYVector = Math.sin(this.util.radians(mouseAngle));
		} else if (mouseDiffY == 0) {
			mouseAngle = 180;
			mouseDiffXVector = Math.cos(this.util.radians(mouseAngle));
			mouseDiffYVector = Math.sin(this.util.radians(mouseAngle));
		}

		let vAtanDegrees = this.util.degrees(Math.atan(this.skier.yv / this.skier.xv));
		let vAngle = 0, xvVector = 0, yvVector = 0;

		if (this.skier.xv > 0) {
			vAngle = vAtanDegrees;
			xvVector = -Math.cos(this.util.radians(vAngle));
			yvVector = -Math.sin(this.util.radians(vAngle));
		} else if (this.skier.xv < 0) {
			if (this.skier.yv > 0) {
				vAngle = 180 + vAtanDegrees;
			} else if (this.skier.yv < 0) {
				vAngle = -180 + vAtanDegrees;
			}
			xvVector = -Math.cos(this.util.radians(vAngle));
			yvVector = -Math.sin(this.util.radians(vAngle));
		} else if (this.skier.xv == 0) {
			if (this.skier.yv > 0) {
				vAngle = -90;
			} else {
				vAngle = 90;
			}
			xvVector = Math.cos(this.util.radians(vAngle));
			yvVector = Math.sin(this.util.radians(vAngle));
		} else if (this.skier.yv == 0) {
			vAngle = 180;
			xvVector = Math.cos(this.util.radians(vAngle));
			yvVector = Math.sin(this.util.radians(vAngle));
		}

		return [mouseAngle, [mouseDiffXVector, mouseDiffYVector], [xvVector, yvVector]];
	}

	goOnline() {
		console.log('network: online');
		this.isOffline = false;
		this.user.signInButton.disabled = false;
		this.user.registerButton.disabled = false;
		this.offlineInd.style.display = 'none';
	}

	goOffline() {
		console.log('network: offline');
		this.isOffline = true;
		this.user.signInButton.disabled = true;
		this.user.registerButton.disabled = true;
		this.offlineInd.style.display = 'block';
		if (this.user.isLoggedIn) this.user.signOut();
	}

	togglePause() {
		if (!this.user.isTextInputActive()) {
			if (this.isPaused) {
				this.startTime += (this.util.timestamp() - this.timePausedAt);
				this.isPaused = false;
				this.gamePausedText.style.display = 'none';
				this.restartBtn.style.display = 'none';
				this.restartImg.style.display = 'none';
				this.gameInfoBtn.title = 'Pause';
			} else {
				this.timePausedAt = this.util.timestamp();
				this.isPaused = true;
				this.gamePausedText.style.display = 'block';
				this.restartBtn.style.display = 'block';
				this.restartImg.style.display = 'block';
				this.gameInfoBtn.title = 'Play';
			}
		}
	}

	toggleDarkMode() {
		this.darkMode ? this.darkModeOff() : this.darkModeOn();
	}

	darkModeOff() {
		this.darkMode = false;
		document.body.style.backgroundColor = 'white';
		this.gamePausedText.style.color = 'black';

		let gameInfoStats = document.getElementById('game-info-stats');
		gameInfoStats.style.background = 'white';
		gameInfoStats.style.color = 'black';
		this.gameInfoBtn.onmouseenter = () => { gameInfoStats.style.background = '#DDDDDD'; };
		this.gameInfoBtn.onmouseleave = () => { gameInfoStats.style.background = 'white'; gameInfoStats.style.color = 'black'; };
		this.gameInfoBtn.onmousedown = () => { gameInfoStats.style.background = '#666666'; gameInfoStats.style.color = 'white'; };
		this.gameInfoBtn.onmouseup = () => { gameInfoStats.style.background = '#DDDDDD'; gameInfoStats.style.color = 'black'; };
		gameInfoStats.style.transitionDuration = '0.2s';
		gameInfoStats.style.border = '1px solid black';

		this.user.profileImage.style.background = 'white';
		this.user.profileImage.style.border = '1px solid black';
		this.user.profileImage.src = this.user.isLoggedIn ? this.user.logged_in.src : this.user.logged_out.src;
		this.user.profileButton.onmouseenter = () => { this.user.profileImage.style.background = '#DDDDDD'; };
		this.user.profileButton.onmouseleave = () => { this.user.profileImage.style.background = 'white'; this.user.profileImage.src = this.user.isLoggedIn ? this.user.logged_in.src : this.user.logged_out.src; };
		this.user.profileButton.onmousedown = () => { this.user.profileImage.style.background = '#666666'; this.user.profileImage.src = this.user.isLoggedIn ? this.user.logged_in_inverted.src : this.user.logged_out_inverted.src; };
		this.user.profileButton.onmouseup = () => { this.user.profileImage.style.background = '#DDDDDD'; this.user.profileImage.src = this.user.isLoggedIn ? this.user.logged_in.src : this.user.logged_out.src; };

		document.getElementById('user-section').style.color = 'black';
		document.getElementById('logged-in-username').style.color = 'black';
		document.getElementById('active-users').style.color = 'black';
		document.getElementById('leaderboard').style.color = 'black';
		document.getElementById('about').style.color = 'black';
		document.getElementById('message-container').style.color = 'black';

		let iconImages = document.getElementsByClassName('icon-img');
		for (let img of iconImages) {
			img.style.filter = 'invert(0)';
		}
		this.restartImg.style.filter = 'invert(0)';

		let buttons = document.getElementsByClassName('button');
		for (let button of buttons) {
			button.style.background = 'white';
			button.style.color = 'black';
			button.style.border = '1px solid black';
			button.onmouseenter = () => { button.style.background = '#DDDDDD'; };
			button.onmouseleave = () => { button.style.background = 'white'; button.style.color = 'black'; };
			button.onmousedown = () => { button.style.background = '#666666'; button.style.color = 'white'; };
			button.onmouseup = () => { button.style.background = '#DDDDDD'; button.style.color = 'black'; };
		}

		let textInputs = document.getElementsByClassName('text-input');
		for (let textInput of textInputs) {
			textInput.style.background = 'white';
			textInput.style.color = 'black';
			textInput.style.border = '1px solid black';
			textInput.addEventListener('focus', () => { textInput.style.background = '#DDDDDD'; });
			textInput.addEventListener('blur', () => { textInput.style.background = 'white'; });
		}

		this.skierTrailColor = '#DDDDDD';
	}

	darkModeOn() {
		this.darkMode = true;
		document.body.style.backgroundColor = '#11161f';
		this.gamePausedText.style.color = 'white';

		let gameInfoStats = document.getElementById('game-info-stats');
		gameInfoStats.style.background = '#444444';
		gameInfoStats.style.color = 'white';
		this.gameInfoBtn.onmouseenter = () => { gameInfoStats.style.background = '#666666'; };
		this.gameInfoBtn.onmouseleave = () => { gameInfoStats.style.background = '#444444'; gameInfoStats.style.color = 'white'; };
		this.gameInfoBtn.onmousedown = () => { gameInfoStats.style.background = 'white'; gameInfoStats.style.color = 'black'; };
		this.gameInfoBtn.onmouseup = () => { gameInfoStats.style.background = '#666666'; gameInfoStats.style.color = 'white'; };
		gameInfoStats.style.transitionDuration = '0.2s';
		gameInfoStats.style.border = '1px solid white';

		this.user.profileImage.style.background = '#444444';
		this.user.profileImage.style.border = '1px solid white';
		this.user.profileImage.src = this.user.isLoggedIn ? this.user.logged_in_inverted.src : this.user.logged_out_inverted.src;
		this.user.profileButton.onmouseenter = () => { this.user.profileImage.style.background = '#666666'; };
		this.user.profileButton.onmouseleave = () => { this.user.profileImage.style.background = '#444444'; this.user.profileImage.src = this.user.isLoggedIn ? this.user.logged_in_inverted.src : this.user.logged_out_inverted.src; };
		this.user.profileButton.onmousedown = () => { this.user.profileImage.style.background = 'white'; this.user.profileImage.src = this.user.isLoggedIn ? this.user.logged_in.src : this.user.logged_out.src; };
		this.user.profileButton.onmouseup = () => { this.user.profileImage.style.background = '#666666'; this.user.profileImage.src = this.user.isLoggedIn ? this.user.logged_in_inverted.src : this.user.logged_out_inverted.src; };

		document.getElementById('user-section').style.color = 'white';
		document.getElementById('logged-in-username').style.color = 'white';
		document.getElementById('active-users').style.color = 'white';
		document.getElementById('leaderboard').style.color = 'white';
		document.getElementById('about').style.color = 'white';
		document.getElementById('message-container').style.color = 'white';

		let iconImages = document.getElementsByClassName('icon-img');
		for (let img of iconImages) {
			img.style.filter = 'invert(1)';
		}
		this.restartImg.style.filter = 'invert(1)';

		let buttons = document.getElementsByClassName('button');
		for (let button of buttons) {
			button.style.background = '#444444';
			button.style.color = 'white';
			button.style.border = '1px solid white';
			button.onmouseenter = () => { button.style.background = '#666666'; };
			button.onmouseleave = () => { button.style.background = '#444444'; button.style.color = 'white'; };
			button.onmousedown = () => { button.style.background = 'white'; button.style.color = 'black'; };
			button.onmouseup = () => { button.style.background = '#666666'; button.style.color = 'white'; };
		}

		let textInputs = document.getElementsByClassName('text-input');
		for (let textInput of textInputs) {
			textInput.style.background = '#444444';
			textInput.style.color = 'white';
			textInput.style.border = '1px solid white';
			textInput.addEventListener('focus', () => { textInput.style.background = '#666666'; });
			textInput.addEventListener('blur', () => { textInput.style.background = '#444444'; });
		}

		this.skierTrailColor = '#222222';
	}

	// check to see if all images have been loaded and are ready to render
	confirmImagesAreAllLoaded() {
		for (let i = 0; i < this.images.length; i++) {
			let image = this.images[i];
			if (!image.isLoaded) {
				return false;
			}
		}
		return true;
	}

	// render the current state of the game
	draw(ctx) {
		// clear canvas
		ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
		
		if (this.doImageLoadCheck) {
			if (this.confirmImagesAreAllLoaded()) {
				this.doImageLoadCheck = false;
				this.user.profileImage.style.display = 'block';
				this.gameInfo.style.display = 'block';
				this.util.hasTouch() ? this.chat.hideChat() : this.chat.showChat();

			} else return;
		}

		// draw bumps
		for (let i = 0; i < this.bumpsGroup.length; i++) {
			let bump = this.bumpsGroup[i];
			ctx.drawImage(bump.img, this.skier.x + bump.x, this.skier.y + bump.y);
		}
		for (let i = 0; i < this.bumpsSmall.length; i++) {
			let bump = this.bumpsSmall[i];
			ctx.drawImage(bump.img, this.skier.x + bump.x, this.skier.y + bump.y);
		}
		for (let i = 0; i < this.bumpsLarge.length; i++) {
			let bump = this.bumpsLarge[i];
			ctx.drawImage(bump.img, this.skier.x + bump.x, this.skier.y + bump.y);
		}

		// draw logo
		ctx.drawImage(this.logoImg, Math.floor(this.logo.x + this.skier.x), Math.floor(this.logo.y + this.skier.y));

		// draw skier trail
		for (let i = 0; i < this.skierTrail.length; i++) {
			ctx.fillStyle = this.skierTrailColor;
			ctx.fillRect(this.skier.x + this.skierTrail[i].x, this.skier.y + this.skierTrail[i].y, 2, 1);
			ctx.fillRect(this.skier.x + this.skierTrail[i].x + 8, this.skier.y + this.skierTrail[i].y, 2, 1);
		}

		// draw jumps
		for (let i = 0; i < this.jumps.length; i++) {
			let jump = this.jumps[i];
			ctx.drawImage(jump.img, this.skier.x + jump.x, this.skier.y + jump.y);
		}

		this.slalom.draw(ctx);

		this.npcHandler.draw(ctx);

		// draw rocks
		for (let i = 0; i < this.rocks.length; i++) {
			let rock = this.rocks[i];
			ctx.drawImage(rock.img, this.skier.x + rock.x, this.skier.y + rock.y);
		}

		// draw stumps
		for (let i = 0; i < this.stumps.length; i++) {
			let stump = this.stumps[i];
			ctx.drawImage(stump.img, this.skier.x + stump.x, this.skier.y + stump.y);
		}

		// draw trees above skier
		for (let i = 0; i < this.treesSmall.length; i++) {
			let tree = this.treesSmall[i];
			if (tree.y < tree.drawThresholdY) {
				ctx.drawImage(tree.img, this.skier.x + tree.x, this.skier.y + tree.y);
			}
		}
		for (let i = 0; i < this.treesLarge.length; i++) {
			let tree = this.treesLarge[i];
			if (tree.y < tree.drawThresholdY) {
				ctx.drawImage(tree.img, this.skier.x + tree.x, this.skier.y + tree.y);
			}
		}
		for (let i = 0; i < this.treesBare.length; i++) {
			let tree = this.treesBare[i];
			if (tree.y < tree.drawThresholdY) {
				if (tree.isOnFire) {
					ctx.drawImage(this.currentTreeFireImg, this.skier.x + tree.x, this.skier.y + tree.y);
				} else {
					ctx.drawImage(tree.img, this.skier.x + tree.x, this.skier.y + tree.y);
				}
			}
		}

		// draw lift towers above skier
		this.lift.drawTowersAbovePlayer(ctx);

		// draw skier
		this.skier.draw(ctx);

		// draw trees below skier
		for (let i = 0; i < this.treesSmall.length; i++) {
			let tree = this.treesSmall[i];
			if (tree.y >= tree.drawThresholdY) {
				ctx.drawImage(tree.img, this.skier.x + tree.x, this.skier.y + tree.y);
			}
		}
		for (let i = 0; i < this.treesLarge.length; i++) {
			let tree = this.treesLarge[i];
			if (tree.y >= tree.drawThresholdY) {
				ctx.drawImage(tree.img, this.skier.x + tree.x, this.skier.y + tree.y);
			}
		}
		for (let i = 0; i < this.treesBare.length; i++) {
			let tree = this.treesBare[i];
			if (tree.y >= tree.drawThresholdY) {
				if (tree.isOnFire) {
					ctx.drawImage(this.currentTreeFireImg, this.skier.x + tree.x, this.skier.y + tree.y);
				} else {
					ctx.drawImage(tree.img, this.skier.x + tree.x, this.skier.y + tree.y);
				}
			}
		}

		// draw yeti
		this.yeti.draw(ctx);

		// draw lift chairs
		this.lift.drawChairs(ctx);

		// draw lift cables
		this.lift.drawCables(ctx);

		// draw lift towers below skier
		this.lift.drawTowersBelowPlayer(ctx);
		this.lift.drawTowerTops(ctx);

		if (!this.hideHUD) {
			// draw game info section
			if ((typeof this.startTime === 'undefined' || !this.slalom.courseIsActive) && !this.slalom.courseCompleted) this.startTime = this.currentTime;
			if (!this.slalom.courseCompleted) {
				this.slalomTime = this.currentTime - this.startTime;
			} else {
				this.slalomTime = this.slalom.time;
			}
			let timeText = 'Time:\xa0\xa0' + this.util.timeToString(this.slalomTime);
			this.gameInfoTime.innerText = timeText;

			let leadingSpace = '\xa0\xa0\xa0\xa0\xa0';
			let dist = Math.ceil(this.yDist / 28.7514);
			if (dist > 999999) {
				leadingSpace = '';
			} else if (dist > 99999) {
				leadingSpace = '\xa0';
			} else if (dist > 9999) {
				leadingSpace = '\xa0\xa0';
			} else if (dist > 999) {
				leadingSpace = '\xa0\xa0\xa0';
			} else if (dist > 99) {
				leadingSpace = '\xa0\xa0\xa0\xa0';
			}
			let distText = 'Dist:' + leadingSpace + dist.toString().padStart(2, '0') + 'm';
			this.gameInfoDist.innerText = distText;

			let speedText = 'Speed:\xa0\xa0\xa0\xa0' + Math.ceil(this.skier.currentSpeed / 28.7514).toString().padStart(2, '0') + 'm/s';
			this.gameInfoSpeed.innerText = speedText;

			let styleText = 'Style:\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + this.style;
			this.gameInfoStyle.innerText = styleText;

			// control visibility of game paused text html element
			if (this.isPaused) {
				this.gamePausedText.style.display = 'block';
				this.restartBtn.style.display = 'block';
				this.restartImg.style.display = 'block';
			} else {
				this.gamePausedText.style.display = 'none';
				this.restartBtn.style.display = 'none';
				this.restartImg.style.display = 'none';
			}

		} else {
			this.gamePausedText.style.display = 'none';
			this.restartBtn.style.display = 'none';
			this.restartImg.style.display = 'none';
		}
	}
}
