# -----------------------------------------------------------------------------
#  This is a makefile to build rannts website.
#
#  It is assumed that you are working with virtualenv and it is possible
#  to pip install.
#
#  Sorry if not.
#
# -----------------------------------------------------------------------------

ROOT_DIR     := "$(strip $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST)))))"
TARGET       := "$(CURDIR)/output"
NODE_DIR     := "$(ROOT_DIR)/node_modules"
NCU          := "$(NODE_DIR)/npm-check-updates/bin/ncu"
GULP_FLAG    := gulp
DOCKER_IMAGE := rannts
DOCKER_PORT  := 5000

# -----------------------------------------------------------------------------

all: server
dependencies: python node
clean_all: clean docker_clean

server: dependencies
	@cd "$(ROOT_DIR)" && \
		lektor server

server_all: dependencies
	@cd "$(ROOT_DIR)" && \
		lektor server -f "$(GULP_FLAG)" -h 0.0.0.0

build:
	@cd "$(ROOT_DIR)" && \
		lektor build -f "$(GULP_FLAG)" -O "$(TARGET)"

deploy: clean dependencies
	@cd "$(ROOT_DIR)" && \
		lektor build -f "$(GULP_FLAG)" && \
		lektor deploy production

docker_build: docker_create
	@docker run \
		-i \
		-t \
		--rm=true \
		-v "$(ROOT_DIR)":/rannts \
		-e LUID=$(shell id -u) \
		-w /rannts \
		"$(DOCKER_IMAGE)" \
		make build

docker_server: docker_create
	@docker run \
		-i \
		-t \
		--rm=true \
		-v "$(ROOT_DIR)":/rannts \
		-e LUID=$(shell id -u) \
		-w /rannts \
		-p 5000:$(DOCKER_PORT)
		"$(DOCKER_IMAGE)" \
		make server_all

docker_create:
	@cd "$(ROOT_DIR)" && \
		docker build --rm=true --pull -t "$(DOCKER_IMAGE)" .

docker_clean: docker_clean_containers
	@docker images -a -q "$(DOCKER_IMAGE)" | xargs -r docker rmi

docker_clean_containers: docker_stop_containers
	@docker ps -a -q -f ancestor="$(shell docker images -a -q $(DOCKER_IMAGE))" | xargs -r docker rm

docker_stop_containers:
	@docker ps -a -q -f ancestor="$(shell docker images -a -q $(DOCKER_IMAGE))" | xargs -r docker stop

python:
	@pip install -r "$(ROOT_DIR)/requirements.txt"

node:
	@cd "$(ROOT_DIR)" && \
		npm install

node_update:
	@$(NCU) -a

node_update_nbc:
	@$(NCU) -at

clean:
	@rm -rf "$(HOME)/.cache/lektor" && \
		cd "$(ROOT_DIR)" && \
		lektor clean --yes
