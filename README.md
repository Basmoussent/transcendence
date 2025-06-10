# Transcendence - 42 School Project

## 🎮 Overview
This project involves undertaking tasks you have never done before.
Remember the beginning of your journey in computer science.
Look at you now; it’s time to shine!

## 🏗️ Architecture

### Frontend
- **Technologie**: TypeScript pur avec Vite
- **Structure**:
  ```
  frontend/
  ├── src/
  │   ├── game/         # Logique du jeu Pong
  │   ├── utils/        # Fonctions utilitaires
  │   ├── services/     # Services (API, WebSocket)
  │   └── components/   # Composants UI réutilisables
  ├── Dockerfile
  └── package.json
  ```

### Backend
- **Technologie**: Fastify (Node.js)
- **Base de données**: SQLite
- **Structure**:
  ```
  backend/
  ├── src/
  │   ├── routes/       # Routes API
  │   ├── services/     # Logique métier
  │   ├── models/       # Modèles de données
  │   └── websocket/    # Gestion WebSocket
  ├── Dockerfile
  └── package.json
  ```

### Monitoring
- **Prometheus**: Collecte des métriques
- **Grafana**: Visualisation des données

## 🚀 Installation et Lancement

1. **Prérequis**
   - Docker
   - Docker Compose
   - Make

2. **Lancement du projet**
   ```bash
   # Construire et démarrer tous les services
   make

   # Pour arrêter les services
   make down

   # Pour nettoyer (supprime les conteneurs et images)
   make clean

   # Pour reconstruire et redémarrer
   make re
   ```

3. **Accès aux services**

   ### Depuis Linux (WSL2)
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001

   ### Depuis Windows
   Pour accéder aux services depuis Windows, utilisez l'adresse IP de votre WSL2 :
   ```bash
   # Pour obtenir l'adresse IP de votre WSL2
   ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1
   ```
   Puis accédez aux services via :
   - Frontend: http://<WSL2_IP>:5173
   - Backend API: http://<WSL2_IP>:8000
   - Prometheus: http://<WSL2_IP>:9090
   - Grafana: http://<WSL2_IP>:3001

   Note: Si vous ne pouvez pas accéder aux services depuis Windows, vérifiez que :
   1. WSL2 est correctement configuré
   2. Les ports ne sont pas bloqués par votre pare-feu Windows
   3. Docker Desktop est en cours d'exécution

## 🎯 Fonctionnalités

### Jeu
- Pong en temps réel
- Support multijoueur
- Système de tournoi
- Personnalisation du jeu

### Social
- Chat en temps réel
- Profils utilisateurs
- Système d'amis
- Blocage d'utilisateurs

### Sécurité
- WAF/ModSecurity
- HashiCorp Vault pour la gestion des secrets
- Authentification JWT

### Monitoring
- Métriques en temps réel
- Tableaux de bord Grafana
- Alertes système

## 🔧 Configuration

### Variables d'environnement
Les variables d'environnement sont configurées dans le fichier `docker-compose.yml`:
- `NODE_ENV`: Environnement (development/production)
- `DATABASE_URL`: URL de connexion à la base de données
- `JWT_SECRET`: Clé secrète pour JWT
- `VITE_API_URL`: URL de l'API backend

## 📝 Notes de développement

### Frontend
- Le jeu est développé en TypeScript pur
- Utilisation de Canvas pour le rendu du jeu
- WebSocket pour la communication en temps réel

### Backend
- API RESTful avec Fastify
- WebSocket pour les mises à jour en temps réel
- Base de données SQLite pour la persistance

## 🔍 Débogage
- Les logs des conteneurs sont accessibles via `docker-compose logs`
- Prometheus et Grafana pour le monitoring
- Les erreurs frontend sont visibles dans la console du navigateur

## 📚 Documentation supplémentaire
- [Documentation Fastify](https://www.fastify.io/docs/latest/)
- [Documentation TypeScript](https://www.typescriptlang.org/docs/)
- [Documentation Prometheus](https://prometheus.io/docs/)
- [Documentation Grafana](https://grafana.com/docs/) 