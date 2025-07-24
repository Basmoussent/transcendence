import { getAuthToken } from './auth';

export class WebSocketService {
	private ws: WebSocket | null = null;
	private pingInterval: number | null = null;
	private reconnectInterval: number | null = null;
	private isConnected = false;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000; // 1 seconde

	constructor() {
		// Démarrer la connexion WebSocket au chargement de la page
		this.connect();
		
		// Gérer la fermeture de la page pour nettoyer la connexion
		window.addEventListener('beforeunload', () => {
			this.disconnect();
		});
	}

	private connect() {
		try {
			const token = getAuthToken();
			if (!token) {
				console.log('❌ No auth token available for WebSocket connection');
				return;
			}

		// Construire l'URL WebSocket comme dans liveChat.ts
		const wsUrl = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/alive`;

		console.log('🔌 Connecting to WebSocket:', wsUrl);
		console.log('🔍 Debug info:', {
			protocol: window.location.protocol,
			hostname: window.location.hostname,
			host: window.location.host,
			wsUrl: wsUrl
		});
			
			this.ws = new WebSocket(wsUrl);

			this.ws.onopen = () => {
				console.log('✅ WebSocket connected');
				this.isConnected = true;
				this.reconnectAttempts = 0;
				
				// Envoyer le premier message d'authentification
				this.sendAuthMessage();
				
				// Démarrer le ping toutes les 10 secondes
				this.startPingInterval();
			};

			this.ws.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					this.handleMessage(data);
				} catch (error) {
					console.error('❌ Error parsing WebSocket message:', error);
				}
			};

			this.ws.onclose = (event) => {
				console.log('❌ WebSocket disconnected:', event.code, event.reason);
				this.isConnected = false;
				this.stopPingInterval();
				
				// Tenter de se reconnecter si ce n'est pas une fermeture volontaire
				if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
					this.scheduleReconnect();
				}
			};

			this.ws.onerror = (error) => {
				console.error('❌ WebSocket error:', error);
			};

		} catch (error) {
			console.error('❌ Error creating WebSocket connection:', error);
		}
	}

	private sendAuthMessage() {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			const token = getAuthToken();
			if (token) {
				const authMessage = {
					type: 'ping',
					token: token
				};
				this.ws.send(JSON.stringify(authMessage));
				console.log('🔐 Authentication message sent');
			}
		}
	}

	private stopPingInterval() {
		if (this.pingInterval) {
			clearInterval(this.pingInterval);
			this.pingInterval = null;
		}
	}

	private scheduleReconnect() {
		if (this.reconnectInterval) {
			clearTimeout(this.reconnectInterval);
		}
		
		this.reconnectAttempts++;
		const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Backoff exponentiel
		
		console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
		
		this.reconnectInterval = setTimeout(() => {
			console.log('🔄 Attempting to reconnect...');
			this.connect();
		}, delay);
	}

	private handleMessage(data: any) {
		switch (data.type) {
			case 'auth_success':
				console.log('✅ Authentication successful:', data);
				break;
				
			case 'auth_error':
				console.error('❌ Authentication failed:', data.message);
				this.disconnect();
				break;
				
			case 'pong':
				console.log('🔄 Pong received:', data);
				break;
				
			case 'error':
				console.error('❌ WebSocket error:', data.message);
				break;
				
			default:
				console.log('📨 Unknown message type:', data);
		}
	}

	public disconnect() {
		console.log('🔌 Disconnecting WebSocket...');
		
		// Arrêter les intervalles
		this.stopPingInterval();
		if (this.reconnectInterval) {
			clearTimeout(this.reconnectInterval);
			this.reconnectInterval = null;
		}
		
		// Fermer la connexion WebSocket
		if (this.ws) {
			this.ws.close(1000, 'User disconnected');
			this.ws = null;
		}
		
		this.isConnected = false;
	}

	public isConnectedToServer(): boolean {
		return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
	}

	// Méthode pour forcer une reconnexion
	public reconnect() {
		console.log('🔄 Forcing reconnection...');
		this.disconnect();
		setTimeout(() => {
			this.connect();
		}, 1000);
	}
}

// Instance singleton du service WebSocket
export const websocketService = new WebSocketService();

// Exporter l'instance pour une utilisation globale
export default websocketService; 