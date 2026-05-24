import { identifyNotificationRecipient } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("SCEN-456: 催促通知宛先特定 - 現在の承認段階に基づいて適切な承認者が特定される", () => {
    // 承認者が在席中で対応可能な場合
    const result1 = identifyNotificationRecipient(
      "APP-001",
      "補助金申請",
      "部長承認",
      "EMP-123",
      true
    );
    expect(result1.recipientId).toBe("EMP-123");
    expect(result1.recipientType).toBe("primary_approver");
    expect(result1.notificationMethod).toBe("urgent_contact");
    expect(result1.escalationRequired).toBe(false);

    // 承認者が不在で代理承認者が必要な場合
    const result2 = identifyNotificationRecipient(
      "APP-002",
      "一般事務",
      "課長承認",
      "EMP-456",
      false
    );
    expect(result2.recipientId).toBe("substitute-id");
    expect(result2.recipientType).toBe("substitute_approver");
    expect(result2.notificationMethod).toBe("email");
    expect(result2.escalationRequired).toBe(false);

    // 代理承認者も見つからず上位承認者が必要な場合
    const result3 = identifyNotificationRecipient(
      "APP-003",
      "補助金申請",
      "理事承認",
      "EMP-789",
      false
    );
    expect(result3.recipientId).toBe("superior-id");
    expect(result3.recipientType).toBe("superior_approver");
    expect(result3.notificationMethod).toBe("urgent_contact");
    expect(result3.escalationRequired).toBe(true);

    // エラーケース - 申請案件IDが空
    expect(() => identifyNotificationRecipient(
      "",
      "補助金申請",
      "部長承認",
      "EMP-123",
      true
    )).toThrow("催促対象の申請案件が特定できません。正しい申請番号を確認してください。");

    // エラーケース - 承認段階が不明
    expect(() => identifyNotificationRecipient(
      "APP-001",
      "補助金申請",
      "",
      "EMP-123",
      true
    )).toThrow("承認フローの現在段階を特定できません。申請状況を確認してください。");

    // エラーケース - 承認権限者と代理者が特定不可
    expect(() => identifyNotificationRecipient(
      "APP-001",
      "不明文書",
      "不明段階",
      "",
      false
    )).toThrow("催促通知の送信先を特定できません。システム管理者にお問い合わせください。");
  });
});