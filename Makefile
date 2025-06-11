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
	@echo "\n\033[1;33mTo access from Windows, use your WSL2 IP:\033[0m"
	@echo "WSL2 IP: $$(ip addr show eth0 | grep "inet\b" | awk '{print $$2}' | cut -d/ -f1)"
	@echo "Grafana: http://$$(ip addr show eth0 | grep "inet\b" | awk '{print $$2}' | cut -d/ -f1):3001"
	@echo "Prometheus: http://$$(ip addr show eth0 | grep "inet\b" | awk '{print $$2}' | cut -d/ -f1):9090"
	@echo "Frontend: http://$$(ip addr show eth0 | grep "inet\b" | awk '{print $$2}' | cut -d/ -f1):5173"
	@echo "Backend API: http://$$(ip addr show eth0 | grep "inet\b" | awk '{print $$2}' | cut -d/ -f1):8000"
	@echo "\n\033[1;32m=== End of Status ===\033[0m\n"

down:
	docker-compose -f $(DOCKER_COMPOSE) down

clean: down
	docker system prune -af

re: clean all

.PHONY: all build up down clean re status 