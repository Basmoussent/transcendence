import { Game, fetchUsername, getUuid, postGame } from '../../game/gameUtils'
import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';

export class Chat {

	private username: string;
	private ws: WebSocket;


	constructor(username: string) {

		this.username = username

		this.ws = new WebSocket(`${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/chat`);


		// this.chatInput.focus(); // recuperer le htmlelement du milieu
		this.setupWsEvents();
		this.setupClickEvents();
	}


	private setupWsEvents() {

		this.ws.onopen = () => {
			console.log(`${this.username} est connecte au live chat`)};

		this.ws.onerror = (error) => {
			console.error(`${this.username} onerror live chat: ${error}`)};

		this.ws.onclose = (event) => {
			console.log(`${this.username} part du live chat: ${event.code} ${event.reason}`)};
		
		this.ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				this.handleEvent(data);
			}
			catch (error) {
				console.error("Error JSON.parse onmessage:", error); }
		};
	}

	private handleEvent(data: any) {
		console.log(`live chat ws event : ${data.type}`)
		switch (data.type) {
			case 'chat_message':
				// 
				break;
			default:
				console.log(`pas bon le sang c'est quoi cet event`);
		}
	}

	private setupClickEvents() {
		// 
	}
}


