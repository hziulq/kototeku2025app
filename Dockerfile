FROM node:22-alpine

RUN apk update && apk add git

# 作業ディレクトリを /app に設定
WORKDIR /app

COPY package*.json ./

RUN npm install

# ソースコードをコンテナにコピー
COPY . .

EXPOSE 8081