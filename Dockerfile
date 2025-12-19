FROM node:22-alpine

RUN apk update && apk add git

# 作業ディレクトリを /app に設定
WORKDIR /app

COPY package*.json ./


# 必要なパッケージをインストール。
# ここに書きたくないけど、とりあえず動かすために仕方なく記載。
RUN npx expo install expo-audio
RUN npx expo install expo-sqlite
RUN npx expo install @react-native-community/datetimepicker
RUN npx expo install react-native-calendars

RUN npm install

# ソースコードをコンテナにコピー
COPY . .

EXPOSE 8081