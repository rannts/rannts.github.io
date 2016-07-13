GULP     := node_modules/gulp-cli/bin/gulp.js
GULP_RUN := nodejs $(GULP)

# -----------------------------------------------------------------------------

all: build

node_packages:
	@npm install

build: node_packages
	@$(GULP_RUN) default

watch: node_packages
	@$(GULP_RUN) watch
