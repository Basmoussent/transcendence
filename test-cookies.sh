#!/bin/bash

# Script de test pour le système de cookies
# Teste la connexion, le partage de cookies et le logout

echo "🧪 Test du système de cookies pour les sous-domaines"
echo "=================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
BACKEND_URL="http://localhost:8000"
COOKIE_FILE="test_cookies.txt"

# Fonction pour afficher les messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Nettoyer les fichiers de test
cleanup() {
    rm -f "$COOKIE_FILE"
    print_status "Fichiers de test nettoyés"
}

# Test 1: Vérifier que le backend est accessible
test_backend_health() {
    print_status "Test 1: Vérification de l'accessibilité du backend"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/ping")
    
    if [ "$response" = "200" ]; then
        print_success "Backend accessible (HTTP $response)"
        return 0
    else
        print_error "Backend inaccessible (HTTP $response)"
        return 1
    fi
}

# Test 2: Test de connexion
test_login() {
    print_status "Test 2: Test de connexion"
    
    # Créer un utilisateur de test si nécessaire
    print_status "Création d'un utilisateur de test..."
    curl -s -X POST "$BACKEND_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d '{"username":"testuser","email":"test@example.com","password":"testpass","confirmPassword":"testpass"}' \
        > /dev/null 2>&1
    
    # Tentative de connexion
    response=$(curl -s -w "%{http_code}" -X POST "$BACKEND_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"testuser","password":"testpass"}' \
        -c "$COOKIE_FILE")
    
    http_code="${response: -3}"
    body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        print_success "Connexion réussie (HTTP $http_code)"
        echo "Token reçu: ${body:0:50}..."
        return 0
    else
        print_error "Échec de la connexion (HTTP $http_code)"
        echo "Réponse: $body"
        return 1
    fi
}

# Test 3: Vérifier que le cookie a été créé
test_cookie_creation() {
    print_status "Test 3: Vérification de la création du cookie"
    
    if [ -f "$COOKIE_FILE" ]; then
        cookie_content=$(cat "$COOKIE_FILE")
        if echo "$cookie_content" | grep -q "x-access-token"; then
            print_success "Cookie d'authentification créé"
            echo "Contenu du cookie:"
            cat "$COOKIE_FILE" | grep "x-access-token"
            return 0
        else
            print_error "Cookie d'authentification non trouvé"
            return 1
        fi
    else
        print_error "Fichier de cookie non créé"
        return 1
    fi
}

# Test 4: Test d'accès avec le cookie
test_authenticated_access() {
    print_status "Test 4: Test d'accès authentifié"
    
    response=$(curl -s -w "%{http_code}" "$BACKEND_URL/health/db" \
        -b "$COOKIE_FILE")
    
    http_code="${response: -3}"
    body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        print_success "Accès authentifié réussi (HTTP $http_code)"
        return 0
    else
        print_warning "Accès authentifié échoué (HTTP $http_code)"
        echo "Réponse: $body"
        return 1
    fi
}

# Test 5: Test de logout
test_logout() {
    print_status "Test 5: Test de logout"
    
    response=$(curl -s -w "%{http_code}" -X POST "$BACKEND_URL/auth/logout" \
        -b "$COOKIE_FILE" \
        -c "$COOKIE_FILE")
    
    http_code="${response: -3}"
    body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        print_success "Logout réussi (HTTP $http_code)"
        
        # Vérifier que le cookie a été supprimé
        if ! grep -q "x-access-token" "$COOKIE_FILE"; then
            print_success "Cookie supprimé avec succès"
            return 0
        else
            print_warning "Cookie toujours présent après logout"
            return 1
        fi
    else
        print_error "Échec du logout (HTTP $http_code)"
        echo "Réponse: $body"
        return 1
    fi
}

# Test 6: Test de partage de cookies (simulation)
test_cookie_sharing() {
    print_status "Test 6: Test de partage de cookies (simulation)"
    
    print_status "Ce test nécessite un test manuel dans le navigateur:"
    echo "1. Connectez-vous sur en.localhost"
    echo "2. Changez vers fr.localhost ou es.localhost"
    echo "3. Vérifiez que vous êtes toujours connecté"
    echo ""
    echo "Ou utilisez ces commandes curl:"
    echo "curl -b $COOKIE_FILE https://en.localhost/api/health/db"
    echo "curl -b $COOKIE_FILE https://fr.localhost/api/health/db"
    echo "curl -b $COOKIE_FILE https://es.localhost/api/health/db"
    
    return 0
}

# Fonction principale
main() {
    echo ""
    print_status "Démarrage des tests..."
    echo ""
    
    # Exécuter les tests
    tests_passed=0
    tests_total=0
    
    # Test 1
    ((tests_total++))
    if test_backend_health; then
        ((tests_passed++))
    fi
    echo ""
    
    # Test 2
    ((tests_total++))
    if test_login; then
        ((tests_passed++))
    fi
    echo ""
    
    # Test 3
    ((tests_total++))
    if test_cookie_creation; then
        ((tests_passed++))
    fi
    echo ""
    
    # Test 4
    ((tests_total++))
    if test_authenticated_access; then
        ((tests_passed++))
    fi
    echo ""
    
    # Test 5
    ((tests_total++))
    if test_logout; then
        ((tests_passed++))
    fi
    echo ""
    
    # Test 6
    ((tests_total++))
    if test_cookie_sharing; then
        ((tests_passed++))
    fi
    echo ""
    
    # Résumé
    echo "=================================================="
    print_status "Résumé des tests: $tests_passed/$tests_total tests réussis"
    
    if [ $tests_passed -eq $tests_total ]; then
        print_success "Tous les tests sont passés ! 🎉"
    else
        print_warning "Certains tests ont échoué. Vérifiez la configuration."
    fi
    
    # Nettoyage
    cleanup
}

# Gestion des signaux pour le nettoyage
trap cleanup EXIT

# Exécuter les tests
main "$@" 