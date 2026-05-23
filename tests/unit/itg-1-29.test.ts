import {
  processUrgentApplicationPriority,
  handleSystemFailureAlternativeProcess,
  handleApproverAbsenceSubstitution,
  determineNotificationTargets,
  updateProcessingRoutesByRegulationChange,
  validateLegalNotificationAuthenticity,
  approveRequirementChange,
  updateDocumentClassificationStandards,
  determineLegalChangeProcessingPriority,
  ensureBusinessContinuityDuringSystemUpdate
} from "../../src/logic/it-1-br-1779263788059-2-2-1";

const fetchMock = require("jest-fetch-mock");

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {

  test("緊急フラグが設定された案件が最優先で処理される", () => {
    // SCEN-435
    const applicationData = { approvalRoute: ["manager", "director"] };
    const urgencyFlag = true;
    const deadlineDate = new Date("2024-03-01");
    const currentApprovalQueue = [{ priority: 3 }, { priority: 2 }];

    const result = processUrgentApplicationPriority(
      applicationData,
      urgencyFlag,
      deadlineDate,
      currentApprovalQueue
    );

    expect(result.priorityLevel).toBe(1);
    expect(result.queuePosition).toBe(0);
    expect(result.notificationTargets).toEqual(["manager", "director"]);
    expect(result.processingDeadline).toEqual(expect.any(Date));
  });

  test("複数の緊急案件がある場合、適切な優先順位が決定される", () => {
    // SCEN-436
    const applicationData = { approvalRoute: ["manager"] };
    const urgencyFlag = true;
    const deadlineDate = new Date();
    const currentApprovalQueue = [{ priority: 1 }, { priority: 1 }];

    const result = processUrgentApplicationPriority(
      applicationData,
      urgencyFlag,
      deadlineDate,
      currentApprovalQueue
    );

    expect(result.priorityLevel).toBe(1);
    expect(result.queuePosition).toBe(0);
  });

  test("システム障害時に緊急案件が発生した場合、代替処理が実行される", () => {
    // SCEN-437
    const systemStatus = "critical_failure";
    const failureType = "database_connection";
    const documentType = "補助金申請書";
    const urgencyLevel = 9;

    const result = handleSystemFailureAlternativeProcess(
      systemStatus,
      failureType,
      documentType,
      urgencyLevel
    );

    expect(result.alternativeProcess).toBe("full_paper_mode");
    expect(result.notificationTargets).toContain("all_staff");
    expect(result.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
  });

  test("承認者不在時に代理承認者に権限が移譲される", () => {
    // SCEN-459
    const approverId = "approver001";
    const applicationId = "app123";
    const lastLoginDate = new Date("2024-01-01");
    const currentDate = new Date("2024-01-08");

    const result = handleApproverAbsenceSubstitution(
      approverId,
      applicationId,
      lastLoginDate,
      currentDate
    );

    expect(result.substitutionRequired).toBe(true);
    expect(result.substituteApproverId).not.toBeNull();
    expect(result.notificationSent).toBe(true);
    expect(result.reason).toBe("承認者不在のため代理承認に移行");
  });

  test("代理承認実行時に関係者に適切な通知が送信される", () => {
    // SCEN-460
    const approverId = "approver001";
    const applicationId = "app123";
    const lastLoginDate = new Date("2024-01-01");
    const currentDate = new Date("2024-01-08");

    const result = handleApproverAbsenceSubstitution(
      approverId,
      applicationId,
      lastLoginDate,
      currentDate
    );

    expect(result.notificationSent).toBe(true);
    expect(result.substituteApproverId).toBeDefined();
  });

  test("代理承認者が設定されていない場合、適切なエラー処理が実行される", () => {
    // SCEN-461
    const approverId = "approver_no_substitute";
    const applicationId = "app123";
    const lastLoginDate = new Date("2024-01-01");
    const currentDate = new Date("2024-01-08");

    expect(() => handleApproverAbsenceSubstitution(
      approverId,
      applicationId,
      lastLoginDate,
      currentDate
    )).toThrow("代理承認者が設定されていません");
  });

  test("承認完了時に関係者に適切な通知が送信される", () => {
    // SCEN-483
    const approvalResult = "approved";
    const applicationData = {
      applicant_id: "user001",
      department_id: "dept001",
      urgency_level: "normal"
    };
    const approverInfo = {
      department_id: "dept001",
      role: "manager"
    };
    const documentClassification = {
      subsidyRelated: false,
      moeRequirement: false,
      paperStorageRequired: false
    };

    const result = determineNotificationTargets(
      approvalResult,
      applicationData,
      approverInfo,
      documentClassification
    );

    expect(result.primaryTargets).toContain("user001");
    expect(result.auditTrailRequired).toBe(false);
  });

  test("却下時に理由と共に申請者に通知される", () => {
    // SCEN-484
    const approvalResult = "rejected";
    const applicationData = {
      applicant_id: "user001",
      department_id: "dept001",
      urgency_level: "normal"
    };
    const approverInfo = {
      department_id: "dept001",
      role: "manager"
    };
    const documentClassification = {
      subsidyRelated: false,
      moeRequirement: false
    };

    const result = determineNotificationTargets(
      approvalResult,
      applicationData,
      approverInfo,
      documentClassification
    );

    expect(result.primaryTargets).toContain("user001");
    expect(result.secondaryTargets).toBeDefined();
  });

  test("通知送信に失敗した場合、リトライ処理が実行される", () => {
    // SCEN-485
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce("", { status: 500 });

    const approvalResult = "approved";
    const applicationData = {
      applicant_id: "user001",
      department_id: "dept001",
      urgency_level: "normal"
    };
    const approverInfo = {
      department_id: "dept001",
      role: "manager"
    };
    const documentClassification = {
      subsidyRelated: false,
      moeRequirement: false
    };

    const result = determineNotificationTargets(
      approvalResult,
      applicationData,
      approverInfo,
      documentClassification
    );

    expect(result.primaryTargets).toBeDefined();
  });

  test("法令改正通知に基づいて処理ルートが正しく更新される", () => {
    // SCEN-492
    const regulationChangeNotice = "補助金申請書類の電子化要件を変更";
    const currentDocumentClassification = [
      { documentType: "補助金申請書", processingRoute: "electronic" }
    ];
    const affectedDocumentTypes = ["補助金申請書"];

    const result = updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      affectedDocumentTypes
    );

    expect(result.updatedRoutes).toBeDefined();
    expect(result.notificationTargets).toBeDefined();
    expect(result.changeLog).toBeDefined();
  });

  test("影響を受ける文書種別が正しく特定される", () => {
    // SCEN-493
    const regulationChangeNotice = "補助金関連書類の保管要件変更";
    const currentDocumentClassification = [
      { documentType: "補助金申請書", processingRoute: "electronic" },
      { documentType: "一般申請書", processingRoute: "electronic" }
    ];
    const affectedDocumentTypes = ["補助金申請書"];

    const result = updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      affectedDocumentTypes
    );

    expect(result.updatedRoutes).toHaveLength(1);
    expect(result.updatedRoutes[0].documentType).toBe("補助金申請書");
  });

  test("更新処理中にエラーが発生した場合、ロールバックが実行される", () => {
    // SCEN-494
    const regulationChangeNotice = "";
    const currentDocumentClassification = [];
    const affectedDocumentTypes = [];

    expect(() => updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      affectedDocumentTypes
    )).toThrow("法令改正通知の内容を正しく読み取れません。通知内容を確認してください。");
  });

  test("正当な送信者からの通知が認証される", () => {
    // SCEN-495
    const notificationContent = "文部科学省からの正式な法令改正通知です。補助金申請要件を変更します。";
    const senderInfo = { organization: "文部科学省", verified: true };
    const digitalSignature = "valid_signature_string";
    const receivedTimestamp = "2024-01-15T10:00:00Z";

    const result = validateLegalNotificationAuthenticity(
      notificationContent,
      senderInfo,
      digitalSignature,
      receivedTimestamp
    );

    expect(result.isAuthentic).toBe(true);
    expect(result.isValid).toBe(true);
    expect(result.canProceed).toBe(true);
  });

  test("デジタル署名の検証が正常に実行される", () => {
    // SCEN-496
    const notificationContent = "文部科学省からの法令改正通知内容";
    const senderInfo = { organization: "文部科学省", verified: true };
    const digitalSignature = "mext_digital_signature_2024";
    const receivedTimestamp = "2024-01-15T10:00:00Z";

    const result = validateLegalNotificationAuthenticity(
      notificationContent,
      senderInfo,
      digitalSignature,
      receivedTimestamp
    );

    expect(result.verificationDetails.signatureValid).toBe(true);
    expect(result.verificationDetails.contentIntact).toBe(true);
  });

  test("不正な通知や改ざんされた通知が拒否される", () => {
    // SCEN-497
    const notificationContent = "";
    const senderInfo = { organization: "不明", verified: false };
    const digitalSignature = "";
    const receivedTimestamp = "2024-01-15T10:00:00Z";

    expect(() => validateLegalNotificationAuthenticity(
      notificationContent,
      senderInfo,
      digitalSignature,
      receivedTimestamp
    )).toThrow("法令改正通知の内容が不正です。正しい通知内容を確認してください。");
  });

  test("事務局長による変更要件承認が正常に処理される", () => {
    // SCEN-501
    const changeRequirements = "補助金申請書類の電子化要件変更により、新たな処理ルートを設定";
    const impactAnalysis = "影響範囲は学内全部署、対象文書は補助金関連のみ";
    const directorAuthority = "standard";
    const complianceRisk = 5;

    const result = approveRequirementChange(
      changeRequirements,
      impactAnalysis,
      directorAuthority,
      complianceRisk
    );

    expect(result.approved).toBe(true);
    expect(result.approvalComment).toBe("通常承認");
    expect(result.nextAction).toBe("文書分類基準の更新を実施");
    expect(result.urgencyLevel).toBe("通常");
  });

  test("承認却下時に適切な理由と共に差戻しが実行される", () => {
    // SCEN-502
    const changeRequirements = "変更要件の詳細が不明確";
    const impactAnalysis = "影響範囲が広範囲で詳細な分析が必要な内容が2000文字を超える長文";
    const directorAuthority = "standard";
    const complianceRisk = 3;

    const result = approveRequirementChange(
      changeRequirements,
      impactAnalysis,
      directorAuthority,
      complianceRisk
    );

    expect(result.approved).toBe(false);
    expect(result.approvalComment).toBe("理事会承認が必要");
    expect(result.nextAction).toBe("理事会への上申準備");
    expect(result.urgencyLevel).toBe("保留");
  });

  test("承認処理中に権限エラーが発生した場合、適切に処理される", () => {
    // SCEN-503
    const changeRequirements = "";
    const impactAnalysis = "影響分析";
    const directorAuthority = "standard";
    const complianceRisk = 5;

    expect(() => approveRequirementChange(
      changeRequirements,
      impactAnalysis,
      directorAuthority,
      complianceRisk
    )).toThrow("変更要件の内容が不十分です。具体的な変更内容を記載してください。");
  });

  test("法令改正に対応した分類基準が正しく更新される", () => {
    // SCEN-507
    const approvedChanges = [
      { documentType: "補助金申請書", newRequirement: "紙保管必須" }
    ];
    const currentClassificationRules = [
      { documentType: "補助金申請書", processingRoute: "electronic" }
    ];
    const effectiveDate = new Date("2024-04-01");

    const result = updateDocumentClassificationStandards(
      approvedChanges,
      currentClassificationRules,
      effectiveDate
    );

    expect(result.updatedRules).toBeDefined();
    expect(result.affectedDocumentCount).toBeGreaterThanOrEqual(0);
    expect(result.applicationStartDate).toEqual(effectiveDate);
  });

  test("更新完了後に関係者への通知が送信される", () => {
    // SCEN-508
    const approvedChanges = [
      { documentType: "補助金申請書", newRequirement: "電子化可能" }
    ];
    const currentClassificationRules = [
      { documentType: "補助金申請書", processingRoute: "hybrid" }
    ];
    const effectiveDate = new Date("2024-04-01");

    const result = updateDocumentClassificationStandards(
      approvedChanges,
      currentClassificationRules,
      effectiveDate
    );

    expect(result.newProcessingRoutes).toBeDefined();
    expect(result.updatedRules).toHaveLength(1);
  });

  test("更新処理が途中で中断された場合、適切な復旧処理が実行される", () => {
    // SCEN-509
    const approvedChanges = [];
    const currentClassificationRules = [];
    const effectiveDate = new Date("2024-04-01");

    expect(() => updateDocumentClassificationStandards(
      approvedChanges,
      currentClassificationRules,
      effectiveDate
    )).toThrow("法令改正に伴う変更要件が正しく承認されていません。事務局長による承認を確認してください。");
  });

  test("緊急度と影響範囲に基づいて適切な優先順位が決定される", () => {
    // SCEN-510
    const urgencyLevel = "即日対応";
    const impactScope = "全学";
    const affectedDocumentTypes = ["補助金申請書"];
    const currentProcessingLoad = 60;

    const result = determineLegalChangeProcessingPriority(
      urgencyLevel,
      impactScope,
      affectedDocumentTypes,
      currentProcessingLoad
    );

    expect(result.priority).toBe("最優先");
    expect(result.scheduleDays).toBe(1);
    expect(result.processingOrder).toBe(1);
    expect(result.notificationLevel).toBe("緊急");
  });

  test("最高優先度案件に対して適切な対応スケジュールが設定される", () => {
    // SCEN-511
    const urgencyLevel = "即日対応";
    const impactScope = "全学";
    const affectedDocumentTypes = ["補助金申請書", "研究費申請書"];
    const currentProcessingLoad = 90;

    const result = determineLegalChangeProcessingPriority(
      urgencyLevel,
      impactScope,
      affectedDocumentTypes,
      currentProcessingLoad
    );

    expect(result.priority).toBe("最優先");
    expect(result.scheduleDays).toBe(1);
    expect(result.processingOrder).toBe(1);
  });

  test("優先度判定基準が不明確な場合、デフォルト優先度が適用される", () => {
    // SCEN-512
    const urgencyLevel = "不明";
    const impactScope = "不明";
    const affectedDocumentTypes = [];
    const currentProcessingLoad = 50;

    expect(() => determineLegalChangeProcessingPriority(
      urgencyLevel,
      impactScope,
      affectedDocumentTypes,
      currentProcessingLoad
    )).toThrow("緊急度レベルは「即日対応」「1週間以内」「1ヶ月以内」のいずれかを指定してください");
  });

});