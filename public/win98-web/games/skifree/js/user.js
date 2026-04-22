// Tender OS stub: no sign-in, no leaderboard, no score sync.
// Provides the minimum surface game.js still references.
const dummyEl = () => ({ style: {}, src: "", disabled: false });
const dummyImg = () => ({ src: "" });

export default class User {
	constructor(game) {
		this.game = game;
		this.images = [];
		this.isLoggedIn = false;
		this.userData = { score: 0, username: "", _id: "" };
		this.leaderboardScoreCount = 0;

		this.logged_in = dummyImg();
		this.logged_in_inverted = dummyImg();
		this.logged_out = dummyImg();
		this.logged_out_inverted = dummyImg();

		this.profileImage = dummyEl();
		this.profileButton = dummyEl();
		this.signInButton = dummyEl();
		this.registerButton = dummyEl();
		this.chatButton = dummyEl();
	}

	loadAssets() {}
	signOut() {}
	validateLoginToken() {}
	refreshLeaderboard() {}
	isTextInputActive() { return false; }
}
