FROM node:22-alpine

RUN apk update && apk add git

# 作業ディレクトリを /app に設定
WORKDIR /app

COPY package*.json ./

RUN npm install

# Expo Audioパッケージをインストール。
# ここに書きたくないけど、とりあえず動かすために仕方なく記載。
RUN npx expo install expo-audio

# ソースコードをコンテナにコピー
COPY . .

EXPOSE 8081