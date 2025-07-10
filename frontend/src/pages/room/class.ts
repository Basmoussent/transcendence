export class Room {

	private ws: WebSocket;

	constructor(uuid: number) {

	
		this.ws = new WebSocket(`${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/room/${uuid}`);
		// this.ws.onmessage = (event) => this.onMessage(event, this.messages);
		this.ws.onerror = (error) => {
			console.error('❌ WebSocket error:', error)}
		this.ws.onclose = (event) => {
			console.log('🔌 Connection closed:', event.code, event.reason)}

		// this.setEvents();
	}

	private getElement(id: string): HTMLElement {
		const el = document.getElementById(id);
		if (!el)
			throw new Error(`Element "${id}" not found`);
		return el;
	}
}