import { 
  determineApprovalDecision,
  determineNotificationTargets,
  generateReminderMessage
} from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("承認結果通知 - 却下時に理由と共に申請者に通知される", () => {
    // SCEN-484
    
    // 却下判定のテスト
    const rejectionResult = determineApprovalDecision(
      "重要な項目が不足しています", 
      ["必要書類未添付", "金額記載不備", "期限設定誤り"],
      true,
      1
    );
    expect(rejectionResult.decision).toBe("reject");
    expect(rejectionResult.reason).toBe("補助金関連書類で重要な不備があるため");
    expect(rejectionResult.nextAction).toBe("resubmit");
    
    // 通知対象者決定のテスト - 却下時は申請者、上司、事務担当者が対象
    const notificationTargets = determineNotificationTargets(
      "reject",
      {
        applicant_id: "user001",
        applicant_name: "申請者A",
        department_id: "dept001",
        urgency_level: "medium"
      },
      {
        department_id: "dept001",
        role: "supervisor"
      },
      {
        subsidyRelated: true,
        paperStorageRequired: true,
        moeRequirement: true
      }
    );
    expect(notificationTargets.primaryTargets).toEqual([
      "user001",
      expect.any(String),
      expect.any(String)
    ]);
    expect(notificationTargets.secondaryTargets).toEqual([
      "finance_dept",
      "audit_dept"
    ]);
    expect(notificationTargets.auditTrailRequired).toBe(true);
    
    // 却下理由付き通知メッセージ生成のテスト
    const reminderMessage = generateReminderMessage(
      "app001",
      5,
      "補助金申請書",
      "承認者B",
      "申請者A"
    );
    expect(reminderMessage.urgencyLevel).toBe("medium");
    expect(reminderMessage.notificationMethod).toBe("both");
    
    // 補助金関連での緊急度上昇確認
    const subsidyRejectionMessage = generateReminderMessage(
      "app002", 
      3,
      "科研費申請書",
      "承認者C",
      "申請者B"
    );
    expect(subsidyRejectionMessage.urgencyLevel).toBe("medium");
    
    // 重大不備による却下判定
    const severeMismatch = determineApprovalDecision(
      "法令要件に著しく不適合",
      ["法定書類欠如", "資格要件不足", "期限超過"],
      true,
      2
    );
    expect(severeMismatch.decision).toBe("reject");
    expect(severeMismatch.reason).toBe("補助金関連書類で重要な不備があるため");
    expect(severeMismatch.conditionalRequirements).toEqual([]);
    
    // 通常案件での却下通知
    const normalRejection = determineNotificationTargets(
      "reject",
      {
        applicant_id: "user003", 
        department_id: "dept002",
        urgency_level: "low"
      },
      {
        department_id: "dept002",
        role: "manager"
      },
      {
        subsidyRelated: false,
        paperStorageRequired: false,
        moeRequirement: false
      }
    );
    expect(normalRejection.auditTrailRequired).toBe(false);
    expect(normalRejection.notificationMethod).toBe("electronic");
  });
});