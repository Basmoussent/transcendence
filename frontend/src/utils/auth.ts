// Utilitaires pour gérer l'authentification avec les cookies

function getCookieDomain(): string | undefined {
  const hostname = window.location.hostname;
  
  // Développement local
  if (hostname.includes('localhost')) {
    return undefined; // Pas de domaine pour localhost
  }
  
  // Production - extraire le domaine parent
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return `.${parts.slice(-2).join('.')}`; // .entropy.local
  }
  
  return undefined;
}

export function getAuthToken(): string | null {
  // Essayer d'abord de récupérer depuis localStorage (pour la compatibilité)
  const localToken = localStorage.getItem('x-access-token');
  if (localToken) {
    return localToken;
  }

  // Sinon, récupérer depuis les cookies
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
  // Stocker dans localStorage pour la compatibilité
  localStorage.setItem('x-access-token', token);
  
  // Stocker aussi dans un cookie pour le partage entre sous-domaines
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
  
  // Debug: afficher les cookies
  console.log('🍪 Cookies après setAuthToken:', document.cookie);
  console.log('🍪 Cookie string généré:', cookieString);
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
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

// Fonction de debug pour vérifier les cookies
export function debugCookies(): void {
  console.log('🍪 Tous les cookies:', document.cookie);
  console.log('🍪 Token depuis getAuthToken:', getAuthToken());
  console.log('🍪 Token depuis localStorage:', localStorage.getItem('x-access-token'));
} 