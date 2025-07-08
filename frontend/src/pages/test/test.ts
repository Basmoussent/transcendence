const getTemplate = () => {
  return `
	<div class="chat-container">
		<div class="messages" id="chatMessages">
		<!-- Messages s'afficheront ici -->
			<div class="message">Bienvenue dans le chat !</div>
		</div>
		<div class="input-container">
			<input type="text" id="messageInput" placeholder="Écris ton message..." />
			<button onclick="sendMessage()">Envoyer</button>
		</div>
	</div>

	<script>
		function sendMessage() {
		const input = document.getElementById('messageInput');
		const message = input.value.trim();
		if (message !== '') {
			const chatMessages = document.getElementById('chatMessages');
			const newMsg = document.createElement('div');
			newMsg.classList.add('message');
			newMsg.textContent = message;
			chatMessages.appendChild(newMsg);
			chatMessages.scrollTop = chatMessages.scrollHeight;
			input.value = '';
		}
		}

		// Optionnel : Entrée clavier pour envoyer
		document.getElementById("messageInput").addEventListener("keydown", function(e) {
		if (e.key === "Enter") {
			sendMessage();
		}
		});
	</script>
	</body>

	<style>
		* {
			box-sizing: border-box;
			margin: 0;
			padding: 0;
			font-family: sans-serif;
		}

		body, html {
			height: 100%;
			background: #f0f0f0;
		}

		.chat-container {
			display: flex;
			flex-direction: column;
			height: 100%;
			width: 100%;
		}

		.messages {
			flex: 1;
			padding: 16px;
			overflow-y: auto;
			background: #2c2c2c;

		}

		.message {
			margin-bottom: 12px;
			padding: 10px 14px;
			border-radius: 10px;
			max-width: 70%;
			background: #3a3a3a;
			color: white;
		}

		.input-container {
			display: flex;
			padding: 10px;
			border-top: 1px solid #ccc;
			background: #1e1e1e;
		}

		.input-container input[type="text"] {
			flex: 1;
			padding: 10px;
			border: 1px solid #ccc;
			border-radius: 20px;
			font-size: 16px;
			outline: none;
			background-color: #333;
			color: #f0f0f0;
			border: 1px solid #555;
		}

		.input-container button {
			margin-left: 10px;
			padding: 10px 20px;
			background-color: #007bff;
			border: none;
			border-radius: 20px;
			color: white;
			cursor: pointer;
			font-size: 16px;
			transition: background-color 0.3s;
		}

		.input-container button:hover {
			background-color: #0056b3;
		}
	</style>


	</html>`;
}


export function renderTest() {

	// setTimeout(async () => {
	// 	console.log('Initializing test page');
	// 	try {
	// 	}
	// 	catch (err:any) {
	// 		console.log(err);
	// 	}
	// }, 0);

	return getTemplate();

}