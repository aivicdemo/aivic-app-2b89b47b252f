import { identifyNotificationRecipient } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("現在の承認段階に基づいて適切な承認者が特定される", () => {
    // SCEN-456
    // 担当承認者が在席中で対応可能な場合
    const result1 = identifyNotificationRecipient(
      "APP-001",
      "補助金申請書",
      "部長承認",
      "EMP-001",
      true
    );
    expect(result1).toEqual({
      recipientId: "EMP-001",
      recipientType: "primary_approver",
      notificationMethod: "urgent_contact",
      escalationRequired: false
    });

    // 承認者が不在で代理承認者を特定する場合
    const result2 = identifyNotificationRecipient(
      "APP-002",
      "一般事務申請書",
      "課長承認",
      "EMP-002",
      false
    );
    expect(result2).toEqual({
      recipientId: "substitute_001",
      recipientType: "substitute_approver",
      notificationMethod: "email",
      escalationRequired: false
    });

    // 代理者も見つからず上位承認者に回す場合
    const result3 = identifyNotificationRecipient(
      "APP-003",
      "人事関連申請書",
      "理事承認",
      "EMP-003",
      false
    );
    expect(result3).toEqual({
      recipientId: "superior_001",
      recipientType: "superior_approver",
      notificationMethod: "email",
      escalationRequired: true
    });

    // 申請案件の識別番号が空または無効な場合
    expect(() => identifyNotificationRecipient(
      "",
      "補助金申請書",
      "部長承認",
      "EMP-001",
      true
    )).toThrow("催促対象の申請案件が特定できません。正しい申請番号を確認してください。");

    // 承認段階の情報が取得できない場合
    expect(() => identifyNotificationRecipient(
      "APP-004",
      "補助金申請書",
      "",
      "EMP-001",
      true
    )).toThrow("承認フローの現在段階を特定できません。申請状況を確認してください。");

    // 承認権限者も代理者も特定できない場合
    expect(() => identifyNotificationRecipient(
      "APP-005",
      "不明文書",
      "不明段階",
      "",
      false
    )).toThrow("催促通知の送信先を特定できません。システム管理者にお問い合わせください。");
  });
});