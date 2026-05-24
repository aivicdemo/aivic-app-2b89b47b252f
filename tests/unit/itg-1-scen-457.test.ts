import { identifyNotificationRecipient } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("承認者が不在の場合、代理承認者が特定される", () => {
    // SCEN-457

    // 承認者が在席中で通常の担当者が対応可能な場合
    const normalCase = identifyNotificationRecipient(
      "APP001",
      "補助金申請書",
      "部長承認",
      "USR001", 
      true
    );

    expect(normalCase).toEqual({
      recipientId: "USR001",
      recipientType: "primary_approver",
      notificationMethod: "urgent_contact",
      escalationRequired: false
    });

    // 承認者が不在で代理承認者が対応する場合
    const substituteCase = identifyNotificationRecipient(
      "APP002", 
      "一般申請書",
      "課長承認",
      "USR002",
      false
    );

    expect(substituteCase).toEqual({
      recipientId: "SUB002",
      recipientType: "substitute_approver", 
      notificationMethod: "email",
      escalationRequired: false
    });

    // 代理承認者も見つからず上位承認者にエスカレーションする場合
    const escalationCase = identifyNotificationRecipient(
      "APP003",
      "補助金申請書", 
      "係長承認",
      "USR003",
      false
    );

    expect(escalationCase).toEqual({
      recipientId: "SUP003",
      recipientType: "superior_approver",
      notificationMethod: "urgent_contact", 
      escalationRequired: true
    });

    // 申請案件の識別番号が空の場合のエラー
    expect(() => identifyNotificationRecipient(
      "",
      "補助金申請書",
      "部長承認", 
      "USR001",
      true
    )).toThrow("催促対象の申請案件が特定できません。正しい申請番号を確認してください。");

    // 承認段階の情報が取得できない場合のエラー
    expect(() => identifyNotificationRecipient(
      "APP004",
      "補助金申請書",
      "",
      "USR001", 
      true
    )).toThrow("承認フローの現在段階を特定できません。申請状況を確認してください。");
  });
});