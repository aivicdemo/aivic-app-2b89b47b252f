import { identifyNotificationRecipient } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("承認者が不在の場合、代理承認者が特定される", () => {
    // SCEN-457
    
    // 承認者が不在の場合のテスト
    const result1 = identifyNotificationRecipient(
      "APP-001",
      "補助金申請書",
      "部長承認",
      "U123",
      false
    );
    
    const substitute = { id: "U456" };
    const expectedResult1 = {
      recipientId: "U456",
      recipientType: "substitute_approver",
      notificationMethod: "urgent_contact",
      escalationRequired: false
    };
    
    expect(result1).toEqual(expectedResult1);

    // 承認者が在席中の場合のテスト
    const result2 = identifyNotificationRecipient(
      "APP-002",
      "一般申請書",
      "課長承認",
      "U789",
      true
    );
    
    const primaryApprover = { id: "U789" };
    const expectedResult2 = {
      recipientId: "U789",
      recipientType: "primary_approver",
      notificationMethod: "email",
      escalationRequired: false
    };
    
    expect(result2).toEqual(expectedResult2);

    // 代理承認者も見つからない場合の上位承認者エスカレーション
    const result3 = identifyNotificationRecipient(
      "APP-003",
      "subsidy_grant",
      "理事承認",
      "U999",
      false
    );
    
    const superior = { id: "U1000" };
    const expectedResult3 = {
      recipientId: "U1000",
      recipientType: "superior_approver",
      notificationMethod: "urgent_contact",
      escalationRequired: true
    };
    
    expect(result3).toEqual(expectedResult3);
  });
});