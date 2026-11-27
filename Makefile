# Comandos comunes. Uso: make <comando>
.PHONY: start stop build logs ps probar limpiar

start: ## Construye y levanta todo el entorno
	docker compose up -d --build

stop: ## Baja los contenedores (conserva los datos)
	docker compose down

build: ## Reconstruye las imagenes sin usar cache
	docker compose build --no-cache

logs: ## Muestra los registros de todos los servicios
	docker compose logs -f --tail=50

ps: ## Lista los contenedores y su estado
	docker compose ps

probar: ## Prueba los endpoints a traves del proxy
	./scripts/probar.sh

limpiar: ## Baja los contenedores y borra los datos guardados
	docker compose down -v
