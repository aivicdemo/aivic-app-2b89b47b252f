import { determineNotificationTargets } from "../../src/logic/it-1-br-1779263788059-2-2-1";

const fetchMock = require("jest-fetch-mock");

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test("承認完了時に申請者と関係者に適切な通知が送信される", () => {
    // SCEN-483
    
    // 承認結果が「承認」の場合
    const applicationData = {
      applicant_id: "applicant001",
      department_id: "dept001",
      urgency_level: "normal"
    };
    const approverInfo = {
      position: "department_head",
      department: "総務課",
      authority_level: "high"
    };
    const documentClassification = {
      subsidyRelated: false,
      moeRequirement: false,
      paperStorageRequired: false
    };

    const result = determineNotificationTargets(
      "approved",
      applicationData,
      approverInfo,
      documentClassification
    );

    expect(result.primaryTargets).toEqual(["applicant001", "supervisor001"]);
    expect(result.secondaryTargets).toEqual([]);
    expect(result.notificationMethod).toBe("electronic");
    expect(result.auditTrailRequired).toBe(false);

    // 却下または差し戻しの場合
    const rejectionResult = determineNotificationTargets(
      "rejected",
      applicationData,
      approverInfo,
      documentClassification
    );

    expect(rejectionResult.primaryTargets).toEqual(["applicant001", "supervisor001", "admin_support001"]);
    expect(rejectionResult.secondaryTargets).toEqual([]);
    expect(rejectionResult.notificationMethod).toBe("electronic");

    // 補助金関連書類の場合
    const subsidyApplicationData = {
      applicant_id: "applicant002",
      department_id: "dept002",
      urgency_level: "high"
    };
    const subsidyDocumentClassification = {
      subsidyRelated: true,
      moeRequirement: true,
      paperStorageRequired: true
    };

    const subsidyResult = determineNotificationTargets(
      "approved",
      subsidyApplicationData,
      approverInfo,
      subsidyDocumentClassification
    );

    expect(subsidyResult.primaryTargets).toEqual(["applicant002", "supervisor002"]);
    expect(subsidyResult.secondaryTargets).toEqual(["finance_dept", "audit_dept", "manager002"]);
    expect(subsidyResult.notificationMethod).toBe("hybrid");
    expect(subsidyResult.auditTrailRequired).toBe(true);

    // 申請者情報が取得できない場合
    const invalidApplicationData = {
      applicant_id: "",
      department_id: "dept001",
      urgency_level: "normal"
    };

    expect(() => {
      determineNotificationTargets(
        "approved",
        invalidApplicationData,
        approverInfo,
        documentClassification
      );
    }).toThrow("申請者の情報が見つからないため、処理結果を通知できません。システム管理者にお問い合わせください。");

    // 承認判断結果が不正な場合
    expect(() => {
      determineNotificationTargets(
        "invalid_status",
        applicationData,
        approverInfo,
        documentClassification
      );
    }).toThrow("承認判断の結果が正しく設定されていません。再度承認処理を行ってください。");
  });
});