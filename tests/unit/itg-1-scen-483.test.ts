import { determineNotificationTargets } from '../../src/logic/it-1-br-1779263788059-2-2-1';

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("承認結果通知 - 承認完了時に関係者に適切な通知が送信される", () => {
    // SCEN-483
    
    // 承認が完了したケース
    const approvedApplicationData = {
      applicant_id: "user123",
      department_id: "dept_finance",
      urgency_level: "high"
    };
    
    const approverInfo = {
      department: "finance_dept",
      role: "manager",
      authority_level: "department_head"
    };
    
    const approvedDocumentClassification = {
      subsidyRelated: false,
      moeRequirement: false,
      paperStorageRequired: false
    };
    
    const approvalResult = determineNotificationTargets(
      "approved",
      approvedApplicationData,
      approverInfo,
      approvedDocumentClassification
    );
    
    expect(approvalResult.primaryTargets).toEqual(["user123", "supervisor_of_user123"]);
    expect(approvalResult.secondaryTargets).toEqual(["dept_manager_dept_finance"]);
    expect(approvalResult.notificationMethod).toBe("electronic");
    expect(approvalResult.auditTrailRequired).toBe(false);
    
    // 却下・差し戻しケース
    const rejectedApplicationData = {
      applicant_id: "user456",
      department_id: "dept_research",
      urgency_level: "normal"
    };
    
    const rejectedDocumentClassification = {
      subsidyRelated: true,
      moeRequirement: true,
      paperStorageRequired: true
    };
    
    const rejectionResult = determineNotificationTargets(
      "rejected",
      rejectedApplicationData,
      approverInfo,
      rejectedDocumentClassification
    );
    
    expect(rejectionResult.primaryTargets).toEqual(["user456", "supervisor_of_user456", "admin_support_dept_research"]);
    expect(rejectionResult.secondaryTargets).toEqual(["finance_dept", "audit_dept"]);
    expect(rejectionResult.notificationMethod).toBe("hybrid");
    expect(rejectionResult.auditTrailRequired).toBe(true);
    
    // 補助金関連で緊急度が高いケース
    const urgentSubsidyApplicationData = {
      applicant_id: "user789",
      department_id: "dept_academic",
      urgency_level: "high"
    };
    
    const subsidyDocumentClassification = {
      subsidyRelated: true,
      moeRequirement: true,
      paperStorageRequired: true
    };
    
    const urgentResult = determineNotificationTargets(
      "approved",
      urgentSubsidyApplicationData,
      approverInfo,
      subsidyDocumentClassification
    );
    
    expect(urgentResult.primaryTargets).toEqual(["user789", "supervisor_of_user789"]);
    expect(urgentResult.secondaryTargets).toEqual(["finance_dept", "audit_dept", "dept_manager_dept_academic"]);
    expect(urgentResult.notificationMethod).toBe("hybrid");
    expect(urgentResult.auditTrailRequired).toBe(true);
  });
});