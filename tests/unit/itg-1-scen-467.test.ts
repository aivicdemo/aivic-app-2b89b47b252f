import { identifyNotificationRecipient } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("通知優先度判定 - 緊急度判定に失敗した場合、デフォルト優先度が適用される", () => {
    // SCEN-467

    // 通常ケース - 承認者在席中で正常な優先度判定
    const normalResult = identifyNotificationRecipient(
      "APP-001",
      "補助金申請",
      "部長承認",
      "APPROVER-001",
      true
    );
    
    expect(normalResult.recipientId).toBe("APPROVER-001");
    expect(normalResult.recipientType).toBe("primary_approver");
    expect(normalResult.notificationMethod).toBe("urgent_contact");
    expect(normalResult.escalationRequired).toBe(false);

    // 緊急度判定失敗ケース - 承認者不在で代理者も見つからない場合
    const failureResult = identifyNotificationRecipient(
      "APP-002",
      "一般事務",
      "課長承認",
      "APPROVER-002",
      false
    );
    
    expect(failureResult.recipientId).toBe("SUPERIOR-001");
    expect(failureResult.recipientType).toBe("superior_approver");
    expect(failureResult.notificationMethod).toBe("email");
    expect(failureResult.escalationRequired).toBe(true);

    // デフォルト優先度適用確認 - 補助金関連でない一般事務の場合
    const defaultPriorityResult = identifyNotificationRecipient(
      "APP-003",
      "人事関連",
      "係長承認",
      "APPROVER-003",
      true
    );
    
    expect(defaultPriorityResult.recipientId).toBe("APPROVER-003");
    expect(defaultPriorityResult.recipientType).toBe("primary_approver");
    expect(defaultPriorityResult.notificationMethod).toBe("email");
    expect(defaultPriorityResult.escalationRequired).toBe(false);
  });
});