# -----------------------------------------------------------------------------
#  This is a makefile to build rannts website.
#
#  It is assumed that you are working with virtualenv and it is possible
#  to pip install.
#
#  Sorry if not.
#
# -----------------------------------------------------------------------------

ROOT_DIR := "$(strip $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST)))))"
TARGET   := "$(CURDIR)/output"

# -----------------------------------------------------------------------------

all: server
dependencies: python node

server: dependencies
	@cd "$(ROOT_DIR)" && lektor server

build: dependencies
	@cd "$(ROOT_DIR)" && lektor build -O "$(TARGET)"


python:
	@pip install -r "$(ROOT_DIR)/requirements.txt"

node:
	@cd "$(ROOT_DIR)" && npm install

clean:
	@rm -rf "$(HOME)/.cache/lektor" && cd "$(ROOT_DIR)" && lektor clean --yes
