export class makingGame {

	private pong: boolean;
	private brick: boolean;
	private _1player: boolean;
	private _2player: boolean;
	private _3player: boolean;
	private _4player: boolean;

	private homeBtn: HTMLElement;
	private pongBtn: HTMLElement;
	private brickBtn: HTMLElement;
	private _1playerBtn: HTMLElement;
	private _2playerBtn: HTMLElement;
	private _3playerBtn: HTMLElement;
	private _4playerBtn: HTMLElement;
	private launchBtn: HTMLElement;
	private resetBtn: HTMLElement;

	constructor() {
		this.homeBtn = this.getElement('homeBtn');
		this.pongBtn = this.getElement('pongBtn');
		this.brickBtn = this.getElement('brickBtn');
		this._1playerBtn = this.getElement('1playerBtn');
		this._2playerBtn = this.getElement('2playerBtn');
		this._3playerBtn = this.getElement('3playerBtn');
		this._4playerBtn = this.getElement('4playerBtn');
		this.launchBtn = this.getElement('launchBtn');
		this.resetBtn = this.getElement('resetBtn');

		this.pong = false;
		this.brick = false;
		this._1player = false;
		this._2player = false;
		this._3player = false;
		this._4player = false;

		this.setEvents();
	}

	private getElement(id: string): HTMLElement {
		const el = document.getElementById(id);
		if (!el)
			throw new Error(`Element "${id}" not found`);
		return el;
	}

	private currentOptions(): void {
		console.log('Game Mode States:', {
			brick: this.brick,
			pong: this.pong,
			_1player: this._1player,
			_2player: this._2player,
			_3player: this._3player,
			_4player: this._4player
			});
	}

	private setEvents(): void {


		this.homeBtn.addEventListener('click', () => {
			// window.history.pushState({}, '', '/main');
			// window.dispatchEvent(new PopStateEvent('popstate'));
			this.currentOptions();
		});

		this.pongBtn.addEventListener('click', () => {

			if (this.pong)
				return ;

			this.pong = true;
			this.pongBtn.classList.add("chosen-button");
			this._3playerBtn.classList.remove("player-button-grise");
			this._4playerBtn.classList.remove("player-button-grise");
			
			if (this.brick) {
				this.brick = false;
				this.brickBtn.classList.remove("chosen-button");
			}
		});

		this.brickBtn.addEventListener('click', () => {
			if (this.brick)
				return ;

			this.brick = true;
			this.brickBtn.classList.add("chosen-button");
			this._3playerBtn.classList.add("player-button-grise");
			this._4playerBtn.classList.add("player-button-grise");
			this._3player = false;
			this._4player = false;

			if (this.pong) {
				this.pong = false;
				this.pongBtn.classList.remove("chosen-button");
			}
		});

		this._1playerBtn.addEventListener('click', () => {
			if (this._1player)
				return ;
			this._1player = !this._1player;
			if (this._1player) {
				this._2player = false;
				this._3player = false;
				this._4player = false;
			}
		});

		this._2playerBtn.addEventListener('click', () => {
			if (this._2player)
				return ;
			this._2player = !this._2player;
			if (this._2player) {
				this._1player = false;
				this._3player = false;
				this._4player = false;
			}
		});

		this._3playerBtn.addEventListener('click', () => {

			if (this._3player)
				return ;

			if (this.brick)
				return ;

			this._3player = !this._3player;
			if (this._3player) {
				this._1player = false;
				this._2player = false;
				this._4player = false;
			}

		});

		this._4playerBtn.addEventListener('click', () => {

			if (this._4player)
				return ;

			if (this.brick)
				return ;

			this._4player = !this._4player;
			if (this._4player) {
				this._1player = false;
				this._2player = false;
				this._3player = false;
			}

		});

		this.launchBtn.addEventListener('click', () => {

			if (this.pong)
				window.history.pushState({}, '', '/pong');
			else
				window.history.pushState({}, '', '/block');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});

		this.resetBtn.addEventListener('click', () => {

			this.pong = false;
			
			this.brick = false;
			this._1player = false;
			this._2player = false;
			this._3player = false;
			this._4player = false;

			this.pongBtn.classList.remove("chosen-button");
			this.brickBtn.classList.remove("chosen-button");
			this._1playerBtn.classList.remove("chosen-button");
			this._2playerBtn.classList.remove("chosen-button");
			this._3playerBtn.classList.remove("chosen-button");
			this._4playerBtn.classList.remove("chosen-button");
			this._3playerBtn.classList.remove("player-button-grise");
			this._4playerBtn.classList.remove("player-button-grise");

		});


	}
}
