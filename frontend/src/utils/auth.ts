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
  
  // Debug: afficher les cookies
  console.log('Cookies après setAuthToken:', document.cookie);
  console.log('Cookie string généré:', cookieString);
  console.log('Domaine utilisé:', domain);
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

// Fonction pour changer de langue et rediriger
export function changeLanguageAndRedirect(lang: string): void {
  const baseDomain = getBaseDomain();
  const currentSubdomain = getCurrentSubdomain();
  
  // Si on est déjà sur le bon sous-domaine, ne rien faire
  if (currentSubdomain === lang) {
    return;
  }
  
  // Construire la nouvelle URL
  const protocol = window.location.protocol;
  const newHostname = `${lang}.${baseDomain}`;
  const newUrl = `${protocol}//${newHostname}${window.location.pathname}${window.location.search}${window.location.hash}`;
  
  console.log(`🔄 Changement de langue: ${currentSubdomain} -> ${lang}`);
  console.log(`🔄 Nouvelle URL: ${newUrl}`);
  
  window.location.href = newUrl;
}

// Fonction de debug pour vérifier les cookies
export function debugCookies(): void {
  console.log('Tous les cookies:', document.cookie);
  console.log('Token depuis getAuthToken:', getAuthToken());
  console.log('Token depuis localStorage:', localStorage.getItem('x-access-token'));
  console.log('Domaine de cookie:', getCookieDomain());
  console.log('Domaine de base:', getBaseDomain());
  console.log('Sous-domaine actuel:', getCurrentSubdomain());
  console.log('Hostname complet:', window.location.hostname);
}

// Fonction de logout
export async function logout(): Promise<void> {
  try {
    const token = getAuthToken();
    
    if (token) {
      // Appeler l'API de logout
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        credentials: 'include' // Important pour inclure les cookies
      });
      
      if (response.ok) {
        console.log('✅ Logout réussi côté serveur');
      } else {
        console.warn('⚠️ Erreur lors du logout côté serveur:', response.status);
      }
    }
  } catch (error) {
    console.error('❌ Erreur réseau lors du logout:', error);
  } finally {
    // Toujours nettoyer côté client
    removeAuthToken();
    console.log('✅ Logout terminé côté client');
    
    // Rediriger vers la page de login
    window.location.href = '/login';
  }
} 