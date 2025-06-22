// Test des cookies pour vérifier le fonctionnement sur les sous-domaines

export function testCookieSystem(): void {
  console.log('🧪 Test du système de cookies');
  console.log('========================');
  
  // Test 1: Vérifier l'environnement actuel
  console.log('📍 Environnement:');
  console.log('  - Hostname:', window.location.hostname);
  console.log('  - Protocol:', window.location.protocol);
  console.log('  - URL complète:', window.location.href);
  
  // Test 2: Vérifier les cookies existants
  console.log('🍪 Cookies actuels:');
  console.log('  - Tous les cookies:', document.cookie);
  
  // Test 3: Tester la création d'un cookie de test
  console.log('🧪 Test de création de cookie:');
  const testValue = `test-${Date.now()}`;
  const testCookie = `test-cookie=${testValue}; path=/; max-age=3600`;
  document.cookie = testCookie;
  console.log('  - Cookie de test créé:', testCookie);
  
  // Test 4: Vérifier que le cookie a été créé
  setTimeout(() => {
    console.log('  - Cookies après création:', document.cookie);
    
    // Test 5: Supprimer le cookie de test
    document.cookie = 'test-cookie=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    console.log('  - Cookie de test supprimé');
    
    setTimeout(() => {
      console.log('  - Cookies après suppression:', document.cookie);
      console.log('✅ Test terminé');
    }, 100);
  }, 100);
}

// Fonction pour tester le partage de cookies entre sous-domaines
export function testCrossSubdomainCookies(): void {
  console.log('🌐 Test du partage de cookies entre sous-domaines');
  console.log('==============================================');
  
  const currentHostname = window.location.hostname;
  const parts = currentHostname.split('.');
  
  // Déterminer le domaine de base
  let baseDomain;
  if (currentHostname.includes('localhost')) {
    if (parts.length > 1) {
      baseDomain = parts.slice(-1).join('.'); // localhost
    } else {
      baseDomain = currentHostname; // localhost simple
    }
  } else {
    baseDomain = parts.slice(-2).join('.'); // entropy.local
  }
  
  console.log('  - Domaine de base:', baseDomain);
  console.log('  - Sous-domaines à tester:', ['en', 'fr', 'es']);
  
  // Créer un cookie partagé
  const sharedValue = `shared-${Date.now()}`;
  let cookieString = `shared-cookie=${sharedValue}; path=/; max-age=3600`;
  
  // Ajouter le domaine si nécessaire
  if (baseDomain !== 'localhost') {
    cookieString += `; domain=.${baseDomain}`;
  }
  
  document.cookie = cookieString;
  console.log('  - Cookie partagé créé:', cookieString);
  
  // Instructions pour tester manuellement
  console.log('📋 Instructions de test manuel:');
  console.log('  1. Notez la valeur du cookie partagé:', sharedValue);
  console.log('  2. Changez de sous-domaine (en, fr, es)');
  console.log('  3. Vérifiez que le cookie est toujours présent');
  console.log('  4. Vérifiez la valeur dans la console avec:');
  console.log('     document.cookie');
}

// Fonction pour afficher les informations de debug
export function showCookieInfo(): void {
  console.log('ℹ️ Informations sur les cookies');
  console.log('============================');
  
  const cookies = document.cookie.split(';');
  console.log('  - Nombre de cookies:', cookies.length);
  
  cookies.forEach((cookie, index) => {
    const [name, value] = cookie.trim().split('=');
    console.log(`  ${index + 1}. ${name}: ${value}`);
  });
  
  if (cookies.length === 0) {
    console.log('  - Aucun cookie trouvé');
  }
}

// Exposer les fonctions globalement pour les tests
if (typeof window !== 'undefined') {
  (window as any).testCookieSystem = testCookieSystem;
  (window as any).testCrossSubdomainCookies = testCrossSubdomainCookies;
  (window as any).showCookieInfo = showCookieInfo;
} 