import { makingGame } from "./makingGame";

export function renderLocal() {
const html = `
	<div class="game-page">
	<div class="game-container">
		<div class="game-header">
		<h1>Create a Game</h1>
		</div>
		<button class="home-button" id="homeBtn">
		<i class="fas fa-home"></i>
		Home
		</button>

		<div class="button-group-row">
		<button class="game-button pong-button" id="pongBtn">
			<i class="fas fa-table-tennis"></i>
			Pong
		</button>
		<button class="game-button brick-button" id="brickBtn">
			<i class="fas fa-th"></i>
			Brick
		</button>
		</div>

		<div class="button-group-row player-buttons">
		<button class="player-button" id="1playerBtn">
			<i class="fas fa-user"></i>
			1 Player
		</button>
		<button class="player-button" id="2playerBtn">
			<i class="fas fa-user-friends"></i>
			2 Players
		</button>
		<button class="player-button" id="3playerBtn">
			<i class="fas fa-users"></i>
			3 Players
		</button>
		<button class="player-button" id="4playerBtn">
			<i class="fas fa-users-cog"></i>
			4 Players
		</button>
		</div>
	</div>
	</div>

	<style>
	.game-page {
	padding: 20px;
	display: flex;
	justify-content: center;
	align-items: center;
	text-align: center;
	color: white;
	font-family: 'Arial', sans-serif;
	}

	.game-container {
	width: 95%;
	max-width: 90%;
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(10px);
	border-radius: 20px;
	padding: 30px;
	box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
	border: 1px solid rgba(255, 255, 255, 0.18);
	animation: fadeIn 0.5s ease-out;
	}

	.game-header h1 {
	font-size: 2.5em;
	margin-bottom: 30px;
	text-transform: uppercase;
	letter-spacing: 2px;
	}

	.home-button {
	position: absolute;
	top: 20px;
	left: 20px;
	padding: 10px 15px;
	font-size: 1em;
	border: none;
	border-radius: 10px;
	background: rgba(255, 255, 255, 0.1);
	color: white;
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: pointer;
	transition: all 0.3s ease;
	}

	.home-button:hover {
	background: rgba(255, 255, 255, 0.2);
	transform: translateY(-2px);
	}

	.button-group-row {
	display: flex;
	justify-content: center;
	gap: 20px;
	margin: 10px 0;
	}

	.game-button, .player-button {
	padding: 15px 30px;
	font-size: 1.2em;
	border: none;
	border-radius: 10px;
	color: white;
	cursor: pointer;
	transition: all 0.3s ease;
	display: flex;
	align-items: center;
	gap: 10px;
	font-weight: bold;
	}

	.game-button:hover, .player-button:hover {
	transform: translateY(-3px);
	box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
	}

	player-button-grise:hover {
		transform: translateY(0px);
		box-shadow: 0 6px 70px rgba(0, 0, 0, 0.25);
	}

	.pong-button {
	background: linear-gradient(135deg, #4a90e2 0%, #8DA1B9 100%);
	}

	.brick-button {
	background: linear-gradient(135deg, #474973 0%, #03254E 100%);
	}

	.chosen-button {
	background: linear-gradient(135deg, #474973 0%, #7B0D1E 100%);
	}

	.player-button {
	background: linear-gradient(135deg, #EF959C 0%, #95ADB6 100%);
	}

	.player-button-grise {
		background: linear-gradient(135deg, #E3E3E3 0%, #5B5750 100%);
		pointer-events: none;
		opacity: 0.32

	}

	@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
	}

	@media (max-width: 768px) {
	.game-header h1 {
		font-size: 2em;
	}
	.button-group-row {
		flex-direction: column;
		align-items: center;
		gap: 15px;
	}
	.game-button, .player-button {
		width: 80%;
		justify-content: center;
	}
	}
	</style>
	`;

	setTimeout(() => {
		console.log('Initializing game making page');
		try {
			const mkgame = new makingGame();
		}
		catch (err:any) {
			console.log(err);
		}
	}, 0);

	return html;

}