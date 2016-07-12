GULP     := node_modules/gulp-cli/bin/gulp.js
GULP_RUN := nodejs $(GULP)

# -----------------------------------------------------------------------------

all: node_packages build

node_packages:
	@npm install

build:
	@$(GULP_RUN) default

watch:
	@$(GULP_RUN) watch
