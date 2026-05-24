import { identifyNotificationRecipient } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("催促通知宛先特定 - 承認者も代理承認者も特定できない場合、エラーが発生する", () => {
    // SCEN-458

    expect(() => 
      identifyNotificationRecipient(
        "APP-001",
        "補助金申請",
        "課長承認",
        "APPROVER-999",
        false
      )
    ).toThrow("催促通知の送信先を特定できません。システム管理者にお問い合わせください。");

    expect(() =>
      identifyNotificationRecipient(
        "APP-002",
        "設備申請",
        "部長承認",
        "INVALID-ID",
        false
      )
    ).toThrow("催促通知の送信先を特定できません。システム管理者にお問い合わせください。");

    expect(() =>
      identifyNotificationRecipient(
        "",
        "補助金申請",
        "課長承認",
        "APPROVER-001",
        true
      )
    ).toThrow("催促対象の申請案件が特定できません。正しい申請番号を確認してください。");

    const validResult = identifyNotificationRecipient(
      "APP-003",
      "補助金申請",
      "課長承認",
      "APPROVER-001",
      true
    );

    expect(validResult).toEqual({
      recipientId: "APPROVER-001",
      recipientType: "primary_approver",
      notificationMethod: "urgent_contact",
      escalationRequired: false
    });

    const substituteResult = identifyNotificationRecipient(
      "APP-004",
      "一般申請",
      "課長承認",
      "SUB-APPROVER-001",
      false
    );

    expect(substituteResult).toEqual({
      recipientId: "SUB-APPROVER-001",
      recipientType: "substitute_approver",
      notificationMethod: "email",
      escalationRequired: false
    });

    const escalationResult = identifyNotificationRecipient(
      "APP-005",
      "subsidy申請",
      "部長承認",
      "SUPERIOR-001",
      true
    );

    expect(escalationResult).toEqual({
      recipientId: "SUPERIOR-001",
      recipientType: "superior_approver",
      notificationMethod: "urgent_contact",
      escalationRequired: true
    });
  });
});