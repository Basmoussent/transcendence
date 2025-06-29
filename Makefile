NAME = transcendence
DOCKER_COMPOSE = docker-compose.yml

all: build up status

build:
	@mkdir -p docker/vault/data/core
	mkdir -p backend/uploads
	docker-compose -f $(DOCKER_COMPOSE) build

up:
	docker-compose -f $(DOCKER_COMPOSE) up -d

status:
	@echo "\n\033[1;32m=== Services Status ===\033[0m"
	@echo "\033[1;36mFrontend:\033[0m http://localhost:5173"
	@echo "\033[1;36mBackend API:\033[0m http://localhost:8000"
	@echo "\033[1;36mPrometheus:\033[0m http://localhost:9090"
	@echo "\033[1;36mGrafana:\033[0m http://localhost:3001"
	@echo "\n\033[1;32m=== End of Status ===\033[0m\n"

down:
	docker-compose -f $(DOCKER_COMPOSE) down

clean: down
	docker system prune -af

re: clean all

test-backend:
	@echo "🔍 Test rapide du backend..."
	@curl -s http://localhost:8000/ping || echo "❌ Backend non accessible"

env:
	@echo "🔍 Affichage des variables d'environnement..."
	@docker exec transcendence_backend_1 cat /tmp/vault.env || echo "❌ Impossible d'afficher les variables d'environnement"
purge: down
	@docker system prune -af
	@docker ps -q | xargs -r docker stop
	@docker ps -aq | xargs -r docker rm
	@docker volume ls -q | xargs -r docker volume rm
	@docker image prune -af
	@echo "✅ Docker purged."

.PHONY: all build up down clean re status