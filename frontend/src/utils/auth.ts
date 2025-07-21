// Utilitaires pour gérer l'authentification avec les cookies

export function getAuthToken(): string | null {
  const localToken = sessionStorage.getItem('x-access-token');
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

export function getAuthTokenFromCookie(): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'x-access-token') {
      return value;
    }
  }
  return null;
}

export function getDomain(): string {
  const hostname = window.location.hostname;
  if (hostname.includes('localhost')) {
    return 'localhost';
  }
  return hostname;
}

export function setAuthToken(token: string): void {
  sessionStorage.setItem('x-access-token', token);
  document.cookie = `x-access-token=${token}; path=/; domain=${getDomain()}; SameSite=Strict; Secure`;

}

export function removeAuthToken(): void {
  sessionStorage.removeItem('x-access-token');
  document.cookie = `x-access-token=; path=/; domain=${getDomain()}; SameSite=Strict; Secure`;
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

export  function initAlive()
{
  console.log("initAlive started");
  const authToken = getAuthToken();
  if (!authToken) {
    console.log("No auth token, skipping initAlive");
    return;
  }

  const socket = new WebSocket(`${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/alive`);

  socket.addEventListener('open', () => {
    console.log('🔌 WebSocket /alive connected');
    socket.send(JSON.stringify({ type: 'ping', token: authToken }));
    const interval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping', token: authToken }));
      } else {
        clearInterval(interval);
      }
    }, 5000);

    socket.addEventListener('close', () => {
      clearInterval(interval);
      console.log('🔌 WebSocket /alive disconnected');
    });
  });

  socket.addEventListener('error', (error) => {
    console.error('🔌 WebSocket /alive error:', error);
  });
}
