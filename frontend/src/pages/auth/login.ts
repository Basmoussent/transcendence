import { t } from '../../utils/translations';
import { login } from './class/login';

export function initializeLoginEvents() {
	console.log('Initializing login page events');
	try {
		new login();
	} catch (err: any) {
		console.log(err);
	}
}

export function renderLogin(): string {
	return `
	<div class="login-container">
		<main class="login-content">
			<div class="login-form-container">
				<h2>${t('auth.login.title')}</h2>
				
				<!-- Message de succès/erreur -->
				<div id="messageContainer" class="message-container" style="display: none;">
					<div id="messageContent" class="message-content"></div>
				</div>
				
				<form id="loginForm" class="login-form">
					<div class="form-group">
						<input type="text" id="username" name="username" placeholder="${t('auth.login.username')}" required>
					</div>
					<div class="form-group">
						<input type="password" id="password" name="password" placeholder="${t('auth.login.password')}" required>
					</div>
					<button type="submit" class="login-btn">${t('auth.login.submit')}</button>
				</form>
				<div class="login-options">
					<!-- <button id="forgot-password" class="link-button">${t('auth.login.forgotPassword')}</button> -->
					<button id="create-account" class="create-account-btn">
						${t('auth.login.createAccount')}
					</button>
				</div>
			</div>
		</main>
	</div>

	<style>
		.message-container {
			margin-bottom: 20px;
			padding: 12px 16px;
			border-radius: 8px;
			font-size: 14px;
			font-weight: 500;
			text-align: center;
			animation: slideDown 0.3s ease-out;
		}

		.message-container.success {
			background-color: #d4edda;
			border: 1px solid #c3e6cb;
			color: #155724;
		}

		.message-container.error {
			background-color: #f8d7da;
			border: 1px solid #f5c6cb;
			color: #721c24;
		}

		@keyframes slideDown {
			from {
				opacity: 0;
				transform: translateY(-10px);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}

		.link-button {
			background: none;
			border: none;
			color: #4a90e2;
			cursor: pointer;
			text-decoration: underline;
			font-size: 14px;
			padding: 5px 0;
			margin: 0 10px;
		}

		.link-button:hover {
			color: #357abd;
		}

		.create-account-btn {
			display: block;
			margin: 24px auto 0 auto;
			padding: 12px 32px;
			background: linear-gradient(135deg, #3B82F6 0%, #10B981 100%);
			color: white;
			border: none;
			border-radius: 8px;
			font-size: 1.1em;
			font-weight: bold;
			box-shadow: 0 4px 16px rgba(59,130,246,0.10);
			transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
			cursor: pointer;
		}
		.create-account-btn:hover {
			background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%);
			transform: translateY(-2px) scale(1.04);
			box-shadow: 0 8px 24px rgba(16,185,129,0.15);
		}
	</style>
	`;
}