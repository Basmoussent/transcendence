export const translations = {
  fr: {
    home: {
      title: "Pong",
      subtitle: "Découvrez Pong",
      description: "Une expérience de jeu classique revisitée",
      login: "Connexion"
    },
    auth: {
      login: {
        title: "Connexion",
        username: "Nom d'utilisateur",
        password: "Mot de passe",
        submit: "Se connecter",
        forgotPassword: "Mot de passe oublié ?",
        createAccount: "Créer un compte"
      },
      createAccount: {
        title: "Créer un compte",
        username: "Nom d'utilisateur",
        email: "Email",
        password: "Mot de passe",
        confirmPassword: "Confirmer le mot de passe",
        submit: "Créer un compte",
        backToLogin: "Retour à la connexion"
      },
      forgotPassword: {
        title: "Mot de passe oublié",
        description: "Entrez votre email pour recevoir un lien de réinitialisation",
        email: "Email",
        submit: "Envoyer le lien",
        backToLogin: "Retour à la connexion"
      },
      changePassword: {
        title: "Changer le mot de passe",
        currentPassword: "Mot de passe actuel",
        newPassword: "Nouveau mot de passe",
        confirmNewPassword: "Confirmer le nouveau mot de passe",
        submit: "Modifier le mot de passe",
        backToProfile: "Retour au profil"
      },
      twoFactorAuth: {
        title: "Authentification à deux facteurs",
        backToProfile: "Retour au profil",
        scanQR: "Scannez le QR code avec votre application d'authentification Google Authenticator",
        generatingQR: "Génération du QR code...",
        verificationCode: "Entrez le code de vérification :",
        activate: "Activer 2FA",
        verify: "Vérifier le code",
        success: "2FA activée avec succès",
        error: "Code de vérification incorrect",
        missingToken: "Token d'authentification manquant"
      }
    },
    menu: {
      title: "Transcendence",
      profile: "Profil",
      playLocal: "Jouer en local",
      multiplayer: "Multijoueur",
      friends: "Amis",
      tournament: "Tournoi",
      chat: "Chat",
      logout: "Déconnexion"
    },
    profile: {
      title: "Profil",
      editProfile: "Modifier le profil",
      changePassword: "Changer le mot de passe",
      logout: "Déconnexion",
      stats: {
        wins: "Victoires",
        games: "Parties",
        rating: "Classement"
      },
      recentActivity: "Activité récente",
      wonAgainst: "Victoire contre",
      addedFriend: "Ajouté un ami",
      hoursAgo: "heures",
      daysAgo: "jours",
      edit: {
        title: "Modifier le profil",
        username: "Nom d'utilisateur",
        email: "Pseudo",
        avatar: "Avatar",
        submit: "Enregistrer",
        backToProfile: "Annuler"
      }
    },
    social: {
      title: "Social",
      searchPlaceholder: "Rechercher des amis...",
      friends: {
        title: "Amis",
        addFriend: "Ajouter un ami",
        online: "En ligne",
        offline: "Hors ligne",
        message: "Message",
        play: "Jouer"
      },
      friendRequests: {
        title: "Demandes d'amis",
        accept: "Accepter",
        decline: "Refuser"
      },
      chat: {
        title: "Chat",
        newChat: "Nouvelle conversation",
        ago: "il y a"
      },
      home: "Accueil",
      deactivate2FA: "Désactiver 2FA",
      activate2FA: "Activer 2FA",
      hoursAgo: "heures",
      heyWantToPlay: "Salut, envie de jouer ?",
      goodGame: "Bonne partie !",
      upload: "Télécharger",
      selectValidImage: "Veuillez sélectionner une image valide",
      imageTooLarge: "L'image est trop volumineuse. Taille maximum: 5MB",
      avatarUploadSuccess: "Avatar uploadé avec succès",
      avatarUploadError: "Erreur lors de l'upload de l'avatar",
      victory: "Victoire",
      defeat: "Défaite",
      draw: "Match nul",
      justNow: "À l'instant",
      yesterday: "Hier",
      twoFAUpdateFailed: "Échec de la mise à jour du statut 2FA",
      confirmDisable2FA: "Êtes-vous sûr de vouloir désactiver l'authentification à deux facteurs ?",
      unknownError: "Erreur inconnue",
      addFriend: "Ajouter ami",
      message: "Message",
      statistics: "Statistiques",
      gamePlayed: "Parties jouées",
      winrate: "Taux de victoire",
      noGameFound: "Aucune partie trouvée"
    },
    friends: {
      backToSocial: "Retour",
      online: "En ligne",
      offline: "Hors ligne",
      lastSeen: "Vu",
      stats: {
        wins: "Victoires",
        games: "Parties",
        rating: "Classement"
      },
      sendMessage: "Envoyer un message",
      inviteToGame: "Inviter à jouer",
      removeFriend: "Retirer des amis"
    },
    block: {
      pressEnterToStart: "APPUYEZ SUR ENTRÉE POUR COMMENCER",
      player1Controls: "JOUEUR 1: TOUCHES A/D",
      player2Controls: "JOUEUR 2: TOUCHES FLÉCHÉES",
      wins: "GAGNE !",
      pressEnterToPlayAgain: "Appuyez sur ENTRÉE pour rejouer",
      score: "Score :",
      lives: "Vies :"
    },
    chat: {
      home: "Accueil",
      myFriends: "Mes Amis",
      searchFriend: "Rechercher un ami...",
      friends: "Amis",
      requests: "Demandes",
      add: "Ajouter",
      addNewFriend: "Ajouter un nouvel ami",
      username: "Nom d'utilisateur",
      sendRequest: "Envoyer une demande",
      selectFriendToChat: "Sélectionnez un ami pour commencer à chatter",
      typeMessage: "Tapez votre message...",
      online: "En ligne",
      offline: "Hors ligne",
      away: "Absent",
      accept: "Accepter",
      decline: "Refuser",
      remove: "Retirer",
      block: "Bloquer",
      unblock: "Débloquer"
    },
    matchmaking: {
      home: "Accueil",
      createGame: "Créer une partie",
      chooseGameType: "Choisissez votre type de jeu et lancez une salle",
      gameType: "Type de jeu",
      pong: "Pong",
      block: "Block",
      launchRoom: "Lancer la salle",
      reset: "Réinitialiser",
      joinGame: "Rejoindre une partie",
      availableRooms: "Salles disponibles",
      noActiveGames: "Aucune partie active",
      createGameToStart: "Créez une partie pour commencer",
      waitingForPlayers: "En attente de joueurs...",
      playersConnected: "Joueurs connectés",
      join: "Rejoindre",
      cancel: "Annuler"
    },
    game: {
      home: "Accueil",
      blockGame: "Block Game",
      pongGame: "Pong Game",
      tournament: "Tournoi",
      createTournament: "Créer un tournoi",
      joinTournament: "Rejoindre un tournoi",
      tournamentName: "Nom du tournoi",
      maxPlayers: "Joueurs maximum",
      startTournament: "Démarrer le tournoi",
      tournamentBracket: "Arbre du tournoi",
      round: "Tour",
      final: "Finale",
      semiFinal: "Demi-finale",
      quarterFinal: "Quart de finale",
      winner: "Vainqueur",
      vs: "contre",
      waitingForMatch: "En attente du match...",
      matchInProgress: "Match en cours...",
      matchFinished: "Match terminé"
    },
    room: {
      roomId: "ID de la salle",
      copyRoomId: "Copier l'ID de la salle",
      shareRoom: "Partager la salle",
      players: "Joueurs",
      spectators: "Spectateurs",
      kickPlayer: "Expulser le joueur",
      banPlayer: "Bannir le joueur",
      startGame: "Démarrer la partie",
      leaveRoom: "Quitter la salle",
      roomSettings: "Paramètres de la salle",
      maxSpectators: "Spectateurs maximum",
      privateRoom: "Salle privée",
      publicRoom: "Salle publique",
      home: "Accueil",
      roomName: "Nom de la salle",
      ready: "Prêt",
      notReady: "Pas prêt",
      maxPlayers: "Joueurs maximum",
      gameType: "Type de jeu",
      ai: "IA",
      waitingForPlayers: "En attente de joueurs...",
      chat: "Chat",
      typeMessage: "Tapez un message...",
      host: "HÔTE"
    },
    pong: {
      pressEnterToStart: "APPUYEZ SUR ENTRÉE",
      toStart: "POUR COMMENCER",
      player: "Joueur",
      aiPlayer: "IA"
    }
  },
  en: {
    home: {
      title: "Pong",
      subtitle: "Discover Pong",
      description: "A classic gaming experience reimagined",
      login: "Login"
    },
    auth: {
      login: {
        title: "Login",
        username: "Username",
        password: "Password",
        submit: "Sign in",
        forgotPassword: "Forgot password?",
        createAccount: "Create account"
      },
      createAccount: {
        title: "Create Account",
        username: "Username",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm password",
        submit: "Create account",
        backToLogin: "Back to login"
      },
      forgotPassword: {
        title: "Forgot Password",
        description: "Enter your email to receive a reset link",
        email: "Email",
        submit: "Send link",
        backToLogin: "Back to login"
      },
      changePassword: {
        title: "Change Password",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmNewPassword: "Confirm New Password",
        submit: "Change Password",
        backToProfile: "Back to Profile"
      },
      twoFactorAuth: {
        title: "Two-Factor Authentication",
        backToProfile: "Back to Profile",
        scanQR: "Scan the QR code with your Google Authenticator app",
        generatingQR: "Generating QR code...",
        verificationCode: "Enter verification code:",
        activate: "Activate 2FA",
        verify: "Verify Code",
        success: "2FA activated successfully",
        error: "Incorrect verification code",
        missingToken: "Authentication token missing"
      }
    },
    menu: {
      title: "Transcendence",
      profile: "Profile",
      playLocal: "Play Local",
      multiplayer: "Multiplayer",
      friends: "Friends",
      tournament: "Tournament",
      chat: "Chat",
      logout: "Logout"
    },
    profile: {
      title: "Profile",
      editProfile: "Edit Profile",
      changePassword: "Change Password",
      logout: "Logout",
      stats: {
        wins: "Wins",
        games: "Games",
        rating: "Rating"
      },
      recentActivity: "Recent Activity",
      wonAgainst: "Won against",
      addedFriend: "Added friend",
      hoursAgo: "hours ago",
      daysAgo: "days ago",
      edit: {
        title: "Edit Profile",
        username: "Username",
        email: "Username",
        avatar: "Avatar",
        submit: "Save",
        backToProfile: "Cancel"
      }
    },
    social: {
      title: "Social",
      searchPlaceholder: "Search friends...",
      friends: {
        title: "Friends",
        addFriend: "Add Friend",
        online: "Online",
        offline: "Offline",
        message: "Message",
        play: "Play"
      },
      friendRequests: {
        title: "Friend Requests",
        accept: "Accept",
        decline: "Decline"
      },
      chat: {
        title: "Chat",
        newChat: "New Chat",
        ago: "ago"
      },
      home: "Home",
      deactivate2FA: "Deactivate 2FA",
      activate2FA: "Activate 2FA",
      hoursAgo: "hours ago",
      heyWantToPlay: "Hey, want to play a game?",
      goodGame: "Good game!",
      upload: "Upload",
      selectValidImage: "Please select a valid image",
      imageTooLarge: "Image is too large. Maximum size: 5MB",
      avatarUploadSuccess: "Avatar uploaded successfully",
      avatarUploadError: "Error uploading avatar",
      victory: "Victory",
      defeat: "Defeat",
      draw: "Draw",
      justNow: "Just now",
      yesterday: "Yesterday",
      twoFAUpdateFailed: "Failed to update 2FA status",
      confirmDisable2FA: "Are you sure you want to disable two-factor authentication?",
      unknownError: "Unknown error",
      addFriend: "Add Friend",
      message: "Message",
      statistics: "Statistics",
      gamePlayed: "Games played",
      winrate: "Winrate",
      noGameFound: "No game found"
    },
    friends: {
      backToSocial: "Back",
      online: "Online",
      offline: "Offline",
      lastSeen: "Last seen",
      stats: {
        wins: "Wins",
        games: "Games",
        rating: "Rating"
      },
      sendMessage: "Send Message",
      inviteToGame: "Invite to Game",
      removeFriend: "Remove Friend"
    },
    block: {
      pressEnterToStart: "PRESS ENTER TO START",
      player1Controls: "PLAYER 1: A/D KEYS",
      player2Controls: "PLAYER 2: ARROW KEYS",
      wins: "WINS!",
      pressEnterToPlayAgain: "Press ENTER to play again",
      score: "Score:",
      lives: "Lives:"
    },
    chat: {
      home: "Home",
      myFriends: "My Friends",
      searchFriend: "Search for a friend...",
      friends: "Friends",
      requests: "Requests",
      add: "Add",
      addNewFriend: "Add a new friend",
      username: "Username",
      sendRequest: "Send request",
      selectFriendToChat: "Select a friend to start chatting",
      typeMessage: "Type your message...",
      online: "Online",
      offline: "Offline",
      away: "Away",
      accept: "Accept",
      decline: "Decline",
      remove: "Remove",
      block: "Block",
      unblock: "Unblock"
    },
    matchmaking: {
      home: "Home",
      createGame: "Create a Game",
      chooseGameType: "Choose your game type and launch a room",
      gameType: "Game Type",
      pong: "Pong",
      block: "Block",
      launchRoom: "Launch Room",
      reset: "Reset",
      joinGame: "Join a Game",
      availableRooms: "Available rooms",
      noActiveGames: "No active games",
      createGameToStart: "Create a game to get started",
      waitingForPlayers: "Waiting for players...",
      playersConnected: "Players connected",
      join: "Join",
      cancel: "Cancel"
    },
    game: {
      blockGame: "Block Game",
      pongGame: "Pong Game",
      tournament: "Tournament",
      createTournament: "Create Tournament",
      joinTournament: "Join Tournament",
      tournamentName: "Tournament Name",
      maxPlayers: "Max Players",
      startTournament: "Start Tournament",
      tournamentBracket: "Tournament Bracket",
      round: "Round",
      final: "Final",
      semiFinal: "Semi-Final",
      quarterFinal: "Quarter-Final",
      winner: "Winner",
      vs: "vs",
      waitingForMatch: "Waiting for match...",
      matchInProgress: "Match in progress...",
      matchFinished: "Match finished"
    },
    room: {
      roomId: "Room ID",
      copyRoomId: "Copy Room ID",
      shareRoom: "Share Room",
      players: "Players",
      spectators: "Spectators",
      kickPlayer: "Kick Player",
      banPlayer: "Ban Player",
      startGame: "Start Game",
      leaveRoom: "Leave Room",
      roomSettings: "Room Settings",
      maxSpectators: "Max Spectators",
      privateRoom: "Private Room",
      publicRoom: "Public Room",
      home: "Home",
      roomName: "Room Name",
      ready: "Ready",
      notReady: "Not ready",
      maxPlayers: "Max Players",
      gameType: "Game Type",
      ai: "AI",
      waitingForPlayers: "Waiting for players...",
      chat: "Chat",
      typeMessage: "Type a message...",
      host: "HOST"
    },
    pong: {
      pressEnterToStart: "PRESS ENTER",
      toStart: "TO START",
      player: "Player",
      aiPlayer: "AI"
    }
  },
  es: {
    home: {
      title: "Pong",
      subtitle: "Descubre Pong",
      description: "Una experiencia de juego clásica reinventada",
      login: "Iniciar sesión"
    },
    auth: {
      login: {
        title: "Iniciar sesión",
        username: "Nombre de usuario",
        password: "Contraseña",
        submit: "Iniciar sesión",
        forgotPassword: "¿Olvidaste tu contraseña?",
        createAccount: "Crear cuenta"
      },
      createAccount: {
        title: "Crear cuenta",
        username: "Nombre de usuario",
        email: "Correo electrónico",
        password: "Contraseña",
        confirmPassword: "Confirmar contraseña",
        submit: "Crear cuenta",
        backToLogin: "Volver al inicio de sesión"
      },
      forgotPassword: {
        title: "Olvidaste tu contraseña",
        description: "Ingresa tu correo electrónico para recibir un enlace de restablecimiento",
        email: "Correo electrónico",
        submit: "Enviar enlace",
        backToLogin: "Volver al inicio de sesión"
      },
      changePassword: {
        title: "Cambiar contraseña",
        currentPassword: "Contraseña actual",
        newPassword: "Nueva contraseña",
        confirmNewPassword: "Confirmar nueva contraseña",
        submit: "Cambiar contraseña",
        backToProfile: "Volver al perfil"
      },
      twoFactorAuth: {
        title: "Autenticación de dos factores",
        backToProfile: "Volver al perfil",
        scanQR: "Escanee el código QR con su aplicación Google Authenticator",
        generatingQR: "Generando código QR...",
        verificationCode: "Ingrese el código de verificación:",
        activate: "Activar 2FA",
        verify: "Verificar código",
        success: "2FA activada exitosamente",
        error: "Código de verificación incorrecto",
        missingToken: "Token de autenticación faltante"
      }
    },
    menu: {
      title: "Transcendence",
      profile: "Perfil",
      playLocal: "Jugar local",
      multiplayer: "Multijugador",
      friends: "Amigos",
      tournament: "Torneo",
      chat: "Chat",
      logout: "Cerrar sesión"
    },
    profile: {
      title: "Perfil",
      editProfile: "Editar perfil",
      changePassword: "Cambiar contraseña",
      logout: "Cerrar sesión",
      stats: {
        wins: "Victorias",
        games: "Partidas",
        rating: "Clasificación"
      },
      recentActivity: "Actividad reciente",
      wonAgainst: "Victoria contra",
      addedFriend: "Añadido amigo",
      hoursAgo: "horas",
      daysAgo: "días",
      edit: {
        title: "Editar perfil",
        username: "Nombre de usuario",
        email: "Usuario",
        avatar: "Avatar",
        submit: "Guardar",
        backToProfile: "Cancelar"
      }
    },
    social: {
      title: "Social",
      searchPlaceholder: "Buscar amigos...",
      friends: {
        title: "Amigos",
        addFriend: "Añadir amigo",
        online: "En línea",
        offline: "Desconectado",
        message: "Mensaje",
        play: "Jugar"
      },
      friendRequests: {
        title: "Solicitudes de amistad",
        accept: "Aceptar",
        decline: "Rechazar"
      },
      chat: {
        title: "Chat",
        newChat: "Nuevo chat",
        ago: "hace"
      },
      home: "Inicio",
      deactivate2FA: "Desactivar 2FA",
      activate2FA: "Activar 2FA",
      hoursAgo: "horas",
      heyWantToPlay: "¡Hola, ¿quieres jugar?",
      goodGame: "¡Buena partida!",
      upload: "Subir",
      selectValidImage: "Por favor selecciona una imagen válida",
      imageTooLarge: "La imagen es demasiado grande. Tamaño máximo: 5MB",
      avatarUploadSuccess: "Avatar subido exitosamente",
      avatarUploadError: "Error al subir el avatar",
      victory: "Victoria",
      defeat: "Derrota",
      draw: "Empate",
      justNow: "Ahora mismo",
      yesterday: "Ayer",
      twoFAUpdateFailed: "Error al actualizar el estado 2FA",
      confirmDisable2FA: "¿Estás seguro de que quieres desactivar la autenticación de dos factores?",
      unknownError: "Error desconocido",
      addFriend: "Agregar Amigo",
      message: "Mensaje",
      statistics: "Estadísticas",
      gamePlayed: "Partidas jugadas",
      winrate: "Tasa de victoria",
      noGameFound: "No se ha encontrado ningún juego"
    },
    friends: {
      backToSocial: "Volver",
      online: "En línea",
      offline: "Desconectado",
      lastSeen: "Visto por última vez",
      stats: {
        wins: "Victorias",
        games: "Partidas",
        rating: "Clasificación"
      },
      sendMessage: "Enviar mensaje",
      inviteToGame: "Invitar a jugar",
      removeFriend: "Eliminar amigo"
    },
    block: {
      pressEnterToStart: "PRESIONA ENTER PARA COMENZAR",
      player1Controls: "JUGADOR 1: TECLAS A/D",
      player2Controls: "JUGADOR 2: TECLAS DE FLECHA",
      wins: "¡GANÓ!",
      pressEnterToPlayAgain: "Presiona ENTER para jugar de nuevo",
      score: "Puntuación:",
      lives: "Vidas:"
    },
    chat: {
      home: "Inicio",
      myFriends: "Mis Amigos",
      searchFriend: "Buscar un amigo...",
      friends: "Amigos",
      requests: "Solicitudes",
      add: "Agregar",
      addNewFriend: "Agregar un nuevo amigo",
      username: "Nombre de usuario",
      sendRequest: "Enviar solicitud",
      selectFriendToChat: "Selecciona un amigo para comenzar a chatear",
      typeMessage: "Escribe tu mensaje...",
      online: "En línea",
      offline: "Desconectado",
      away: "Ausente",
      accept: "Aceptar",
      decline: "Rechazar",
      remove: "Eliminar",
      block: "Bloquear",
      unblock: "Desbloquear"
    },
    matchmaking: {
      home: "Inicio",
      createGame: "Crear un Juego",
      chooseGameType: "Elige tu tipo de juego y lanza una sala",
      gameType: "Tipo de Juego",
      pong: "Pong",
      block: "Block",
      launchRoom: "Lanzar Sala",
      reset: "Reiniciar",
      joinGame: "Unirse a un Juego",
      availableRooms: "Salas disponibles",
      noActiveGames: "No hay juegos activos",
      createGameToStart: "Crea un juego para comenzar",
      waitingForPlayers: "Esperando jugadores...",
      playersConnected: "Jugadores conectados",
      join: "Unirse",
      cancel: "Cancelar"
    },
    game: {
      blockGame: "Juego de Bloques",
      pongGame: "Juego de Pong",
      tournament: "Torneo",
      createTournament: "Crear Torneo",
      joinTournament: "Unirse al Torneo",
      tournamentName: "Nombre del Torneo",
      maxPlayers: "Jugadores Máximos",
      startTournament: "Iniciar Torneo",
      tournamentBracket: "Llave del Torneo",
      round: "Ronda",
      final: "Final",
      semiFinal: "Semi-Final",
      quarterFinal: "Cuartos de Final",
      winner: "Ganador",
      vs: "vs",
      waitingForMatch: "Esperando partida...",
      matchInProgress: "Partida en progreso...",
      matchFinished: "Partida terminada"
    },
    room: {
      roomId: "ID de la Sala",
      copyRoomId: "Copiar ID de la Sala",
      shareRoom: "Compartir Sala",
      players: "Jugadores",
      spectators: "Espectadores",
      kickPlayer: "Expulsar Jugador",
      banPlayer: "Banear Jugador",
      startGame: "Iniciar Juego",
      leaveRoom: "Salir de la Sala",
      roomSettings: "Configuración de la Sala",
      maxSpectators: "Espectadores Máximos",
      privateRoom: "Sala Privada",
      publicRoom: "Sala Pública",
      home: "Inicio",
      roomName: "Nombre de la Sala",
      ready: "Listo",
      notReady: "No listo",
      maxPlayers: "Jugadores Máximos",
      gameType: "Tipo de Juego",
      ai: "IA",
      waitingForPlayers: "Esperando jugadores...",
      chat: "Chat",
      typeMessage: "Escribe un mensaje...",
      host: "ANFITRIÓN"
    },
    pong: {
      pressEnterToStart: "PRESIONA ENTER",
      toStart: "PARA COMENZAR",
      player: "Jugador",
      aiPlayer: "IA"
    }
  }
} as const;

type DotNestedKeys<T> = {
  [K in keyof T & string]: T[K] extends object
    ? `${K}.${keyof T[K] & string}`
    : `${K}`
}[keyof T & string];

type Language = keyof typeof translations;
export type TranslationKeys = DotNestedKeys<typeof translations>;

export function getLanguage(): Language {
  const subdomain = sessionStorage.getItem('lang');
  const supportedLanguages = ['en', 'fr', 'es'] as const;

  return supportedLanguages.includes(subdomain as Language) ? subdomain as Language : 'en';
}

let translationCache: Map<string, string> = new Map();
let currentLanguage: Language | null = null;

export function clearTranslationCache() {
  translationCache.clear();
  currentLanguage = null;
}

export function t(key: TranslationKeys): string {
  const lang = getLanguage();
  
  // Clear cache if language changed
  if (currentLanguage !== lang) {
    clearTranslationCache();
    currentLanguage = lang;
  }
  
  // Check cache first
  const cacheKey = `${lang}:${key}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }
  
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      translationCache.set(cacheKey, key);
      return key;
    }
  }
  
  const result = typeof value === 'string' ? value : key;
  translationCache.set(cacheKey, result);
  return result;
} 