# Jeux Block - Documentation

## 🎮 Vue d'ensemble

Les jeux Block et Block1v1 ont été entièrement refaits avec une approche simple et efficace pour garantir une physique parfaite et un gameplay fluide. Le système de power-ups ajoute une dimension stratégique et amusante au gameplay.

## 🎯 Améliorations Apportées

### 1. **Physique Simplifiée et Robuste**
- Collision simple et précise avec les briques
- Rebond automatique selon le côté de collision le plus proche
- Vitesse constante pour éviter les variations indésirables
- Prévention des blocages avec repositionnement automatique

### 2. **Code Nettoyé et Optimisé**
- Suppression du code complexe et bugué
- Logique claire et maintenable
- Performance optimisée
- Gestion d'erreurs améliorée

### 3. **Interface Utilisateur Améliorée**
- Messages d'instruction clairs
- Affichage du gagnant
- Ligne de séparation en mode 1v1
- Couleurs distinctes pour chaque joueur

## 🎲 Mode Solo (Block.ts)

### Contrôles
- **A/D** ou **Flèches gauche/droite** : Déplacer la paddle
- **Enter** : Démarrer le jeu

### Mécaniques
- Une balle, une paddle
- Détruire toutes les briques pour gagner
- Perdre si la balle touche le bas de l'écran
- Physique réaliste avec rebond sur la paddle

## 🏓 Mode 1v1 (Block1v1.ts)

### Contrôles
- **Joueur 1** : **A/D** pour déplacer la paddle du bas
- **Joueur 2** : **Flèches gauche/droite** pour déplacer la paddle du haut
- **Enter** : Démarrer le jeu

### Mécaniques
- Deux balles, deux paddles
- Chaque joueur contrôle sa propre balle
- Les briques sont partagées au centre
- Le premier à faire tomber sa balle perd
- Physique identique au mode solo

## 🔧 Fonctionnalités Techniques

### Collision avec les Briques
```typescript
// Vérification simple et efficace
if (ball.checkBrickCollision(brickLeft, brickRight, brickTop, brickBottom)) {
    brick.beenHit();
    ball.bounceOnBrick(brickLeft, brickRight, brickTop, brickBottom);
}
```

### Rebond sur la Paddle
```typescript
// Angle de rebond basé sur la position d'impact
const relativeIntersectX = (ball.x - paddle.x) / paddle.width;
const bounceAngle = (relativeIntersectX - 0.5) * Math.PI / 3;

// Mode Solo et Balle 1 (du bas) - rebond vers le haut
ball.collisionPaddle(paddle);

// Mode 1v1 - Balle 2 (du haut) - rebond vers le bas
ball.collisionPaddleTop(paddle);
```

### Gestion des Bords
```typescript
// Collision automatique avec les bords de l'écran
ball.collisionWindow(width, height);
```

## 🎨 Rendu Visuel

### Couleurs
- **Fond** : `#1a1a2e` (bleu foncé)
- **Paddle 1** : `#84AD8A` (vert) / `#4444FF` (bleu quand agrandie)
- **Paddle 2** : `#84A6AD` (bleu clair)
- **Balle 1** : `#FF8600` (orange) / `#FFFF44` (jaune rapide) / `#FF44FF` (magenta lente)
- **Balle 2** : `#FF6B6B` (rouge)
- **Briques** : Couleurs aléatoires (rouge, vert, bleu)
- **Power-ups** : Couleurs selon le type (rouge, vert, bleu, jaune, magenta)

### Effets Visuels
- Ligne de séparation pointillée en mode 1v1
- Contours blancs sur tous les éléments
- Messages avec transparence
- Animation fluide à 60 FPS

## 🚀 Performance

- **Rendu optimisé** : Une seule passe de rendu par frame
- **Collision efficace** : Vérification simple et rapide
- **Mémoire optimisée** : Pas d'objets inutiles
- **CPU friendly** : Calculs minimaux

## 🐛 Corrections de Bugs

### Problèmes Résolus
1. ✅ Balle qui passe entre les briques
2. ✅ Collisions imprécises
3. ✅ Vitesse variable
4. ✅ Blocages de la balle
5. ✅ Code complexe et bugué
6. ✅ Performance médiocre
7. ✅ Collisions paddle du haut en mode 1v1

### Garanties
- 🎯 **Collision parfaite** : La balle ne passe plus entre les briques
- ⚡ **Physique constante** : Vitesse stable et prévisible
- 🎮 **Gameplay fluide** : Pas de lag ni de saccades
- 🔧 **Code maintenable** : Structure claire et documentée

## 📝 Utilisation

```typescript
// Mode Solo avec Power-ups
const blockGame = new Block(canvas);

// Mode 1v1
const block1v1Game = new Block1v1(canvas);
block1v1Game.init();

// Les power-ups sont automatiquement gérés :
// - 10% de chance par brique
// - Collecte automatique avec la paddle
// - Effets visuels automatiques
// - Timers automatiques
```

Les jeux sont maintenant prêts pour une utilisation en production avec une physique parfaite ! 🎉 

## ⚡ Système de Power-ups

### 🎯 **Quand et Comment Apparaissent les Power-ups**

#### **1. Génération Initiale**
- **Quand** : Au début du jeu, quand les briques sont créées
- **Probabilité** :10 chance par brique
- **Total** : Sur 100 briques, environ 10auront un power-up

#### **2. Apparition des Power-ups**
- **Déclencheur** : Destruction complète dune brique par la balle
- **Conditions** : La brique doit avoir été créée avec un power-up ET être complètement détruite
- **Position** : Centre de la brique détruite, juste en-dessous

#### **3. Mouvement et Collecte**
- **Vitesse** : 2pixels par frame (120 pixels/seconde)
- **Direction** : Tombent vers le bas
- **Collecte** : Toucher la paddle pour activer l'effet
- **Durée de vie** : Jusqu'à collecte ou sortie de l'écran

### 🎮 **Cycle de Vie d'un Power-up**

```1. Création de la brique (10 de chance davoir un power-up)
   ↓
2rique détruite par la balle
   ↓
3 Power-up apparaît sous la brique
   ↓4ower-up tombe vers le bas (2ame)
   ↓
5. Power-up collecté par la paddle OU sort de lécran
   ↓6. Effet activé (si collecté) OU power-up supprimé
```

### 📊 **Statistiques d'Apparition**

- **Probabilité par brique** : 10%
- **Briques totales** :100**Power-ups attendus** : ~10par partie
- **Vitesse de chute** : 120ixels/seconde
- **Temps de chute** : ~5 secondes (du haut vers le bas)

### 🎯 **Types de Power-ups Disponibles**
1. **💥 Explosion** (Rouge) : Détruit toutes les briques dans un rayon de 1002. **⚽ Multi-Ball** (Vert) : Crée 2 balles supplémentaires
3. **↔️ Wide Paddle** (Bleu) : Agrandit la paddle pendant5condes
4 **⚡ Fast Ball** (Jaune) : Accélère la balle pendant 5ondes5. **🐌 Slow Ball** (Magenta) : Ralentit la balle pendant 5econdes

### 🔧 **Code Technique**

```typescript
// Création d'un power-up aléatoire
export function createRandomPowerUp(x: number, y: number): PowerUp[object Object]
    const types = Object.values(PowerUpType);
    const randomType = types[Math.floor(Math.random() * types.length)];
    return new PowerUp(x, y, randomType);
}

// Vérification si une brique a un power-up
export function getPowerUpFromBrick(brick: brick, brickWidth: number, brickHeight: number): PowerUp | null {
    if (brick.getHasPowerUp() && brick.getHp() <= 0[object Object]
        const x = brick.getX() * brickWidth + brickWidth / 2
        const y = brick.getY() * brickHeight + brickHeight;
        return createRandomPowerUp(x, y);
    }
    return null;
}
``` 