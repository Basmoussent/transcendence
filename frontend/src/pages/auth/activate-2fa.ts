import { getAuthToken } from '../../utils/auth';
import { reverse2FAState, userInfo } from '../social/utils';

// Exemple de page /tfa pour activer la 2FA
export function renderTFA() {
  const htmlContent = `
    <div class="tfa-wrapper">
      <div class="tfa-container">
        <div class="tfa-header">
          <button class="back-button" id="backBtn">
            <i class="fas fa-arrow-left"></i>
            Retour au profil
          </button>
          <h1>Authentification à deux facteurs</h1>
        </div>
        
        <div class="tfa-content">
          <div class="step-info">
            <p>Scannez le QR code avec votre application d'authentification Google Authenticator</p>
          </div>
          
          <div class="qr-section" id="qrSection">
            <div class="qr-placeholder">
              <i class="fas fa-qrcode"></i>
              <p>Génération du QR code...</p>
            </div>
          </div>
          
          <div class="verification-section">
            <label for="verificationCode">Entrez le code de vérification :</label>
            <input type="text" id="verificationCode" maxlength="6">
            <button class="activate-btn" id="activateBtn">
              <i class="fas fa-shield"></i>
              Activer 2FA
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <style>
      .tfa-wrapper {
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .tfa-container {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        padding: 30px;
        max-width: 500px;
        width: 100%;
        color: white;
      }
      
      .back-button {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        padding: 10px 20px;
        border-radius: 10px;
        cursor: pointer;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .back-button:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .verification-section {
        margin-top: 30px;
      }
      
      .verification-section label {
        display: block;
        margin-bottom: 10px;
      }
      
      .verification-section input {
        width: 100%;
        padding: 15px;
        border: none;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 18px;
        text-align: center;
        letter-spacing: 5px;
        margin-bottom: 20px;
      }
      
      .activate-btn {
        width: 100%;
        padding: 15px;
        background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
        border: none;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      .activate-btn:hover {
        transform: translateY(-2px);
      }
      
      .activate-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    </style>
  `;
  
  setTimeout(() => {
    const backBtn = document.getElementById('backBtn');
    const activateBtn = document.getElementById('activateBtn');
    const verificationCode = document.getElementById('verificationCode');
    
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.history.pushState({}, '', '/profil');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
    }
    
    if (activateBtn && verificationCode) {
      activateBtn.addEventListener('click', async () => {
        const code = verificationCode.value.trim();
        
        if (code.length !== 6) {
          alert('❌ Veuillez entrer un code à 6 chiffres');
          return;
        }
        
        try {
          const token = getAuthToken();
          if (!token) {
            alert('❌ Token d\'authentification manquant');
            window.history.pushState({}, '', '/login');
            window.dispatchEvent(new PopStateEvent('popstate'));
            return;
          }
          
          activateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Activation...';
          
          const response = await fetch('/api/enable-2fa', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': token
            },
            body: JSON.stringify({
              verification_code: code,
              secret_key: 'generated_secret_key' // À remplacer par la vraie clé générée
            })
          });
          
          const result = await response.json();
          
          if (response.ok) {
            alert('✅ Authentification à deux facteurs activée avec succès');

            // mettre le bool a true pour dire que la 2fa est activee
            const user = await userInfo();
            reverse2FAState(user.two_fact_auth, user.userId);

            window.history.pushState({}, '', '/profil');
            window.dispatchEvent(new PopStateEvent('popstate'));
          } else {
            alert(`❌ Erreur: ${result.error || 'Erreur inconnue'}`);
            activateBtn.innerHTML = '<i class="fas fa-shield"></i> Activer 2FA';
          }
        } catch (error) {
          console.error('Erreur lors de l\'activation 2FA:', error);
          alert('❌ Erreur lors de l\'activation de l\'authentification à deux facteurs');
          activateBtn.innerHTML = '<i class="fas fa-shield"></i> Activer 2FA';
        }
      });
    }
  }, 0);
  
  return htmlContent;
}