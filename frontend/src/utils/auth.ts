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

// Fonction pour obtenir le domaine de base (sans sous-domaine)
function getBaseDomain(): string {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  if (hostname.includes('localhost')) {
    if (parts.length > 1) {
      return parts.slice(-1).join('.'); // localhost
    }
    return hostname;
  }
  
  if (parts.length >= 2) {
    return parts.slice(-2).join('.'); // entropy.local
  }
  
  return hostname;
}

// Fonction pour obtenir le sous-domaine actuel
function getCurrentSubdomain(): string {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  if (hostname.includes('localhost')) {
    if (parts.length > 1) {
      return parts[0]; // fr, en, es
    }
    return 'en'; // Par défaut
  }
  
  if (parts.length >= 3) {
    return parts[0]; // fr, en, es
  }
  
  return 'en'; // Par défaut
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
