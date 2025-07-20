#!/bin/bash

echo "📋 Vérification des logs ModSecurity"
echo "===================================="

# Vérifier si le container nginx est en cours d'exécution
if ! docker ps | grep -q nginx; then
    echo "❌ Container nginx n'est pas en cours d'exécution"
    echo "💡 Démarrez vos containers avec: docker-compose up -d"
    exit 1
fi

echo -e "\n🔍 Logs d'audit ModSecurity (dernières 20 lignes):"
docker exec nginx tail -20 /var/log/modsecurity/audit/audit.log

echo -e "\n🔍 Logs de debug ModSecurity (dernières 10 lignes):"
docker exec nginx tail -10 /var/log/modsecurity/audit/auditDebug.log

echo -e "\n🔍 Logs nginx (dernières 10 lignes):"
docker exec nginx tail -10 /var/log/nginx/access.log

echo -e "\n📊 Pour surveiller en temps réel:"
echo "docker exec nginx tail -f /var/log/modsecurity/audit/audit.log" 