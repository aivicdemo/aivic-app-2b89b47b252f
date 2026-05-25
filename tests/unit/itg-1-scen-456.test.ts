import { identifyNotificationRecipient } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("現在の承認段階に基づいて適切な承認者が特定される", () => {
    // SCEN-456
    
    // 通常の承認者が在席中の場合
    const result1 = identifyNotificationRecipient(
      "APP-2024-001",
      "補助金申請",
      "部長承認",
      "EMP-2024-005",
      true
    );
    
    expect(result1.recipientId).toBe("EMP-2024-005");
    expect(result1.recipientType).toBe("primary_approver");
    expect(result1.notificationMethod).toBe("urgent_contact");
    expect(result1.escalationRequired).toBe(false);
    
    // 承認者が不在で代理者が必要な場合
    const result2 = identifyNotificationRecipient(
      "APP-2024-002",
      "一般申請",
      "課長承認",
      "EMP-2024-010",
      false
    );
    
    expect(result2.recipientType).toBe("substitute_approver");
    expect(result2.notificationMethod).toBe("email");
    expect(result2.escalationRequired).toBe(false);
    
    // 代理者も見つからずエスカレーションが必要な場合
    const result3 = identifyNotificationRecipient(
      "APP-2024-003",
      "補助金申請",
      "理事承認",
      "EMP-2024-015",
      false
    );
    
    expect(result3.recipientType).toBe("superior_approver");
    expect(result3.escalationRequired).toBe(true);
    expect(result3.notificationMethod).toBe("urgent_contact");
  });
});