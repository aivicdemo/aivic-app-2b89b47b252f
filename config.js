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
  "通知履歴": 6,
  "処理ルート": 7,
  "遅延検知設定": 8,
  "補助金関連度マスタ": 9
};
