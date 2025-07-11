export class Test {

	private input: HTMLInputElement;
	private messages: HTMLElement;
	private sendBtn: HTMLElement;
	private ws: WebSocket;

	constructor() {

		this.input = this.getElement('messageInput') as HTMLInputElement;
		this.messages = this.getElement('chatMessages');
		this.sendBtn = this.getElement('sendButton')
		this.ws = new WebSocket(`${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws`);
		this.ws.onmessage = (event) => this.onMessage(event, this.messages);

		this.ws.onopen = () => {
			console.log(` vient de se connecter a la room`)}

		this.ws.onerror = (error) => {
			console.error('❌ WebSocket error:', error)}
		this.ws.onclose = (event) => {
			console.log('🔌 Connection closed:', event.code, event.reason)}

		this.setupEvents();
	}

	private getElement(id: string): HTMLElement {
		const el = document.getElementById(id);
		if (!el)
			throw new Error(`Element "${id}" not found`);
		return el;
	}

	private sendMessage(): void {
		const message = this.input.value.trim();
		const newMsg = document.createElement('div');
		
		newMsg.classList.add('message');
		newMsg.textContent = message;
		this.messages.appendChild(newMsg);
		this.messages.scrollTop = this.messages.scrollHeight;
		this.input.value = '';
		this.ws.send(message);
		console.log("Message sent:", message);
	}

	private onMessage(event: MessageEvent<any>, messages: any): void {

		const message = event.data.toString().trim();
		const newMsg = document.createElement('div');
		
		newMsg.classList.add('message');
		newMsg.textContent = message;
		messages.appendChild(newMsg);
		messages.scrollTop = messages.scrollHeight;
	}

	private setupEvents(): void {
		this.input.addEventListener("keydown", (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				this.sendMessage();}
		});

		this.sendBtn.addEventListener("click", () => {
			this.sendMessage();

		});
	}

}