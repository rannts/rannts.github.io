FROM ubuntu:xenial
MAINTAINER Sergey Arkhipov <nineseconds@yandex.ru>

ENV TERM=linux DEBIAN_FRONTEND=noninteractive

ADD https://deb.nodesource.com/gpgkey/nodesource.gpg.key /tmp/node.gpg
ADD https://dl.yarnpkg.com/debian/pubkey.gpg /tmp/yarn.gpg
ADD https://github.com/tianon/gosu/releases/download/1.10/gosu-amd64 /usr/local/bin/gosu

RUN set -x \
    && apt-key add /tmp/node.gpg \
    && apt-key add /tmp/yarn.gpg \
    && apt-get update \
    && apt-get -y install --no-install-recommends \
      apt-transport-https \
      ca-certificates \
    && echo "deb https://deb.nodesource.com/node_7.x xenial main" > /etc/apt/sources.list.d/node.list \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list \
    && apt-get update \
    && apt-get -y install --no-install-recommends \
      g++ \
      bzip2 \
      gcc \
      git \
      libffi-dev \
      libfontconfig1 \
      libssl-dev \
      make \
      nodejs \
      python \
      python-dev \
      python-pip \
      python-setuptools \
      python-virtualenv \
      python-wheel \
      tar \
      xz-utils \
      yarn \
    && apt-get remove --purge -y curl \
    && apt-get autoremove -y \
    && apt-get clean \
    && chmod +x /usr/local/bin/gosu \
    && echo '#!/bin/bash' > /go \
    && echo 'useradd --shell /bin/bash -u $UID -o -c "" -m user 2>/dev/null' >> /go \
    && echo 'export HOME=/home/user' >> /go \
    && echo 'export PATH=$HOME/.local/bin:$PATH' >> /go \
    && echo 'exec /usr/local/bin/gosu user "$@"' >> /go \
    && chmod +x /go \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
