# Docker file for rannts (for those who do not want to install anything)


FROM ubuntu:xenial
MAINTAINER Sergey Arkhipov <nineseconds@yandex.ru>

# Environment variables
ENV HOME /root
ENV DEBIAN_FRONTEND noninteractive
ENV TERM linux

# Install stuff
RUN set -x && \
    apt-get -qq update && \
    apt-get -y install -qq apt-utils && \
    apt-get -y install -qq \
        libffi-dev \
        make \
        nodejs \
        nodejs-legacy \
        npm \
        python \
        python-dev \
        python-pip \
        vim && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install gosu
ENV GOSU_VERSION 1.9
RUN set -x  && \
    apt-get update && \
    apt-get install -y -qq ca-certificates wget && \
    rm -rf /var/lib/apt/lists/* && \
    dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')" && \
    wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch" && \
    chmod +x /usr/local/bin/gosu && \
    gosu nobody true

# Make entrypoint
RUN set -x && \
    echo '#!/bin/bash' > /entrypoint.sh && \
    echo 'useradd --shell /bin/bash -u $LUID -o -c "" -m user 2>/dev/null' >> /entrypoint.sh && \
    echo 'export HOME=/home/user' >> /entrypoint.sh && \
    echo 'export PATH=$HOME/.local/bin:$PATH' >> /entrypoint.sh && \
    echo 'exec /usr/local/bin/gosu user "$@"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
