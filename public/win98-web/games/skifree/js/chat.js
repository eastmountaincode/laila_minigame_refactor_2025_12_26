// Tender OS stub: chat removed. game.js only calls showChat/hideChat.
export default class Chat {
	constructor(game) {
		this.game = game;
		this.isChatHidden = true;
	}
	showChat() {}
	hideChat() {}
	prependMessage() {}
}
