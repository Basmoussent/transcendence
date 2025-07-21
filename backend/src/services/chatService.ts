interface User {
	username: string;
	isReady: boolean;
	avatar?: string;
}

interface RoomData {
	id: string;
	name: string;
	gameType: 'pong' | 'block';
	maxPlayers: number;
	users: User[];
	host: string;
	ai: number;
}

export class ChatService {

	private db: any;
  
	constructor(private database: any) {
		this.db = database;
	}

	async getChatId(user1: string, user2: string) {
		try {
			const chatId = await new Promise<any>((resolve, reject) => {
				this.db.get(
					'SELECT id FROM friends WHERE (user_1 = ? AND user_2 = ?) OR (user_1 = ? AND user_2 = ?)',
					[user1, user2, user2, user1],
					(err: any, row: any) => {
						err ? reject(err) : resolve(row);
					}
				);
			});
			console.log(`SELECT id FROM friends WHERE (user_1 = ? AND user_2 = ?) OR (user_1 = ? AND user_2 = ?)`, [user1, user2, user2, user1])
			console.log('chatId', chatId);
			return chatId?.id;
		} catch (error) {
			console.error('Error getting chat ID:', error);
			throw error;
		}
	}

	async retrieveChatHistory(user1: string, user2: string) {
		try {
			const chatId = await this.getChatId(user1, user2);
			if (!chatId) {
				return [];
			}
			const chatHistory = await new Promise<any[]>((resolve, reject) => {
				this.db.all(`
					SELECT m.*, m.sender_username 
					FROM messages m 
					WHERE m.chat_id = ? 
					ORDER BY m.created_at ASC`,
					[chatId], (err: any, rows: any[]) => {
						err ? reject(err) : resolve(rows || []);
					}
				);
			});
			return chatHistory;
		} catch (error) {
			console.error('Error retrieving chat history:', error);
			return [];
		}
	}

	async logChatMessage(user1: string, user2: string, message: string) {
		try {
			const chatId = await this.getChatId(user1, user2);

			if (!chatId)
				throw new Error('Chat not found - users must be friends');

			const result = await new Promise<any>((resolve, reject) => {
				this.db.run(
					'INSERT INTO messages (chat_id, sender_username, content) VALUES (?, ?, ?)',
					[chatId, user1, message],
					function(this: any, err: any) {
						err ? reject(err) : resolve(this);
					}
				);
			});
			return result;
		} catch (error) {
			console.error('Error logging chat message:', error);
			throw error;
		}
	}
}
