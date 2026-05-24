import { identifyNotificationRecipient } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("承認遅延が発生している申請案件で催促通知の送信対象者を特定する", () => {
    // SCEN-483

    // 補助金関連の緊急連絡が必要なケース
    const result1 = identifyNotificationRecipient(
      "APP-001",
      "補助金申請書",
      "部長承認",
      "MGR-001",
      true
    );

    expect(result1).toEqual({
      recipientId: "MGR-001",
      recipientType: "primary_approver", 
      notificationMethod: "urgent_contact",
      escalationRequired: false
    });

    // 一般事務で代理承認者が必要なケース
    const result2 = identifyNotificationRecipient(
      "APP-002", 
      "人事関連",
      "課長承認",
      "MGR-002",
      false
    );

    expect(result2).toEqual({
      recipientId: "SUB-001",
      recipientType: "substitute_approver",
      notificationMethod: "email", 
      escalationRequired: false
    });

    // 承認権限者不在で上位エスカレーションが必要なケース
    const result3 = identifyNotificationRecipient(
      "APP-003",
      "一般事務",
      "理事承認", 
      "MGR-003",
      false
    );

    expect(result3).toEqual({
      recipientId: "DIR-001",
      recipientType: "superior_approver",
      notificationMethod: "email",
      escalationRequired: true
    });

    // 申請案件IDが空の場合のエラー
    expect(() => identifyNotificationRecipient(
      "",
      "補助金申請書",
      "部長承認", 
      "MGR-001",
      true
    )).toThrow("催促対象の申請案件が特定できません。正しい申請番号を確認してください。");

    // 承認段階が不明な場合のエラー
    expect(() => identifyNotificationRecipient(
      "APP-001",
      "補助金申請書",
      "",
      "MGR-001", 
      true
    )).toThrow("承認フローの現在段階を特定できません。申請状況を確認してください。");

    // 承認権限者も代理者も特定できない場合のエラー
    expect(() => identifyNotificationRecipient(
      "APP-001",
      "補助金申請書",
      "invalid_stage",
      "",
      false
    )).toThrow("催促通知の送信先を特定できません。システム管理者にお問い合わせください。");
  });
});