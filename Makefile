NAME = transcendence
DOCKER_COMPOSE = docker-compose.yml

all: build up status

build:
	@mkdir -p docker/vault/data/core
	docker-compose -f $(DOCKER_COMPOSE) --env-file=.env build

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

.PHONY: all build up down clean re status test-cookies test-backend debug-cookies restart-cookies 