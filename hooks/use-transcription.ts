// hooks/use-transcription.ts
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { 
  useAudioRecorder, 
  AudioModule, 
  RecordingPresets, 
  setAudioModeAsync, 
  useAudioRecorderState 
} from 'expo-audio';

/** * Deepgram APIキー 
 * * 環境変数から取得。.envファイルに設定してください。
 * * 注意: 実際のアプリではセキュリティ上の理由から、APIキーをクライアント側に直接含めることは避け、
 * 安全なバックエンド経由でリクエストを中継することを推奨します。
 * 今回の実装では、簡易的に直接含めています。
 */
const DEEPGRAM_API_KEY = process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY || 'YOUR_DEEPGRAM_API_KEY_HERE';

/**
 * 音声録音と文字起こし機能を提供するカスタムフック
 * * @returns {Object} 録音状態、結果、操作関数を含むオブジェクト
 */
export const useTranscription = () => {
  
  // Expo Audioのレコーダー初期化（高品質プリセット）
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  // 録音時間や録音中フラグなどの状態を監視
  const recorderState = useAudioRecorderState(audioRecorder);

  /**
   * コンポーネントマウント時に実行
   * マイク使用権限の取得とオーディオモードの設定を行う
   */
  useEffect(() => {
    (async () => {
      // 1. マイク権限のリクエスト
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('権限エラー', 'マイクの使用を許可してください');
      }
      
      // 2. オーディオ動作の設定
      // allowsRecording: 録音を許可
      // playsInSilentMode: 消音モードでも音声を再生可能にする（文字起こし後の確認再生用など）
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
    })();
  }, []);

  /**
   * 録音を開始する
   * 以前の文字起こし結果をリセットし、レコーダーを準備してから開始します
   */
  const startRecording = async () => {
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (err) {
      console.error('Start Recording Error:', err);
      Alert.alert('エラー', '録音の開始に失敗しました');
    }
  };

  /**
   * 録音を停止し、録音されたデータをDeepgram APIに送信して文字起こしを行う
   */
  const stopRecordingAndTranscribe = async () => {
    try {
      // 1. 録音停止
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      if (!uri) {
        console.warn('録音URIが見つかりません');
        return;
      }

      // 2. 音声ファイルをBlobデータに変換
      // fetch(uri) を使うことで、ローカルファイルパスからバイナリデータを取得
      const fileResponse = await fetch(uri);
      const blob = await fileResponse.blob();

      // 3. Deepgram APIへの送信
      // モデル: nova-2 (最新の高精度モデル)
      // 言語: ja (日本語)
      // smart_format: true (句読点や数字の整形を有効化)
      const response = await fetch(
        'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=ja',
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${DEEPGRAM_API_KEY}`,
            'Content-Type': 'audio/wav', // ファイル形式に応じて適宜変更が必要な場合があります
          },
          body: blob,
        }
      );

      // 4. APIレスポンスの解析
      const result = await response.json();
      
      // Deepgramのレスポンス構造からテキストを抽出
      return result.results?.channels[0]?.alternatives[0]?.transcript || '文字が検出されませんでした';
      
    } catch (err) {
      console.error('Transcription Error:', err);
      return null;
    }
  };

  return {
    /** 録音中かどうか */
    isRecording: recorderState.isRecording,
    /** 現在の録音時間 (ms) */
    durationMillis: recorderState.durationMillis,
    /** 録音開始関数 */
    startRecording,
    /** 録音停止・文字起こし実行関数 */
    stopAndTranscribe: stopRecordingAndTranscribe,
  };
};