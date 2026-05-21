// AIVIC Backend Configuration
// AIVIC_APP_URL 環境変数が設定されている場合は自動セットされます
// 未設定の場合: REPLACE_WITH_API_URL を AIVIC アプリの URL（例: https://your-app.amplifyapp.com）に書き換えてください

window.AIVIC_API_URL = "REPLACE_WITH_API_URL";
window.AIVIC_TABLES = {
  "ユーザー": 0,
  "申請書類": 1,
  "文書種別マスタ": 2,
  "承認フロー定義": 3,
  "承認ステップ": 4,
  "承認履歴": 5,
  "承認者割当": 6,
  "通知履歴": 7,
  "処理ルート変更履歴": 8,
  "文書判別ルール": 9,
  "遅延検知設定": 10
};
