export class Block {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private width: number;
	private height: number;
	private paddle: {
		width: number;
		height: number;
		x: number;
		y: number;
		speed: number;
	};
	private keys: { [key: string]: boolean };
	private touchStartX: number | null;
	private bricks: {
		x: number;
		y: number;
		width: number;
		height: number;
		color: string;
	}[];
  
	constructor(canvas: HTMLCanvasElement) {
	  this.canvas = canvas;
	  const context = canvas.getContext('2d');
	  if (!context) {
		throw new Error('Could not get 2D context');
	  }
	  this.ctx = context;
	  this.width = canvas.width;
	  this.height = canvas.height;
	  
	  // Initialiser la raquette
	  this.paddle = {
		width: 100,
		height: 20,
		x: 0,
		y: 0,
		speed: 10
	  };

	  this.keys = {};
	  this.touchStartX = null;
	  this.bricks = [];
	}
  
	public init(): void {
	  console.log('Initializing game...');
	  this.setupCanvas();
	  this.setupEventListeners();
	  this.createBricks();
	  this.startGameLoop();
	  
	  // Ajouter un écouteur pour le redimensionnement
	  window.addEventListener('resize', () => {
		this.setupCanvas();
		this.createBricks();
	  });
	}

	private createBricks(): void {
	  this.bricks = [];
	  const brickWidth = 80;
	  const brickHeight = 30;
	  const padding = 10;
	  const rows = 5;
	  const cols = Math.floor((this.width - padding) / (brickWidth + padding));
	  
	  // Choisir une position aléatoire pour la brique dorée
	  const goldenRow = Math.floor(Math.random() * rows);
	  const goldenCol = Math.floor(Math.random() * cols);

	  for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
		  const x = col * (brickWidth + padding) + padding;
		  const y = row * (brickHeight + padding) + padding + 50; // Commencer un peu plus bas
		  
		  this.bricks.push({
			x,
			y,
			width: brickWidth,
			height: brickHeight,
			color: (row === goldenRow && col === goldenCol) ? '#FFD700' : '#e74c3c'
		  });
		}
	  }
	}

	private setupEventListeners(): void {
	  // Gestion des touches du clavier
	  window.addEventListener('keydown', (e) => {
		this.keys[e.key.toLowerCase()] = true;
	  });

	  window.addEventListener('keyup', (e) => {
		this.keys[e.key.toLowerCase()] = false;
	  });

	  // Gestion des événements tactiles
	  this.canvas.addEventListener('touchstart', (e) => {
		e.preventDefault();
		const touch = e.touches[0];
		const rect = this.canvas.getBoundingClientRect();
		this.touchStartX = touch.clientX - rect.left;
	  });

	  this.canvas.addEventListener('touchmove', (e) => {
		e.preventDefault();
		if (this.touchStartX === null) return;

		const touch = e.touches[0];
		const rect = this.canvas.getBoundingClientRect();
		const touchX = touch.clientX - rect.left;
		const deltaX = touchX - this.touchStartX;

		// Mettre à jour la position de la raquette
		this.paddle.x += deltaX;
		this.touchStartX = touchX;

		// Limiter la position de la raquette aux bords du canvas
		if (this.paddle.x < 0) {
		  this.paddle.x = 0;
		} else if (this.paddle.x + this.paddle.width > this.width) {
		  this.paddle.x = this.width - this.paddle.width;
		}
	  });

	  this.canvas.addEventListener('touchend', () => {
		this.touchStartX = null;
	  });
	}
  
	private setupCanvas(): void {
	  console.log('Setting up canvas...');
	  // Configuration du canvas avec une taille plus grande
	  this.canvas.width = this.canvas.clientWidth || 1200;
	  this.canvas.height = this.canvas.clientHeight || 800;
	  this.width = this.canvas.width;
	  this.height = this.canvas.height;
	  
	  // Mettre à jour la position de la raquette
	  this.paddle.x = (this.width - this.paddle.width) / 2;
	  this.paddle.y = this.height - this.paddle.height - 20;
	  
	  console.log('Canvas size:', this.width, this.height);
	  console.log('Paddle position:', this.paddle.x, this.paddle.y);
	}
  
	private startGameLoop(): void {
	  console.log('Starting game loop...');
	  // Boucle principale du jeu
	  const gameLoop = () => {
		this.update();
		this.render();
		requestAnimationFrame(gameLoop);
	  };
	  gameLoop();
	}
  
	private update(): void {
	  // Gestion des touches du clavier
	  if (this.keys['a'] || this.keys['arrowleft']) {
		this.paddle.x -= this.paddle.speed;
	  }
	  if (this.keys['d'] || this.keys['arrowright']) {
		this.paddle.x += this.paddle.speed;
	  }

	  // Limiter la position de la raquette aux bords du canvas
	  if (this.paddle.x < 0) {
		this.paddle.x = 0;
	  } else if (this.paddle.x + this.paddle.width > this.width) {
		this.paddle.x = this.width - this.paddle.width;
	  }
	}
  
	private render(): void {
	  // Effacer le canvas
	  this.ctx.clearRect(0, 0, this.width, this.height);
	  
	  // Définir la couleur de fond
	  this.ctx.fillStyle = '#1a1a2e';
	  this.ctx.fillRect(0, 0, this.width, this.height);
	  
	  // Dessiner les briques
	  this.bricks.forEach(brick => {
		this.ctx.fillStyle = brick.color;
		this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
		
		// Ajouter un contour pour chaque brique
		this.ctx.strokeStyle = '#ffffff';
		this.ctx.lineWidth = 2;
		this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
	  });
	  
	  // Dessiner la raquette
	  this.ctx.fillStyle = '#4a90e2';
	  this.ctx.fillRect(
		this.paddle.x,
		this.paddle.y,
		this.paddle.width,
		this.paddle.height
	  );
	  
	  // Dessiner un contour pour la raquette pour la rendre plus visible
	  this.ctx.strokeStyle = '#ffffff';
	  this.ctx.lineWidth = 2;
	  this.ctx.strokeRect(
		this.paddle.x,
		this.paddle.y,
		this.paddle.width,
		this.paddle.height
	  );
	}
}