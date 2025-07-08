export default {
	server: {
	//   allowedHosts: ['frontend', 'localhost', 'fr.entropy.local', 'en.entropy.local', 'es.entropy.local']
	// si on laise ca on peut pas acceder depuis un autre poste
	// pour tester websocket https:// + poste de celui qui a lance le server
		allowedHosts: true
	}
  }