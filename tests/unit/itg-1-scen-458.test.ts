import { identifyNotificationRecipient } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("催促通知宛先特定 - 承認者も代理承認者も特定できない場合、エラーが発生する", () => {
    // SCEN-458

    // 承認者も代理承認者も特定できない場合
    expect(() => 
      identifyNotificationRecipient(
        "APP-12345",
        "補助金申請",
        "部長承認",
        "",  // 承認権限者が空
        false  // 承認者が不在
      )
    ).toThrow("催促通知の送信先を特定できません。システム管理者にお問い合わせください。");

    // 承認権限者がいても代理者が見つからない場合
    expect(() => 
      identifyNotificationRecipient(
        "APP-12346",
        "一般申請",
        "課長承認",
        "invalid-approver-id",  // 存在しない承認者ID
        false  // 承認者が不在
      )
    ).toThrow("催促通知の送信先を特定できません。システム管理者にお問い合わせください。");

    // 正常ケース: 承認権限者が在席している場合
    const normalResult = identifyNotificationRecipient(
      "APP-12347",
      "補助金申請",
      "部長承認",
      "approver-001",
      true
    );

    expect(normalResult).toEqual({
      recipientId: "approver-001",
      recipientType: "primary_approver",
      notificationMethod: "urgent_contact",
      escalationRequired: false
    });

    // 正常ケース: 代理承認者が見つかる場合
    const substituteResult = identifyNotificationRecipient(
      "APP-12348",
      "一般申請",
      "課長承認",
      "approver-002",
      false
    );

    expect(substituteResult).toEqual({
      recipientId: "substitute-002",
      recipientType: "substitute_approver",
      notificationMethod: "email",
      escalationRequired: false
    });
  });
});