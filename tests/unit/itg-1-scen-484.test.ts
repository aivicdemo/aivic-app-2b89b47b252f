import { determineNotificationTargets } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("SCEN-484: 承認結果通知 - 却下時に理由と共に申請者に通知される", () => {
    // 却下時の基本的な通知対象者決定テスト
    const approvalResult = "却下";
    const applicationData = {
      applicant_id: "user123",
      applicant_name: "山田太郎",
      department_id: "dept001",
      urgency_level: "通常"
    };
    const approverInfo = {
      id: "approver456",
      department: "総務課",
      role: "課長",
      authority_level: "部長級"
    };
    const documentClassification = {
      subsidyRelated: false,
      paperStorageRequired: false,
      moeRequirement: false
    };

    const result = determineNotificationTargets(
      approvalResult,
      applicationData,
      approverInfo,
      documentClassification
    );

    // 却下の場合は申請者、直属上司、事務担当者に通知
    expect(result.primaryTargets).toEqual(["user123", "supervisor_user123", "admin_support_dept001"]);
    expect(result.secondaryTargets).toEqual([]);
    expect(result.notificationMethod).toBe("electronic");
    expect(result.auditTrailRequired).toBe(false);

    // 補助金関連書類での却下テスト
    const subsidyDocumentClassification = {
      subsidyRelated: true,
      paperStorageRequired: true,
      moeRequirement: true
    };

    const subsidyResult = determineNotificationTargets(
      "却下",
      applicationData,
      approverInfo,
      subsidyDocumentClassification
    );

    // 補助金関連の場合は財務課と監査部署も通知対象に追加
    expect(subsidyResult.primaryTargets).toEqual(["user123", "supervisor_user123", "admin_support_dept001"]);
    expect(subsidyResult.secondaryTargets).toEqual(["finance_dept", "audit_dept"]);
    expect(subsidyResult.notificationMethod).toBe("hybrid");
    expect(subsidyResult.auditTrailRequired).toBe(true);

    // 緊急度が高い場合の却下テスト
    const urgentApplicationData = {
      ...applicationData,
      urgency_level: "high"
    };

    const urgentResult = determineNotificationTargets(
      "却下",
      urgentApplicationData,
      approverInfo,
      documentClassification
    );

    // 緊急度が高い場合は部署の管理者も追加通知
    expect(urgentResult.primaryTargets).toEqual(["user123", "supervisor_user123", "admin_support_dept001"]);
    expect(urgentResult.secondaryTargets).toEqual(["manager_dept001"]);

    // 承認の場合との比較テスト
    const approvedResult = determineNotificationTargets(
      "approved",
      applicationData,
      approverInfo,
      documentClassification
    );

    // 承認の場合は申請者と直属上司のみ
    expect(approvedResult.primaryTargets).toEqual(["user123", "supervisor_user123"]);
    expect(approvedResult.secondaryTargets).toEqual([]);

    // 申請者情報が不正な場合のエラーテスト
    expect(() => {
      determineNotificationTargets(
        "却下",
        { ...applicationData, applicant_id: "" },
        approverInfo,
        documentClassification
      );
    }).toThrow("申請者の情報が見つからないため、処理結果を通知できません。システム管理者にお問い合わせください。");

    // 承認判断結果が不正な場合のエラーテスト
    expect(() => {
      determineNotificationTargets(
        "無効な結果",
        applicationData,
        approverInfo,
        documentClassification
      );
    }).toThrow("承認判断の結果が正しく設定されていません。再度承認処理を行ってください。");
  });
});