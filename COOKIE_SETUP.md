# Configuration du Système de Cookies pour les Sous-domaines

## Vue d'ensemble

Ce système permet de partager les cookies d'authentification entre les sous-domaines de langue (en, fr, es) et le domaine principal.

## Architecture

### Sous-domaines supportés
- `en.localhost` / `en.entropy.local` - Anglais
- `fr.localhost` / `fr.entropy.local` - Français  
- `es.localhost` / `es.entropy.local` - Espagnol

### Configuration des cookies

#### Côté Frontend (`frontend/src/utils/auth.ts`)
- **Domaine de cookie**: Automatiquement déterminé selon l'environnement
  - Localhost: `.localhost` (pour partager entre sous-domaines)
  - Production: `.entropy.local`
- **Sécurité**: `SameSite=Lax`, `HttpOnly` (côté serveur)
- **Durée**: 7 jours

#### Côté Backend (`backend/src/routes/authentication.ts`)
- **Route de login**: `/auth/login` - Crée le cookie d'authentification
- **Route de logout**: `/auth/logout` - Supprime le cookie
- **Détection automatique** du domaine selon l'environnement

## Fonctionnalités

### 1. Authentification partagée
- Connexion sur un sous-domaine → accessible sur tous les autres
- Token stocké dans un cookie avec le bon domaine
- Compatibilité avec localStorage pour le fallback

### 2. Changement de langue
- Boutons de langue dans `frontend/index.html`
- Redirection automatique vers le bon sous-domaine
- Conservation de l'état d'authentification

### 3. Gestion automatique des sous-domaines
- Redirection automatique vers `en.` si aucun sous-domaine
- Détection et gestion des environnements (localhost vs production)

## Tests

### Tests automatiques
Ouvrez la console du navigateur et exécutez :

```javascript
// Test basique du système de cookies
testCookieSystem();

// Test du partage entre sous-domaines
testCrossSubdomainCookies();

// Afficher les informations des cookies
showCookieInfo();

// Debug des cookies d'authentification
debugCookies();
```

### Tests manuels

1. **Test de connexion**:
   ```bash
   # Se connecter sur en.localhost
   curl -X POST http://localhost:8000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"test"}' \
     -c cookies.txt
   ```

2. **Test de partage**:
   - Connectez-vous sur `en.localhost`
   - Changez vers `fr.localhost` ou `es.localhost`
   - Vérifiez que vous êtes toujours connecté

3. **Test de logout**:
   ```bash
   curl -X POST http://localhost:8000/auth/logout \
     -b cookies.txt
   ```

## Configuration Nginx

Le fichier `docker/nginx/nginx.conf.template` est configuré pour :
- Rediriger HTTP vers HTTPS
- Gérer tous les sous-domaines de langue
- Proxifier les requêtes vers le frontend et backend
- Supporter les certificats SSL auto-signés

## Dépannage

### Problèmes courants

1. **Cookies non partagés**:
   - Vérifiez que le domaine est correct (`.localhost` ou `.entropy.local`)
   - Assurez-vous que `SameSite=Lax` est défini
   - Vérifiez les logs dans la console

2. **Redirection en boucle**:
   - Vérifiez la fonction `ensureSubdomain()` dans `index.html`
   - Assurez-vous que les sous-domaines sont bien configurés

3. **Authentification perdue**:
   - Vérifiez que le token est bien dans les cookies
   - Utilisez `debugCookies()` pour diagnostiquer

### Logs utiles

```javascript
// Dans la console du navigateur
console.log('Cookies:', document.cookie);
console.log('Hostname:', window.location.hostname);
console.log('Domain:', getCookieDomain()); // Fonction d'auth.ts
```

## Développement

### Ajouter un nouveau sous-domaine

1. Modifier `docker/nginx/nginx.conf.template`:
   ```nginx
   server_name fr.localhost en.localhost es.localhost de.localhost;
   ```

2. Modifier `frontend/index.html`:
   ```javascript
   const hasLanguageSubdomain = parts.length > 1 && ['en', 'fr', 'es', 'de'].includes(parts[0]);
   ```

3. Ajouter le bouton de langue dans le HTML

### Modifier la durée des cookies

1. **Frontend** (`auth.ts`):
   ```javascript
   let cookieString = `x-access-token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
   ```

2. **Backend** (`authentication.ts`):
   ```javascript
   `x-access-token=${token}; Path=/; Domain=${cookieDomain}; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; HttpOnly`
   ```

## Sécurité

- **HttpOnly**: Empêche l'accès JavaScript aux cookies côté serveur
- **SameSite=Lax**: Protection contre les attaques CSRF
- **Secure**: Automatiquement ajouté en HTTPS
- **Domaine restreint**: Limité au domaine parent

## Performance

- **Fallback localStorage**: Compatibilité avec l'ancien système
- **Cache des cookies**: Pas de requêtes supplémentaires
- **Redirection optimisée**: Changement de langue sans rechargement complet 