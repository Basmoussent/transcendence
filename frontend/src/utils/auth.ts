// Utilitaires pour gérer l'authentification avec les cookies

function getCookieDomain(): string | undefined {
  const hostname = window.location.hostname;
  
  // Développement local
  if (hostname.includes('localhost')) {
    // Pour localhost, on utilise le domaine parent pour partager entre sous-domaines
    const parts = hostname.split('.');
    if (parts.length > 1) {
      return `.${parts.slice(-1).join('.')}`; // .localhost
    }
    return undefined; // Pas de domaine pour localhost simple
  }
  
  // Production - extraire le domaine parent
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return `.${parts.slice(-2).join('.')}`; // .entropy.local
  }
  
  return undefined;
}

export function getAuthToken(): string | null {
  const localToken = localStorage.getItem('x-access-token');
  if (localToken) {
    return localToken;
  }

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'x-access-token') {
      return value;
    }
  }
  return null;
}

export function setAuthToken(token: string): void {
  localStorage.setItem('x-access-token', token);
  
  const domain = getCookieDomain();
  const isSecure = window.location.protocol === 'https:';
  
  let cookieString = `x-access-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  
  if (domain) {
    cookieString += `; domain=${domain}`;
  }
  
  if (isSecure) {
    cookieString += '; Secure';
  }
  
  document.cookie = cookieString;
}

export function removeAuthToken(): void {
  // Supprimer de localStorage
  localStorage.removeItem('x-access-token');
  
  // Supprimer le cookie
  const domain = getCookieDomain();
  let cookieString = 'x-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  
  if (domain) {
    cookieString += `; domain=${domain}`;
  }
  
  document.cookie = cookieString;
  
  // Debug: afficher les cookies après suppression
  console.log('Cookies après removeAuthToken:', document.cookie);
  console.log('Cookie string de suppression:', cookieString);
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

export  function initAlive()
{
  const socket = new WebSocket(`${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/alive`);

  socket.addEventListener('open', () => {
    console.log('🔌 WebSocket connected');

    setInterval(() => {
      console.log('🔌 WebSocket readyState:', socket.readyState);
      if (socket.readyState === WebSocket.OPEN) {
        console.log('🔌 WebSocket ping sent');
        socket.send('ping');
      }
    }, 10000);
  });
}
