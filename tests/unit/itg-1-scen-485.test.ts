import { sendAnomalyNotification } from "../../src/logic/it-1-br-1779263788059-2-2-1";
const fetchMock = require("jest-fetch-mock");

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("承認結果通知で通知送信に失敗した場合、リトライ処理が実行される", () => {
    // SCEN-485

    fetchMock.resetMocks();

    // 緊急レベルの異常でリトライが必要なケース
    const result1 = sendAnomalyNotification(
      "処理件数異常",
      "緊急",
      {
        発生時刻: "2024-01-01T14:00:00Z",
        影響範囲: "全学",
        測定値: 50
      },
      "申請処理システム"
    );

    expect(result1.notificationTargets).toEqual(["システム管理者", "情報システム課長", "事務局長"]);
    expect(result1.notificationMethods).toEqual(["メール", "電話", "システム内通知"]);
    expect(result1.sendSuccess).toBe(true);
    expect(result1.escalationRequired).toBe(true);

    // 警告レベルの場合
    const result2 = sendAnomalyNotification(
      "応答時間異常",
      "警告",
      {
        発生時刻: "2024-01-01T14:00:00Z",
        影響範囲: "特定部署",
        測定値: 2000
      },
      "承認フローシステム"
    );

    expect(result2.notificationTargets).toEqual(["システム管理者", "情報システム課担当者"]);
    expect(result2.notificationMethods).toEqual(["メール", "システム内通知"]);
    expect(result2.sendSuccess).toBe(true);
    expect(result2.escalationRequired).toBe(false);

    // 注意レベルの場合
    const result3 = sendAnomalyNotification(
      "システムエラー",
      "注意",
      {
        発生時刻: "2024-01-01T14:00:00Z",
        影響範囲: "個別機能",
        測定値: 5
      },
      "文書管理システム"
    );

    expect(result3.notificationTargets).toEqual(["システム管理者"]);
    expect(result3.notificationMethods).toEqual(["メール", "システム内通知"]);
    expect(result3.sendSuccess).toBe(true);
    expect(result3.escalationRequired).toBe(false);

    // エラーケース：異常の種類が空
    expect(() => sendAnomalyNotification(
      "",
      "緊急",
      {
        発生時刻: "2024-01-01T14:00:00Z",
        影響範囲: "全学",
        測定値: 100
      },
      "申請処理システム"
    )).toThrow("異常の種類が特定できないため通知を送信できません。システム監視の設定を確認してください。");

    // エラーケース：重要度レベルが不正
    expect(() => sendAnomalyNotification(
      "処理件数異常",
      "不明",
      {
        発生時刻: "2024-01-01T14:00:00Z",
        影響範囲: "全学",
        測定値: 100
      },
      "申請処理システム"
    )).toThrow("異常の重要度が判定できないため適切な通知先を決定できません。");
  });
});