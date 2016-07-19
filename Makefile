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
GULP_FLAG    := gulp
DOCKER_IMAGE := rannts

# -----------------------------------------------------------------------------

all: server
dependencies: python node

server: dependencies
	@cd "$(ROOT_DIR)" && lektor server

server_all: dependencies
	@cd "$(ROOT_DIR)" && lektor server -f "$(GULP_FLAG)" -h 0.0.0.0

build: dependencies
	@cd "$(ROOT_DIR)" && lektor build -f "$(GULP_FLAG)" -O "$(TARGET)"

docker_build: docker_create
	@docker run -it -v "$(ROOT_DIR)":/rannts -e LUID=$(shell id -u) -w /rannts --rm=true "$(DOCKER_IMAGE)" make build

docker_server: docker_create
	@docker run -it -v "$(ROOT_DIR)":/rannts -e LUID=$(shell id -u) -w /rannts -p 5000:5000 --rm=true "$(DOCKER_IMAGE)" make server_all

docker_create:
	@cd "$(ROOT_DIR)" && docker build -t "$(DOCKER_IMAGE)" .

python:
	@pip install -r "$(ROOT_DIR)/requirements.txt"

node:
	@cd "$(ROOT_DIR)" && npm install

clean:
	@rm -rf "$(HOME)/.cache/lektor" && cd "$(ROOT_DIR)" && lektor clean --yes
