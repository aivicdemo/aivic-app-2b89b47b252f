import { identifyNotificationRecipient } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("現在の承認段階に基づいて適切な承認者が特定される", () => {
    // SCEN-456
    
    // 正常ケース：担当承認者が在席中
    const result1 = identifyNotificationRecipient(
      "APP001",
      "補助金申請書",
      "部長承認",
      "EMP123",
      true
    );
    
    expect(result1).toEqual({
      recipientId: "EMP123",
      recipientType: "primary_approver",
      notificationMethod: "urgent_contact",
      escalationRequired: false
    });

    // 代理承認者が必要なケース：担当者不在
    const result2 = identifyNotificationRecipient(
      "APP002",
      "一般申請書",
      "課長承認",
      "EMP456",
      false
    );
    
    expect(result2).toEqual({
      recipientId: "EMP789",
      recipientType: "substitute_approver",
      notificationMethod: "email",
      escalationRequired: false
    });

    // 上位承認者エスカレーションが必要なケース：代理者も不在
    const result3 = identifyNotificationRecipient(
      "APP003",
      "subsidy_application",
      "理事承認",
      "EMP999",
      false
    );
    
    expect(result3).toEqual({
      recipientId: "EMP000",
      recipientType: "superior_approver",
      notificationMethod: "urgent_contact",
      escalationRequired: true
    });

    // エラーケース：申請案件が特定できない
    expect(() => {
      identifyNotificationRecipient(
        "",
        "補助金申請書",
        "部長承認",
        "EMP123",
        true
      );
    }).toThrow("催促対象の申請案件が特定できません。正しい申請番号を確認してください。");

    // エラーケース：承認段階が不明
    expect(() => {
      identifyNotificationRecipient(
        "APP001",
        "補助金申請書",
        "",
        "EMP123",
        true
      );
    }).toThrow("承認フローの現在段階を特定できません。申請状況を確認してください。");

    // エラーケース：承認者が特定できない
    expect(() => {
      identifyNotificationRecipient(
        "APP001",
        "unknown_type",
        "無効段階",
        "",
        false
      );
    }).toThrow("催促通知の送信先を特定できません。システム管理者にお問い合わせください。");
  });
});