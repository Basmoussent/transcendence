import { getAuthToken } from '../../utils/auth';
import { update2FAState, userInfo } from '../social/utils';
import { generateOtpAuthUrl } from './utils';
import QRCode from 'qrcode';

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
              <i class="fa-solid fa-lock"></i>
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
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }
      
      .tfa-header h1 {
        text-align: center;
        margin-bottom: 30px;
        font-size: 24px;
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
        transition: all 0.3s ease;
      }
      
      .back-button:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }

      .step-info {
        text-align: center;
        margin-bottom: 30px;
      }

      .step-info p {
        font-size: 16px;
        line-height: 1.5;
      }

      .qr-section {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 30px;
        min-height: 200px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        padding: 20px;
      }

      .qr-placeholder {
        text-align: center;
        color: rgba(255, 255, 255, 0.7);
      }

      .qr-placeholder i {
        font-size: 48px;
        margin-bottom: 10px;
      }

      .qr-code-container {
        text-align: center;
      }

      .qr-code-container canvas {
        border-radius: 10px;
        background: white;
        padding: 10px;
      }


      
      .verification-section {
        margin-top: 30px;
      }
      
      .verification-section label {
        display: block;
        margin-bottom: 10px;
        font-weight: bold;
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
        box-sizing: border-box;
      }

      .verification-section input::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }

      .verification-section input:focus {
        outline: none;
        background: rgba(255, 255, 255, 0.2);
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
        transition: all 0.3s ease;
        font-size: 16px;
      }
      
      .activate-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
      }
      
      .activate-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .error-message {
        color: #e74c3c;
        text-align: center;
        margin-top: 10px;
        font-size: 14px;
      }

      .success-message {
        color: #2ecc71;
        text-align: center;
        margin-top: 10px;
        font-size: 14px;
      }
    </style>
  `;

  setTimeout(async () => {
    const backBtn = document.getElementById('backBtn');
    const activateBtn = document.getElementById('activateBtn') as HTMLInputElement;
    const verificationCode = document.getElementById('verificationCode') as HTMLInputElement;
    const qrSection = document.getElementById('qrSection');

    if (!qrSection) {
      throw new Error('qrSection element not found');
    }

    // Gestion du bouton retour
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.history.pushState({}, '', '/profil');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
    }

    try {
      // Récupération des informations utilisateur
      const info = await userInfo();
      const userEmail = info.user.email;
      const secret = info.user.secret_key;

      // generer l'url otp qui sera utilisee pour le qrcode
      const otpUrl = generateOtpAuthUrl(secret, userEmail, 'Transcendence');

      // generer et afficher le qrcode
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(otpUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        qrSection.innerHTML = `
          <div class="qr-code-container">
            <img src="${qrCodeDataUrl}" alt="2FA QRCode" style="border-radius: 10px;" />
          </div>
        `;
      } catch (qrError) {
        console.error('Erreur lors de la génération du QR code:', qrError);
        qrSection.innerHTML = `
          <div class="qr-placeholder">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Erreur lors de la génération du QR code</p>
          </div>
        `;
      }

    } catch (error) {
      console.error('Erreur lors du chargement des informations utilisateur:', error);
      qrSection.innerHTML = `
        <div class="qr-placeholder">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Erreur lors du chargement</p>
        </div>
      `;
    }

    // Gestion de l'activation 2FA
    if (activateBtn && verificationCode) {
      activateBtn.addEventListener('click', async () => {
        const code = verificationCode.value.trim();

        if (code.length !== 6) {
          alert('❌ Veuillez entrer un code à 6 chiffres');
          return;
        }
        
        const codeRegex = /^\d{6}$/;
        if (!codeRegex.test(code)) {
          alert('❌ Veuillez entrer des chiffres uniquement');
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

          // !!! check ici que le code est bon
          // attention doit etre fait cote serveur

          activateBtn.disabled = true;
          activateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Activation...';

          const info = await userInfo();
          const success = await update2FAState(1, info.user.id);

          if (success) {
            alert('✅ Authentification à deux facteurs activée avec succès');
            setTimeout(() => {
              window.history.pushState({}, '', '/profil');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }, 2000);
          }
          else {
            alert(`❌  Authentification à deux facteurs n'a pas pu etre activée'}`);
            activateBtn.disabled = false;
            activateBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Activer 2FA';
          }
        }
        catch (error) {
          console.error('Erreur lors de l\'activation 2FA:', error);
          alert('❌ Erreur lors de l\'activation de l\'authentification à deux facteurs');
          activateBtn.disabled = false;
          activateBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Activer 2FA';
        }
      });
    }
  }, 0);

  return htmlContent;
}
