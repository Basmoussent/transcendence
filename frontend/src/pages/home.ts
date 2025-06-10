import '../style.css';

export function renderHome(): string {

return `
  <div class=home>
  <header class="top-header">
    <h1 class="site-title">Pong</h1>
  </header>
  
  <main class="main-content">
    <div class="preview-container">
      <video class="preview-video" autoplay loop muted>
        <source src="/preview-pong.mp4" type="video/mp4">
        <!-- Fallback pour navigateurs qui ne supportent pas la vidéo -->
        <div class="video-fallback">
          <div class="pong-demo">
            <div class="ball"></div>
            <div class="paddle paddle-left"></div>
            <div class="paddle paddle-right"></div>
          </div>
        </div>
      </video>
      <div class="preview-overlay">
        <h2>Découvrez Pong</h2>
        <p>Une expérience de jeu classique revisitée</p>
      </div>
    </div>
  </main>
  </div>
  <div class="connexion">
  <button id="loginBtn" class="login-btn">Connexion</button>
  </div>

`;

}

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  loginBtn?.addEventListener('click', () => {
    window.location.href = '/login';
  });
});
