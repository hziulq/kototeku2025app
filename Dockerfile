FROM node:22-alpine

RUN apk update && apk add git

# 作業ディレクトリを /app に設定
WORKDIR /app

COPY package*.json ./

RUN npm install
# npm install で expo-sqlite がインストールされないため、手動でインストール。
# もっと良い方法があればそちらを採用したい。
RUN npx expo install expo-sqlite
# ソースコードをコンテナにコピー
COPY . .

EXPOSE 8081