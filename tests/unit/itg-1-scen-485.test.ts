import { 
  determineNotificationTargets,
  checkApprovalDelayAndNotify,
  handleDataCollectionError,
  sendAnomalyNotification
} from "../../src/logic/it-1-br-1779263788059-2-2-1";

const fetchMock = require("jest-fetch-mock");

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("承認結果通知で通知送信に失敗した場合にリトライ処理が実行される", async () => {
    // SCEN-485
    fetchMock.resetMocks();
    
    // 承認結果通知の基本データを準備
    const approvalResult = "承認";
    const applicationData = {
      applicant_id: "U001",
      department_id: "D001", 
      urgency_level: "high"
    };
    const approverInfo = {
      department: "総務部",
      role: "部長",
      authority_level: "高"
    };
    const documentClassification = {
      subsidyRelated: true,
      moeRequirement: true,
      paperStorageRequired: true
    };

    // 通知対象者を決定
    const notificationTargets = determineNotificationTargets(
      approvalResult,
      applicationData,
      approverInfo,
      documentClassification
    );

    // 期待される通知対象者（承認の場合）
    expect(notificationTargets.primaryTargets).toEqual(["U001", "supervisor_U001"]);
    expect(notificationTargets.secondaryTargets).toEqual(["finance_dept", "audit_dept", "manager_D001"]);
    expect(notificationTargets.notificationMethod).toBe("hybrid");
    expect(notificationTargets.auditTrailRequired).toBe(true);

    // 初回通知送信が失敗するケースをシミュレート
    fetchMock.mockResponseOnce("", { status: 500 });

    // エラー処理でリトライ判定
    const errorHandlingResult = handleDataCollectionError(
      "api_timeout",
      "通知送信",
      0,
      3
    );

    // リトライが実行される判定結果
    expect(errorHandlingResult.shouldRetry).toBe(true);
    expect(errorHandlingResult.retryDelaySeconds).toBe(30);
    expect(errorHandlingResult.shouldNotifyAdmin).toBe(false);
    expect(errorHandlingResult.errorHandlingAction).toBe("retry");

    // 2回目のリトライでも失敗
    const secondRetryResult = handleDataCollectionError(
      "api_timeout",
      "通知送信",
      1,
      3
    );

    expect(secondRetryResult.shouldRetry).toBe(true);
    expect(secondRetryResult.retryDelaySeconds).toBe(60);
    expect(secondRetryResult.shouldNotifyAdmin).toBe(false);
    expect(secondRetryResult.errorHandlingAction).toBe("retry");

    // 3回目でリトライ上限に達する
    const finalRetryResult = handleDataCollectionError(
      "api_timeout", 
      "通知送信",
      3,
      3
    );

    expect(finalRetryResult.shouldRetry).toBe(false);
    expect(finalRetryResult.retryDelaySeconds).toBe(0);
    expect(finalRetryResult.shouldNotifyAdmin).toBe(true);
    expect(finalRetryResult.errorHandlingAction).toBe("suspend_report");

    // 異常通知の送信
    const anomalyNotificationResult = sendAnomalyNotification(
      "通知送信失敗",
      "緊急",
      {
        発生時刻: new Date().toISOString(),
        影響範囲: "承認結果通知",
        測定値: "3回連続失敗"
      },
      "通知システム"
    );

    expect(anomalyNotificationResult.notificationTargets).toEqual(["システム管理者", "情報システム課長", "事務局長"]);
    expect(anomalyNotificationResult.notificationMethods).toEqual(["メール", "電話", "システム内通知"]);
    expect(anomalyNotificationResult.sendSuccess).toBe(true);
    expect(anomalyNotificationResult.escalationRequired).toBe(true);
  });
});