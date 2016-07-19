# rannts

rannts is a meetup of Python community of Nizhny Novgorod. This is a static website for [rannts.ru](http://rannts.ru).

This site is build with Lektor, using Gulp, SASS and Vanilla.js. If you are interested in hacking on the code, please read documentation on these tools.

# Installation

## On a local machine

Quite simple. Please be sure that pip, npm and nodejs are installed. After that do following:

```shell
$ pip install -r requirements.txt
$ npm install
$ lektor server -f gulp
```

webserver will be run on `127.0.0.1:5000`. If you want to build it, do

```shell
$ lektor build -f gulp -O ./output
```

Build flag `-f gulp` is necessary if you want to build static assets. If not, it is ok. But no CSS, JS and pictures will be available.

## On a local machine with Makefile

This simplifies a build chain above:

```shell
$ make
```

will install Python packages, npm stuff and run server (without Gulp).

```shell
$ make server_all
```

will do the same, but will track static changes.

```shell
$ make build
```

will build site to `./output` directory.

## I do not want to pollute my system with node and eggs

It is perfectly fine. If you have a docker, just run

```shell
$ make docker_build
$ make docker_server
```

Both commands build image `rannts`. First command builds a static website into `./output` directory on the host, second - will run server with Gulp and expose 5000 port to the localhost (in other words, you may proceed to `http://127.0.0.1:5000` and edit content). All changes will be tracked on the host **with proper permissions**.

## How to deploy

```shell
lektor clean && lektor build && lektor deploy
```

or

```shell
$ make deploy
```
