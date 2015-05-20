FROM ubuntu:12.04

COPY . /src

RUN cd /src && apt-get update && apt-get install -y curl && curl -sL https://deb.nodesource.com/setup | bash - && apt-get install -y nodejs && npm install && rm -rf /var/lib/apt/lists/*

EXPOSE 3000

CMD cd /src && node app.js
