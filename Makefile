# -----------------------------------------------------------------------------
#  This is a makefile to build rannts website.
#
#  It is assumed that you are working with virtualenv and it is possible
#  to pip install.
#
#  Sorry if not.
#
# -----------------------------------------------------------------------------

ROOT_DIR  := "$(strip $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST)))))"
TARGET    := "$(CURDIR)/output"
GULP_FLAG := gulp

# -----------------------------------------------------------------------------

all: server
dependencies: python node

server: dependencies
	@cd "$(ROOT_DIR)" && lektor server

server_all: dependencies
	@cd "$(ROOT_DIR)" && lektor server -f "$(GULP_FLAG)"

build: dependencies
	@cd "$(ROOT_DIR)" && lektor build -f "$(GULP_FLAG)" -O "$(TARGET)"

python:
	@pip install -r "$(ROOT_DIR)/requirements.txt"

node:
	@cd "$(ROOT_DIR)" && npm install

clean:
	@rm -rf "$(HOME)/.cache/lektor" && cd "$(ROOT_DIR)" && lektor clean --yes
