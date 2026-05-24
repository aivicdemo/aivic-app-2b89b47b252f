import { identifyNotificationRecipient } from '../../src/logic/it-1-br-1-2-1';

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("高緊急度の申請案件で承認者が在席中の場合は本人に緊急連絡で通知される", () => {
    // SCEN-465
    const result = identifyNotificationRecipient(
      "APP-2023-001",
      "subsidy",
      "department_head",
      "USR-001",
      true
    );

    expect(result).toEqual({
      recipientId: "USR-001",
      recipientType: "primary_approver",
      notificationMethod: "urgent_contact",
      escalationRequired: false
    });
  });

  test("高緊急度の申請案件で承認者が不在の場合は代理承認者に緊急連絡で通知される", () => {
    // SCEN-465
    const result = identifyNotificationRecipient(
      "APP-2023-002",
      "subsidy",
      "section_chief",
      "USR-002",
      false
    );

    expect(result.recipientType).toBe("substitute_approver");
    expect(result.notificationMethod).toBe("urgent_contact");
    expect(result.escalationRequired).toBe(false);
  });

  test("一般申請で承認者が在席中の場合は通常のメール通知が送信される", () => {
    // SCEN-465
    const result = identifyNotificationRecipient(
      "APP-2023-003",
      "general",
      "section_chief", 
      "USR-003",
      true
    );

    expect(result).toEqual({
      recipientId: "USR-003",
      recipientType: "primary_approver",
      notificationMethod: "email",
      escalationRequired: false
    });
  });

  test("承認者も代理者も特定できない場合はエラーが発生する", () => {
    // SCEN-465
    expect(() => {
      identifyNotificationRecipient(
        "",
        "general",
        "section_chief",
        "",
        false
      );
    }).toThrow("催促通知の送信先を特定できません。システム管理者にお問い合わせください。");
  });

  test("申請案件の識別番号が無効な場合はエラーが発生する", () => {
    // SCEN-465
    expect(() => {
      identifyNotificationRecipient(
        "",
        "subsidy",
        "department_head",
        "USR-001",
        true
      );
    }).toThrow("催促対象の申請案件が特定できません。正しい申請番号を確認してください。");
  });

  test("承認段階の情報が取得できない場合はエラーが発生する", () => {
    // SCEN-465
    expect(() => {
      identifyNotificationRecipient(
        "APP-2023-001",
        "subsidy",
        "",
        "USR-001",
        true
      );
    }).toThrow("承認フローの現在段階を特定できません。申請状況を確認してください。");
  });
});