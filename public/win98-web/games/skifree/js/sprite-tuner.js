const STORAGE_KEY = "befree-skier-sprite-tuning-v1";
const SHEET_PATH = "./tuning/be-free-sprite-page.png";

const SPRITES = [
	{ id: "skier_left", label: "Left", file: "skier_left.png", width: 23, height: 26, drawXOffset: -4 },
	{ id: "skier_left_down", label: "Left Down", file: "skier_left_down.png", width: 22, height: 28, drawXOffset: -2 },
	{ id: "skier_down_left", label: "Down Left", file: "skier_down_left.png", width: 16, height: 31, drawXOffset: -1 },
	{ id: "skier_down", label: "Down", file: "skier_down.png", width: 15, height: 32, drawXOffset: 0 },
	{ id: "skier_down_right", label: "Down Right", file: "skier_down_right.png", width: 16, height: 31, drawXOffset: 0 },
	{ id: "skier_right_down", label: "Right Down", file: "skier_right_down.png", width: 22, height: 28, drawXOffset: -5 },
	{ id: "skier_right", label: "Right", file: "skier_right.png", width: 23, height: 26, drawXOffset: -4 },
	{ id: "skier_jump_down", label: "Jump Down", file: "skier_jump_down.png", width: 32, height: 32, drawXOffset: -6 },
	{ id: "skier_jump_left", label: "Jump Left", file: "skier_jump_left.png", width: 28, height: 31, drawXOffset: -7 },
	{ id: "skier_jump_right", label: "Jump Right", file: "skier_jump_right.png", width: 28, height: 31, drawXOffset: -6 },
	{ id: "skier_falling", label: "Falling", file: "skier_falling.png", width: 32, height: 25, drawXOffset: -9 },
	{ id: "skier_sit", label: "Sit", file: "skier_sit.png", width: 31, height: 23, drawXOffset: -8 },
	{ id: "skier_skate_left", label: "Skate Left", file: "skier_skate_left.png", width: 23, height: 26, drawXOffset: 0 },
	{ id: "skier_skate_right", label: "Skate Right", file: "skier_skate_right.png", width: 23, height: 26, drawXOffset: 0 },
	{ id: "skier_upside_down1", label: "Upside Down 1", file: "skier_upside_down1.png", width: 29, height: 32, drawXOffset: -7 },
	{ id: "skier_upside_down2", label: "Upside Down 2", file: "skier_upside_down2.png", width: 31, height: 24, drawXOffset: -8 },
	{ id: "skier_trick1_left", label: "Trick 1 Left", file: "skier_trick1_left.png", width: 25, height: 31, drawXOffset: -6 },
	{ id: "skier_trick1_right", label: "Trick 1 Right", file: "skier_trick1_right.png", width: 25, height: 31, drawXOffset: -4 },
	{ id: "skier_trick2", label: "Trick 2", file: "skier_trick2.png", width: 27, height: 34, drawXOffset: -6 },
];

const $ = (selector) => document.querySelector(selector);

const els = {
	spriteList: $("#spriteList"),
	spriteSelect: $("#spriteSelect"),
	mappedSummary: $("#mappedSummary"),
	stageCanvas: $("#stageCanvas"),
	stageMeta: $("#stageMeta"),
	sheetViewport: $("#sheetViewport"),
	sheetSurface: $("#sheetSurface"),
	spriteSheetImage: $("#spriteSheetImage"),
	cropBox: $("#cropBox"),
	cropPreviewCanvas: $("#cropPreviewCanvas"),
	cropXInput: $("#cropXInput"),
	cropYInput: $("#cropYInput"),
	cropWInput: $("#cropWInput"),
	cropHInput: $("#cropHInput"),
	overlayXInput: $("#overlayXInput"),
	overlayYInput: $("#overlayYInput"),
	overlayScaleInput: $("#overlayScaleInput"),
	overlayOpacityInput: $("#overlayOpacityInput"),
	stageZoomInput: $("#stageZoomInput"),
	originalOpacityInput: $("#originalOpacityInput"),
	mappedCheckbox: $("#mappedCheckbox"),
	copyJsonButton: $("#copyJsonButton"),
	downloadJsonButton: $("#downloadJsonButton"),
	saveStatus: $("#saveStatus"),
	refreshJsonButton: $("#refreshJsonButton"),
	importJsonButton: $("#importJsonButton"),
	jsonOutput: $("#jsonOutput"),
	prevSpriteButton: $("#prevSpriteButton"),
	nextSpriteButton: $("#nextSpriteButton"),
	fitButton: $("#fitButton"),
	centerButton: $("#centerButton"),
	resetButton: $("#resetButton"),
	centerCropButton: $("#centerCropButton"),
};

const originalImages = new Map();

let state = {
	selectedId: SPRITES[0].id,
	stageZoom: 10,
	sheetScale: 0.22,
	originalOpacity: 1,
	mappings: {},
};

let dragState = null;

function defaultMapping(sprite) {
	const cropSize = 220;
	const scale = Number((sprite.height / cropSize).toFixed(4));
	return {
		ready: false,
		crop: { x: 0, y: 0, width: cropSize, height: cropSize },
		overlay: {
			x: Number(((sprite.width - cropSize * scale) / 2).toFixed(2)),
			y: Number(((sprite.height - cropSize * scale) / 2).toFixed(2)),
			scale,
			opacity: 0.82,
		},
	};
}

function loadState() {
	try {
		const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
		if (stored && stored.mappings) {
			state = {
				...state,
				...stored,
				mappings: stored.mappings || {},
			};
		}
	} catch (error) {
		console.warn("Failed to load BeFree sprite tuning state:", error);
	}
}

function saveState() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	updateSaveStatus();
}

function updateSaveStatus(message) {
	if (!els.saveStatus) return;
	const now = new Date();
	const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });
	els.saveStatus.textContent = message || `Auto-saved locally at ${time}`;
}

function selectedSprite() {
	return SPRITES.find((sprite) => sprite.id === state.selectedId) || SPRITES[0];
}

function selectedMapping() {
	const sprite = selectedSprite();
	if (!state.mappings[sprite.id]) {
		state.mappings[sprite.id] = defaultMapping(sprite);
	}
	return state.mappings[sprite.id];
}

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

function clampCrop(crop) {
	const maxW = els.spriteSheetImage.naturalWidth || 2160;
	const maxH = els.spriteSheetImage.naturalHeight || 2160;
	crop.width = clamp(Number(crop.width) || 1, 1, maxW);
	crop.height = clamp(Number(crop.height) || 1, 1, maxH);
	crop.x = clamp(Number(crop.x) || 0, 0, maxW - crop.width);
	crop.y = clamp(Number(crop.y) || 0, 0, maxH - crop.height);
}

function buildSpriteList() {
	els.spriteList.innerHTML = "";
	els.spriteSelect.innerHTML = "";

	for (const sprite of SPRITES) {
		const option = document.createElement("option");
		option.value = sprite.id;
		option.textContent = `${sprite.label} (${sprite.width} x ${sprite.height})`;
		els.spriteSelect.appendChild(option);

		const button = document.createElement("button");
		button.type = "button";
		button.className = "sprite-item";
		button.dataset.spriteId = sprite.id;
		button.innerHTML = `
			<span class="sprite-thumb"><img src="./img/${sprite.file}" alt=""></span>
			<span>
				<span class="sprite-name">${sprite.label}</span>
				<span class="sprite-size">${sprite.width} x ${sprite.height}</span>
			</span>
			<span class="status-dot" aria-hidden="true"></span>
		`;
		button.addEventListener("click", () => selectSprite(sprite.id));
		els.spriteList.appendChild(button);
	}
}

function loadOriginalImages() {
	for (const sprite of SPRITES) {
		const img = new Image();
		img.src = `./img/${sprite.file}`;
		img.onload = () => drawAll();
		originalImages.set(sprite.id, img);
	}
}

function selectSprite(id) {
	state.selectedId = id;
	selectedMapping();
	saveState();
	syncControlsFromState();
	drawAll();
}

function selectedIndex() {
	return Math.max(0, SPRITES.findIndex((sprite) => sprite.id === state.selectedId));
}

function moveSelection(delta) {
	const nextIndex = (selectedIndex() + delta + SPRITES.length) % SPRITES.length;
	selectSprite(SPRITES[nextIndex].id);
}

function syncControlsFromState() {
	const mapping = selectedMapping();
	const { crop, overlay } = mapping;

	els.spriteSelect.value = state.selectedId;
	els.cropXInput.value = Math.round(crop.x);
	els.cropYInput.value = Math.round(crop.y);
	els.cropWInput.value = Math.round(crop.width);
	els.cropHInput.value = Math.round(crop.height);
	els.overlayXInput.value = Number(overlay.x).toFixed(2);
	els.overlayYInput.value = Number(overlay.y).toFixed(2);
	els.overlayScaleInput.value = Number(overlay.scale).toFixed(3);
	els.overlayOpacityInput.value = Number(overlay.opacity).toFixed(2);
	els.stageZoomInput.value = state.stageZoom;
	els.originalOpacityInput.value = state.originalOpacity;
	els.mappedCheckbox.checked = Boolean(mapping.ready);

	for (const item of els.spriteList.querySelectorAll(".sprite-item")) {
		const id = item.dataset.spriteId;
		item.classList.toggle("active", id === state.selectedId);
		item.classList.toggle("ready", Boolean(state.mappings[id]?.ready));
	}

	const readyCount = SPRITES.filter((sprite) => state.mappings[sprite.id]?.ready).length;
	els.mappedSummary.textContent = `${readyCount} / ${SPRITES.length} ready`;
	updateSheetScale();
	updateCropBox();
	updateJsonOutput();
}

function updateStateFromInputs() {
	const mapping = selectedMapping();
	mapping.crop.x = Number(els.cropXInput.value);
	mapping.crop.y = Number(els.cropYInput.value);
	mapping.crop.width = Number(els.cropWInput.value);
	mapping.crop.height = Number(els.cropHInput.value);
	clampCrop(mapping.crop);

	mapping.overlay.x = Number(els.overlayXInput.value);
	mapping.overlay.y = Number(els.overlayYInput.value);
	mapping.overlay.scale = Math.max(0.01, Number(els.overlayScaleInput.value));
	mapping.overlay.opacity = clamp(Number(els.overlayOpacityInput.value), 0, 1);

	state.stageZoom = Number(els.stageZoomInput.value);
	state.originalOpacity = Number(els.originalOpacityInput.value);
	mapping.ready = els.mappedCheckbox.checked;

	saveState();
	syncControlsFromState();
	drawAll();
}

function stageFrame() {
	const sprite = selectedSprite();
	const zoom = state.stageZoom;
	const canvas = els.stageCanvas;
	const width = canvas.width;
	const height = canvas.height;
	return {
		x: Math.round((width - sprite.width * zoom) / 2),
		y: Math.round((height - sprite.height * zoom) / 2),
		width: sprite.width * zoom,
		height: sprite.height * zoom,
		zoom,
	};
}

function currentOverlayRect() {
	const frame = stageFrame();
	const mapping = selectedMapping();
	const { crop, overlay } = mapping;
	return {
		x: frame.x + overlay.x * frame.zoom,
		y: frame.y + overlay.y * frame.zoom,
		width: crop.width * overlay.scale * frame.zoom,
		height: crop.height * overlay.scale * frame.zoom,
	};
}

function drawChecker(ctx, width, height, size = 10) {
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, width, height);
	for (let y = 0; y < height; y += size) {
		for (let x = 0; x < width; x += size) {
			if ((x / size + y / size) % 2 === 0) {
				ctx.fillStyle = "#e1e1e1";
				ctx.fillRect(x, y, size, size);
			}
		}
	}
}

function drawStage() {
	const canvas = els.stageCanvas;
	const ctx = canvas.getContext("2d");
	const sprite = selectedSprite();
	const original = originalImages.get(sprite.id);
	const mapping = selectedMapping();
	const frame = stageFrame();
	const overlayRect = currentOverlayRect();

	ctx.imageSmoothingEnabled = false;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawChecker(ctx, canvas.width, canvas.height, 12);

	ctx.save();
	ctx.strokeStyle = "#214bd7";
	ctx.lineWidth = 1;
	ctx.setLineDash([5, 4]);
	ctx.strokeRect(frame.x - 0.5, frame.y - 0.5, frame.width + 1, frame.height + 1);
	ctx.restore();

	ctx.save();
	ctx.strokeStyle = "rgba(20, 20, 20, 0.45)";
	ctx.beginPath();
	ctx.moveTo(frame.x, 0);
	ctx.lineTo(frame.x, canvas.height);
	ctx.moveTo(0, frame.y);
	ctx.lineTo(canvas.width, frame.y);
	ctx.stroke();
	ctx.restore();

	if (original?.complete) {
		ctx.globalAlpha = state.originalOpacity;
		ctx.drawImage(original, frame.x, frame.y, frame.width, frame.height);
		ctx.globalAlpha = 1;
	}

	if (els.spriteSheetImage.complete) {
		const { crop, overlay } = mapping;
		ctx.globalAlpha = overlay.opacity;
		ctx.drawImage(
			els.spriteSheetImage,
			crop.x,
			crop.y,
			crop.width,
			crop.height,
			overlayRect.x,
			overlayRect.y,
			overlayRect.width,
			overlayRect.height,
		);
		ctx.globalAlpha = 1;
		ctx.strokeStyle = "#ff2f72";
		ctx.lineWidth = 2;
		ctx.strokeRect(overlayRect.x, overlayRect.y, overlayRect.width, overlayRect.height);
	}

	els.stageMeta.textContent = [
		`${sprite.label}: original ${sprite.width} x ${sprite.height}`,
		`draw x offset ${sprite.drawXOffset}`,
		`overlay ${mapping.crop.width} x ${mapping.crop.height} at ${mapping.overlay.scale.toFixed(3)}x`,
	].join(" | ");
}

function drawCropPreview() {
	const canvas = els.cropPreviewCanvas;
	const ctx = canvas.getContext("2d");
	const mapping = selectedMapping();
	const { crop } = mapping;
	ctx.imageSmoothingEnabled = false;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawChecker(ctx, canvas.width, canvas.height, 8);
	if (!els.spriteSheetImage.complete) return;
	const scale = Math.min(canvas.width / crop.width, canvas.height / crop.height);
	const width = crop.width * scale;
	const height = crop.height * scale;
	const x = (canvas.width - width) / 2;
	const y = (canvas.height - height) / 2;
	ctx.drawImage(els.spriteSheetImage, crop.x, crop.y, crop.width, crop.height, x, y, width, height);
}

function drawAll() {
	drawStage();
	drawCropPreview();
	updateCropBox();
}

function updateSheetScale() {
	if (!els.spriteSheetImage.naturalWidth) return;
	const width = Math.round(els.spriteSheetImage.naturalWidth * state.sheetScale);
	els.spriteSheetImage.style.width = `${width}px`;
	els.spriteSheetImage.style.height = "auto";
}

function updateCropBox() {
	if (!els.spriteSheetImage.naturalWidth) return;
	const mapping = selectedMapping();
	const { crop } = mapping;
	const scale = els.spriteSheetImage.clientWidth / els.spriteSheetImage.naturalWidth;
	els.cropBox.style.left = `${crop.x * scale}px`;
	els.cropBox.style.top = `${crop.y * scale}px`;
	els.cropBox.style.width = `${crop.width * scale}px`;
	els.cropBox.style.height = `${crop.height * scale}px`;
}

function sheetPoint(event) {
	const rect = els.spriteSheetImage.getBoundingClientRect();
	const scale = els.spriteSheetImage.naturalWidth / rect.width;
	return {
		x: clamp((event.clientX - rect.left) * scale, 0, els.spriteSheetImage.naturalWidth),
		y: clamp((event.clientY - rect.top) * scale, 0, els.spriteSheetImage.naturalHeight),
	};
}

function startSheetDrag(event) {
	if (!els.spriteSheetImage.complete) return;
	event.preventDefault();
	const mapping = selectedMapping();
	const point = sheetPoint(event);
	const handle = event.target.dataset.handle;

	if (!handle && event.target === els.spriteSheetImage) {
		mapping.crop.x = point.x - mapping.crop.width / 2;
		mapping.crop.y = point.y - mapping.crop.height / 2;
		clampCrop(mapping.crop);
	}

	dragState = {
		type: handle ? "crop-resize" : "crop-move",
		handle,
		startPoint: point,
		startCrop: { ...mapping.crop },
	};
	window.addEventListener("pointermove", onSheetDrag);
	window.addEventListener("pointerup", endDrag, { once: true });
	syncControlsFromState();
	drawAll();
}

function onSheetDrag(event) {
	if (!dragState || !dragState.type.startsWith("crop")) return;
	const mapping = selectedMapping();
	const point = sheetPoint(event);
	const dx = point.x - dragState.startPoint.x;
	const dy = point.y - dragState.startPoint.y;
	const crop = { ...dragState.startCrop };

	if (dragState.type === "crop-move") {
		crop.x += dx;
		crop.y += dy;
	} else {
		if (dragState.handle.includes("w")) {
			crop.x += dx;
			crop.width -= dx;
		}
		if (dragState.handle.includes("e")) {
			crop.width += dx;
		}
		if (dragState.handle.includes("n")) {
			crop.y += dy;
			crop.height -= dy;
		}
		if (dragState.handle.includes("s")) {
			crop.height += dy;
		}
	}

	mapping.crop = crop;
	clampCrop(mapping.crop);
	saveState();
	syncControlsFromState();
	drawAll();
}

function stagePoint(event) {
	const rect = els.stageCanvas.getBoundingClientRect();
	return {
		x: (event.clientX - rect.left) * (els.stageCanvas.width / rect.width),
		y: (event.clientY - rect.top) * (els.stageCanvas.height / rect.height),
	};
}

function startStageDrag(event) {
	const point = stagePoint(event);
	const rect = currentOverlayRect();
	if (
		point.x < rect.x ||
		point.x > rect.x + rect.width ||
		point.y < rect.y ||
		point.y > rect.y + rect.height
	) {
		return;
	}

	const mapping = selectedMapping();
	dragState = {
		type: "overlay",
		startPoint: point,
		startOverlay: { ...mapping.overlay },
	};
	els.stageCanvas.classList.add("dragging");
	window.addEventListener("pointermove", onStageDrag);
	window.addEventListener("pointerup", endDrag, { once: true });
}

function onStageDrag(event) {
	if (!dragState || dragState.type !== "overlay") return;
	const point = stagePoint(event);
	const frame = stageFrame();
	const dx = (point.x - dragState.startPoint.x) / frame.zoom;
	const dy = (point.y - dragState.startPoint.y) / frame.zoom;
	const mapping = selectedMapping();
	mapping.overlay.x = Number((dragState.startOverlay.x + dx).toFixed(2));
	mapping.overlay.y = Number((dragState.startOverlay.y + dy).toFixed(2));
	saveState();
	syncControlsFromState();
	drawAll();
}

function endDrag() {
	window.removeEventListener("pointermove", onSheetDrag);
	window.removeEventListener("pointermove", onStageDrag);
	els.stageCanvas.classList.remove("dragging");
	dragState = null;
}

function fitOverlayToOriginal() {
	const sprite = selectedSprite();
	const mapping = selectedMapping();
	const { crop } = mapping;
	mapping.overlay.scale = Number(Math.min(sprite.width / crop.width, sprite.height / crop.height).toFixed(4));
	centerOverlay();
}

function centerOverlay() {
	const sprite = selectedSprite();
	const mapping = selectedMapping();
	const { crop, overlay } = mapping;
	overlay.x = Number(((sprite.width - crop.width * overlay.scale) / 2).toFixed(2));
	overlay.y = Number(((sprite.height - crop.height * overlay.scale) / 2).toFixed(2));
	saveState();
	syncControlsFromState();
	drawAll();
}

function centerCropOnSheet() {
	if (!els.spriteSheetImage.naturalWidth) return;
	const mapping = selectedMapping();
	mapping.crop.x = (els.spriteSheetImage.naturalWidth - mapping.crop.width) / 2;
	mapping.crop.y = (els.spriteSheetImage.naturalHeight - mapping.crop.height) / 2;
	clampCrop(mapping.crop);
	saveState();
	syncControlsFromState();
	drawAll();
}

function resetSelected() {
	const sprite = selectedSprite();
	state.mappings[sprite.id] = defaultMapping(sprite);
	saveState();
	syncControlsFromState();
	drawAll();
}

function exportData() {
	const cleanedMappings = {};
	for (const sprite of SPRITES) {
		if (state.mappings[sprite.id]) {
			cleanedMappings[sprite.id] = state.mappings[sprite.id];
		}
	}
	return {
		version: 1,
		sourceSheet: SHEET_PATH,
		sprites: SPRITES.map(({ id, label, file, width, height, drawXOffset }) => ({
			id,
			label,
			file,
			width,
			height,
			drawXOffset,
			ready: Boolean(state.mappings[id]?.ready),
		})),
		mappings: cleanedMappings,
	};
}

function updateJsonOutput() {
	els.jsonOutput.value = JSON.stringify(exportData(), null, 2);
}

async function copyJson() {
	updateJsonOutput();
	await navigator.clipboard.writeText(els.jsonOutput.value);
	els.copyJsonButton.textContent = "Copied";
	window.setTimeout(() => {
		els.copyJsonButton.textContent = "Copy JSON";
	}, 900);
}

function downloadJson() {
	updateJsonOutput();
	const blob = new Blob([`${els.jsonOutput.value}\n`], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "be-free-skier-sprite-tuning.json";
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);

	els.downloadJsonButton.textContent = "Downloaded";
	updateSaveStatus("Downloaded JSON backup");
	window.setTimeout(() => {
		els.downloadJsonButton.textContent = "Download JSON";
		updateSaveStatus();
	}, 1200);
}

function importJson() {
	const parsed = JSON.parse(els.jsonOutput.value);
	if (!parsed || !parsed.mappings) {
		throw new Error("JSON must include mappings.");
	}
	state.mappings = parsed.mappings;
	saveState();
	updateSaveStatus("Imported JSON and saved locally");
	syncControlsFromState();
	drawAll();
}

function bindEvents() {
	els.spriteSelect.addEventListener("change", () => selectSprite(els.spriteSelect.value));
	els.prevSpriteButton.addEventListener("click", () => moveSelection(-1));
	els.nextSpriteButton.addEventListener("click", () => moveSelection(1));
	els.fitButton.addEventListener("click", fitOverlayToOriginal);
	els.centerButton.addEventListener("click", centerOverlay);
	els.resetButton.addEventListener("click", resetSelected);
	els.centerCropButton.addEventListener("click", centerCropOnSheet);
	els.copyJsonButton.addEventListener("click", copyJson);
	els.downloadJsonButton.addEventListener("click", downloadJson);
	els.refreshJsonButton.addEventListener("click", updateJsonOutput);
	els.importJsonButton.addEventListener("click", () => {
		try {
			importJson();
		} catch (error) {
			window.alert(error.message);
		}
	});

	for (const input of [
		els.cropXInput,
		els.cropYInput,
		els.cropWInput,
		els.cropHInput,
		els.overlayXInput,
		els.overlayYInput,
		els.overlayScaleInput,
		els.overlayOpacityInput,
		els.stageZoomInput,
		els.originalOpacityInput,
	]) {
		input.addEventListener("input", updateStateFromInputs);
	}

	els.mappedCheckbox.addEventListener("change", updateStateFromInputs);
	els.sheetSurface.addEventListener("pointerdown", startSheetDrag);
	els.stageCanvas.addEventListener("pointerdown", startStageDrag);
	els.spriteSheetImage.addEventListener("load", () => {
		updateSheetScale();
		clampCrop(selectedMapping().crop);
		syncControlsFromState();
		drawAll();
	});

	for (const button of document.querySelectorAll("[data-sheet-zoom]")) {
		button.addEventListener("click", () => {
			const direction = button.dataset.sheetZoom;
			const delta = direction === "in" ? 0.04 : -0.04;
			state.sheetScale = clamp(Number((state.sheetScale + delta).toFixed(2)), 0.08, 1.5);
			saveState();
			syncControlsFromState();
			drawAll();
		});
	}

	window.addEventListener("resize", drawAll);
	window.addEventListener("keydown", (event) => {
		if (event.target.matches("input, textarea, select")) return;
		if (event.key === "ArrowLeft") {
			event.preventDefault();
			moveSelection(-1);
		}
		if (event.key === "ArrowRight") {
			event.preventDefault();
			moveSelection(1);
		}
	});
}

loadState();
buildSpriteList();
loadOriginalImages();
bindEvents();
selectedMapping();
syncControlsFromState();
drawAll();
