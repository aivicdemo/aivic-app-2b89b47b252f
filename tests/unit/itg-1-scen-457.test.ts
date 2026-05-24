import { identifyNotificationRecipient } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("承認者が不在の場合、代理承認者が特定される", () => {
    // SCEN-457
    
    // 承認者が不在の場合
    const result1 = identifyNotificationRecipient(
      "APP-001",
      "補助金申請",
      "部長承認",
      "USER-002",
      false
    );
    
    expect(result1.recipientId).toBe("USER-003");
    expect(result1.recipientType).toBe("substitute_approver");
    expect(result1.notificationMethod).toBe("urgent_contact");
    expect(result1.escalationRequired).toBe(false);
    
    // 担当承認者が在席中の場合
    const result2 = identifyNotificationRecipient(
      "APP-001",
      "補助金申請",
      "部長承認", 
      "USER-002",
      true
    );
    
    expect(result2.recipientId).toBe("USER-002");
    expect(result2.recipientType).toBe("primary_approver");
    expect(result2.notificationMethod).toBe("urgent_contact");
    expect(result2.escalationRequired).toBe(false);
    
    // 代理承認者も見つからない場合
    const result3 = identifyNotificationRecipient(
      "APP-001",
      "一般事務",
      "課長承認",
      "USER-004",
      false
    );
    
    expect(result3.recipientId).toBe("USER-005");
    expect(result3.recipientType).toBe("superior_approver");
    expect(result3.notificationMethod).toBe("email");
    expect(result3.escalationRequired).toBe(true);
  });
});