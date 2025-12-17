// app/(tabs)/transcription.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useTranscription } from '../../hooks/use-transcription';

/**
 * AI文字おこし機能のメイン画面コンポーネント
 * * 録音の開始・停止操作、録音時間の表示、および
 * Deepgram APIから取得したテキスト結果の表示を行います。
 */
export default function TranscriptionScreen() {
  // カスタムフックから録音状態と操作関数を取得
  const { 
    transcript, 
    isLoading, 
    isRecording, 
    durationMillis, 
    startRecording, 
    stopRecordingAndTranscribe 
  } = useTranscription();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI文字おこしテスト</Text>

      {/* 録音操作セクション：タイマー表示とメインボタン */}
      <View style={styles.recorderContainer}>
        {/* ミリ秒を秒単位に変換して表示 */}
        <Text style={styles.timer}>
          {Math.floor(durationMillis / 1000)}s
        </Text>
        
        <TouchableOpacity 
          // 録音中かどうかでボタンのスタイル（青/赤）を動的に切り替え
          style={[styles.button, isRecording ? styles.stopButton : styles.startButton]} 
          onPress={isRecording ? stopRecordingAndTranscribe : startRecording}
          // APIリクエスト中は二重押し防止のため無効化
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isRecording ? '録音を止めて変換' : '録音を開始する'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 結果表示セクション：取得したテキストをスクロール可能に表示 */}
      <View style={styles.resultContainer}>
        <Text style={styles.subtitle}>結果:</Text>
        <ScrollView style={styles.scroll}>
          <Text style={styles.transcriptText}>
            {/* 1. テキストがある場合はそれを表示
                2. 処理中の場合は「変換中...」を表示
                3. 何もない場合はプレースホルダーを表示 
            */}
            {transcript || (isLoading ? '変換中...' : 'ここに結果が表示されます')}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

/**
 * スタイル定義
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  recorderContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timer: {
    fontSize: 48,
    fontWeight: '300',
    marginBottom: 20,
    // 数字の幅を一定に保つことで、カウントアップ時の文字の揺れを防ぐ
    fontVariant: ['tabular-nums'],
  },
  button: {
    width: '80%',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#007AFF', // iOS標準のブルー
  },
  stopButton: {
    backgroundColor: '#FF3B30', // iOS標準のレッド
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    // iOS用のシャドウ設定
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android用のシャドウ設定
    elevation: 3,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  scroll: {
    flex: 1,
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});