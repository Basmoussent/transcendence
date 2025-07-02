import { getAuthToken } from '../../utils/auth';
import { sanitizeHtml } from '../../utils/sanitizer';
import { t } from '../../utils/translations';

export async function renderHistory() {
  let historyData = [];

  try {
    const token = getAuthToken();
    if (!token) {
      alert('❌ Token d\'authentification manquant');
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return '';
    }

    const response = await fetch('/api/history', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      }
    });

    if (response.ok) {
      const result = await response.json();
      historyData = result.history || [];
    } else {
      console.error('Erreur lors de la récupération de l\'historique');
    }
  } catch (err) {
    console.error('Erreur lors de l\'affichage de l\'historique :', err);
  }

  const historyHtml = historyData.map(entry => {
    const opponent = sanitizeHtml(entry.opponent || 'Inconnu');
    const result = sanitizeHtml(entry.result || 'N/A');
    const date = new Date(entry.date).toLocaleString();

    return `
      <tr>
        <td>${opponent}</td>
        <td>${result}</td>
        <td>${date}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="history-page">
      <h1>${t('profile.gameHistory')}</h1>
      <table class="history-table">
        <thead>
          <tr>
            <th>${t('history.opponent')}</th>
            <th>${t('history.result')}</th>
            <th>${t('history.date')}</th>
          </tr>
        </thead>
        <tbody>
          ${historyHtml || `<tr><td colspan="3">${t('history.empty')}</td></tr>`}
        </tbody>
      </table>
    </div>

    <style>
      .history-page {
        padding: 30px;
        color: #fff;
        background-color: #1a1a2e;
        min-height: 100vh;
      }
      .history-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      .history-table th,
      .history-table td {
        padding: 12px;
        border: 1px solid #ccc;
        text-align: left;
      }
      .history-table th {
        background-color: #4a90e2;
        color: white;
      }
      .history-table tr:nth-child(even) {
        background-color: rgba(255, 255, 255, 0.05);
      }
    </style>
  `;
}
