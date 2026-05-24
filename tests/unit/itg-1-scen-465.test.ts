import { identifyNotificationRecipient } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("高緊急度案件（補助金関連・緊急連絡）の通知優先度判定", () => {
    // SCEN-465

    // 補助金関連書類で承認者が対応可能な場合
    const result1 = identifyNotificationRecipient(
      "APPL-2024-001",
      "補助金申請",
      "部長承認",
      "MGR-001",
      true
    );

    expect(result1.recipientId).toBe("MGR-001");
    expect(result1.recipientType).toBe("primary_approver");
    expect(result1.notificationMethod).toBe("urgent_contact");
    expect(result1.escalationRequired).toBe(false);

    // 一般書類で承認者が不在の場合
    const result2 = identifyNotificationRecipient(
      "APPL-2024-002",
      "一般事務",
      "課長承認",
      "MGR-002",
      false
    );

    expect(result2.recipientId).not.toBe("MGR-002");
    expect(result2.recipientType).toBe("substitute_approver");
    expect(result2.notificationMethod).toBe("email");
    expect(result2.escalationRequired).toBe(false);

    // 補助金関連書類で代理者も見つからない場合
    const result3 = identifyNotificationRecipient(
      "APPL-2024-003",
      "科研費申請書",
      "理事承認",
      "DIR-001",
      false
    );

    expect(result3.recipientType).toBe("superior_approver");
    expect(result3.notificationMethod).toBe("urgent_contact");
    expect(result3.escalationRequired).toBe(true);

    // エラーケース：申請案件の識別番号が空
    expect(() => identifyNotificationRecipient(
      "",
      "補助金申請",
      "部長承認",
      "MGR-001",
      true
    )).toThrow("催促対象の申請案件が特定できません。正しい申請番号を確認してください。");

    // エラーケース：承認段階の情報が取得できない
    expect(() => identifyNotificationRecipient(
      "APPL-2024-004",
      "補助金申請",
      "",
      "MGR-001",
      true
    )).toThrow("承認フローの現在段階を特定できません。申請状況を確認してください。");
  });
});