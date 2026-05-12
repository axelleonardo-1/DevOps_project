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

tf-init:
    terraform -chdir=infra/terraform init

tf-fmt:
    terraform -chdir=infra/terraform fmt

tf-validate:
    terraform -chdir=infra/terraform validate

tf-plan:
    terraform -chdir=infra/terraform plan

tf-apply:
    terraform -chdir=infra/terraform apply

tf-destroy:
    terraform -chdir=infra/terraform destroy

tf-destroy-auto:
    terraform -chdir=infra/terraform destroy -auto-approve

tf-output:
    terraform -chdir=infra/terraform output

tf-d1-ids:
    terraform -chdir=infra/terraform output d1_database_ids

tf-r2-names:
    terraform -chdir=infra/terraform output r2_bucket_names

tf-check:
    just tf-fmt
    just tf-validate
    just tf-plan

test-products:
    COMPOSE_MENU=false docker compose exec products npm test

test-orders:
    COMPOSE_MENU=false docker compose exec orders npm test

test:
    just test-products
    just test-orders

clean:
    COMPOSE_MENU=false docker compose down --volumes --remove-orphans
