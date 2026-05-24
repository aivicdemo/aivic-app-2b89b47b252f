import { determineNotificationTargets } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("承認結果通知 - 承認完了時に関係者に適切な通知が送信される", () => {
    // SCEN-483
    
    // 承認案件（補助金関連、緊急度高）
    const approvalResult = "approved";
    const applicationData = {
      applicant_id: "staff001",
      department_id: "research_dept",
      urgency_level: "high"
    };
    const approverInfo = {
      department: "admin_office",
      position: "section_chief",
      authority_level: "standard"
    };
    const documentClassification = {
      subsidyRelated: true,
      moeRequirement: true,
      paperStorageRequired: true
    };

    const result = determineNotificationTargets(approvalResult, applicationData, approverInfo, documentClassification);

    expect(result.primaryTargets).toEqual(["staff001", "supervisor_of_staff001"]);
    expect(result.secondaryTargets).toEqual(["finance_dept", "audit_dept", "research_dept_manager"]);
    expect(result.notificationMethod).toBe("hybrid");
    expect(result.auditTrailRequired).toBe(true);

    // 却下案件（一般申請、緊急度中）
    const rejectionResult = "rejected";
    const generalApplicationData = {
      applicant_id: "staff002",
      department_id: "general_affairs",
      urgency_level: "medium"
    };
    const generalDocumentClassification = {
      subsidyRelated: false,
      moeRequirement: false,
      paperStorageRequired: false
    };

    const rejectionNotification = determineNotificationTargets(rejectionResult, generalApplicationData, approverInfo, generalDocumentClassification);

    expect(rejectionNotification.primaryTargets).toEqual(["staff002", "supervisor_of_staff002", "general_affairs_admin"]);
    expect(rejectionNotification.secondaryTargets).toEqual([]);
    expect(rejectionNotification.notificationMethod).toBe("electronic");
    expect(rejectionNotification.auditTrailRequired).toBe(false);

    // 差し戻し案件（補助金関連、緊急度低）
    const returnResult = "returned";
    const subsidyApplicationData = {
      applicant_id: "staff003",
      department_id: "finance_dept",
      urgency_level: "low"
    };

    const returnNotification = determineNotificationTargets(returnResult, subsidyApplicationData, approverInfo, documentClassification);

    expect(returnNotification.primaryTargets).toEqual(["staff003", "supervisor_of_staff003", "finance_dept_admin"]);
    expect(returnNotification.secondaryTargets).toEqual(["finance_dept", "audit_dept"]);
    expect(returnNotification.notificationMethod).toBe("hybrid");
    expect(returnNotification.auditTrailRequired).toBe(true);
  });
});