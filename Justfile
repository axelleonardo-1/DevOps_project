set shell := ["sh", "-cu"]

default:
    just --list

up:
    COMPOSE_MENU=false docker compose up --build -d

down:
    COMPOSE_MENU=false docker compose down

teardown:
    COMPOSE_MENU=false docker compose down --remove-orphans

rebuild:
    COMPOSE_MENU=false docker compose down --remove-orphans
    COMPOSE_MENU=false docker compose up --build -d

restart:
    COMPOSE_MENU=false docker compose down
    COMPOSE_MENU=false docker compose up --build -d

logs:
    COMPOSE_MENU=false docker compose logs -f

ps:
    COMPOSE_MENU=false docker compose ps

frontend-env:
    cp frontend/.env.example frontend/.env

test-products:
    COMPOSE_MENU=false docker compose exec products npm test

test-orders:
    COMPOSE_MENU=false docker compose exec orders npm test

test:
    just test-products
    just test-orders

clean:
    COMPOSE_MENU=false docker compose down --volumes --remove-orphans
