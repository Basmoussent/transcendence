import { authenticator } from 'otplib';
import { generateOtpAuthUrl } from './utils';
import QRCode from 'qrcode';
import { db } from '../database';

function verifiyCode(userInputCode: string, secret: string): boolean {
    return authenticator.check(userInputCode, secret);
}

function displayQrcode(): void {
    try {
      // recup mail et secret_key du user
      const datab = db.getDatabase();
      


      const userEmail = 
      const userSecretKey = 

      // generer l'url otp qui sera utilisee pour le qrcode
      const otpUrl = generateOtpAuthUrl(userSecretKey, userEmail, 'Transcendence');

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
}