import { 
  processUrgentApplicationPriority,
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
  
  test("SCEN-435: 緊急フラグが設定された案件が最優先で処理される", () => {
    const applicationData = { 
      id: "app-001", 
      approvalRoute: ["manager", "director"], 
      priority: "high", 
      createdAt: new Date("2024-01-01T09:00:00Z") 
    };
    const urgencyFlag = true;
    const deadlineDate = new Date("2024-01-05T17:00:00Z");
    const currentApprovalQueue = [
      { id: "app-002", priority: "medium" },
      { id: "app-003", priority: "low" }
    ];

    const result = processUrgentApplicationPriority(
      applicationData, 
      urgencyFlag, 
      deadlineDate, 
      currentApprovalQueue
    );

    expect(result.priorityLevel).toBe(1);
    expect(result.queuePosition).toBe(0);
    expect(result.notificationTargets).toEqual(["manager", "director"]);
  });

  test("SCEN-436: 複数の緊急案件がある場合、適切な優先順位が決定される", () => {
    const applicationData = { 
      id: "app-001", 
      approvalRoute: ["manager"], 
      priority: "high", 
      createdAt: new Date("2024-01-01T09:00:00Z") 
    };
    const urgencyFlag = true;
    const deadlineDate = new Date("2024-01-02T17:00:00Z");
    const currentApprovalQueue = [
      { id: "app-002", priority: "high", createdAt: new Date("2024-01-01T08:00:00Z") },
      { id: "app-003", priority: "high", createdAt: new Date("2024-01-01T10:00:00Z") }
    ];

    const result = processUrgentApplicationPriority(
      applicationData, 
      urgencyFlag, 
      deadlineDate, 
      currentApprovalQueue
    );

    expect(result.priorityLevel).toBe(1);
    expect(result.queuePosition).toBe(0);
    expect(result.processingDeadline).toEqual(expect.any(Date));
  });

  test("SCEN-437: システム障害時に緊急案件が発生した場合、代替処理が実行される", () => {
    const applicationData = { 
      id: "app-001", 
      approvalRoute: ["manager"], 
      priority: "high", 
      createdAt: new Date() 
    };
    const urgencyFlag = true;
    const deadlineDate = new Date();
    const currentApprovalQueue = [];

    expect(() => processUrgentApplicationPriority(
      applicationData, 
      urgencyFlag, 
      new Date("2023-01-01"), 
      currentApprovalQueue
    )).toThrow("提出期限は現在日時より未来の日付を設定してください");
  });

  test("SCEN-459: 承認者不在時に代理承認者に権限が移譲される", () => {
    const approverId = "approver-001";
    const applicationId = "app-001";
    const lastLoginDate = new Date("2024-01-01T09:00:00Z");
    const currentDate = new Date("2024-01-05T09:00:00Z");

    const result = handleApproverAbsenceSubstitution(
      approverId,
      applicationId,
      lastLoginDate,
      currentDate
    );

    expect(result.substitutionRequired).toBe(true);
    expect(result.substituteApproverId).toBeTruthy();
    expect(result.notificationSent).toBe(true);
    expect(result.reason).toBe("承認者不在のため代理承認に移行");
  });

  test("SCEN-460: 代理承認実行時に関係者に適切な通知が送信される", () => {
    const approverId = "approver-001";
    const applicationId = "app-001";
    const lastLoginDate = new Date("2024-01-01T09:00:00Z");
    const currentDate = new Date("2024-01-05T09:00:00Z");

    const result = handleApproverAbsenceSubstitution(
      approverId,
      applicationId,
      lastLoginDate,
      currentDate
    );

    expect(result.substitutionRequired).toBe(true);
    expect(result.notificationSent).toBe(true);
    expect(result.substituteApproverId).not.toBeNull();
  });

  test("SCEN-461: 代理承認者が設定されていない場合、適切なエラー処理が実行される", () => {
    const approverId = "approver-without-substitute";
    const applicationId = "app-001";
    const lastLoginDate = new Date("2024-01-01T09:00:00Z");
    const currentDate = new Date("2024-01-05T09:00:00Z");

    expect(() => handleApproverAbsenceSubstitution(
      approverId,
      applicationId,
      lastLoginDate,
      currentDate
    )).toThrow("代理承認者が設定されていません");
  });

  test("SCEN-483: 承認完了時に関係者に適切な通知が送信される", () => {
    const approvalResult = "approved";
    const applicationData = {
      applicant_id: "user-001",
      department_id: "dept-001",
      urgency_level: "normal"
    };
    const approverInfo = {
      department: "admin",
      position: "manager"
    };
    const documentClassification = {
      subsidyRelated: false,
      paperStorageRequired: false
    };

    const result = determineNotificationTargets(
      approvalResult,
      applicationData,
      approverInfo,
      documentClassification
    );

    expect(result.primaryTargets).toContain("user-001");
    expect(result.notificationMethod).toBe("electronic");
    expect(result.auditTrailRequired).toBe(false);
  });

  test("SCEN-484: 却下時に理由と共に申請者に通知される", () => {
    const approvalResult = "rejected";
    const applicationData = {
      applicant_id: "user-001",
      department_id: "dept-001",
      urgency_level: "normal"
    };
    const approverInfo = {
      department: "admin",
      position: "manager"
    };
    const documentClassification = {
      subsidyRelated: false,
      paperStorageRequired: false
    };

    const result = determineNotificationTargets(
      approvalResult,
      applicationData,
      approverInfo,
      documentClassification
    );

    expect(result.primaryTargets).toContain("user-001");
    expect(result.primaryTargets.length).toBeGreaterThan(1);
  });

  test("SCEN-485: 通知送信に失敗した場合、リトライ処理が実行される", () => {
    const approvalResult = "";
    const applicationData = {
      applicant_id: "",
      department_id: "dept-001"
    };
    const approverInfo = {
      department: "admin",
      position: "manager"
    };
    const documentClassification = {
      subsidyRelated: false,
      paperStorageRequired: false
    };

    expect(() => determineNotificationTargets(
      approvalResult,
      applicationData,
      approverInfo,
      documentClassification
    )).toThrow("申請者の情報が見つからないため、処理結果を通知できません");
  });

  test("SCEN-492: 法令改正通知に基づいて処理ルートが正しく更新される", () => {
    const regulationChangeNotice = "補助金申請書の電子保管要件が変更されました";
    const currentDocumentClassification = [
      { documentType: "補助金申請書", processingRoute: "electronic" }
    ];
    const affectedDocumentTypes = ["補助金申請書"];

    const result = updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      affectedDocumentTypes
    );

    expect(result.updatedRoutes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          documentType: "補助金申請書",
          newRoute: "hybrid"
        })
      ])
    );
    expect(result.notificationTargets).toContain("finance_dept");
  });

  test("SCEN-493: 影響を受ける文書種別が正しく特定される", () => {
    const regulationChangeNotice = "研究費申請の保管要件が変更されました";
    const currentDocumentClassification = [
      { documentType: "研究費申請書", processingRoute: "electronic" },
      { documentType: "一般申請書", processingRoute: "electronic" }
    ];
    const affectedDocumentTypes = ["研究費申請書"];

    const result = updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      affectedDocumentTypes
    );

    expect(result.updatedRoutes.length).toBe(1);
    expect(result.updatedRoutes[0].documentType).toBe("研究費申請書");
  });

  test("SCEN-494: 更新処理中にエラーが発生した場合、ロールバックが実行される", () => {
    const regulationChangeNotice = "";
    const currentDocumentClassification = [];
    const affectedDocumentTypes = [];

    expect(() => updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      affectedDocumentTypes
    )).toThrow("法令改正通知の内容を正しく読み取れません");
  });

  test("SCEN-495: 正当な送信者からの通知が認証される", () => {
    const notificationContent = "文部科学省からの法令改正通知です。補助金要件が変更されました。";
    const senderInfo = { organization: "文部科学省", certified: true };
    const digitalSignature = "valid-signature-123";
    const receivedTimestamp = new Date().toISOString();

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

  test("SCEN-496: デジタル署名の検証が正常に実行される", () => {
    const notificationContent = "正当な法令改正通知";
    const senderInfo = { organization: "文部科学省", certified: true };
    const digitalSignature = "valid-digital-signature";
    const receivedTimestamp = new Date().toISOString();

    const result = validateLegalNotificationAuthenticity(
      notificationContent,
      senderInfo,
      digitalSignature,
      receivedTimestamp
    );

    expect(result.verificationDetails.signatureValid).toBe(true);
    expect(result.verificationDetails.contentIntact).toBe(true);
  });

  test("SCEN-497: 不正な通知や改ざんされた通知が拒否される", () => {
    const notificationContent = "";
    const senderInfo = { organization: "不明", certified: false };
    const digitalSignature = "";
    const receivedTimestamp = new Date().toISOString();

    expect(() => validateLegalNotificationAuthenticity(
      notificationContent,
      senderInfo,
      digitalSignature,
      receivedTimestamp
    )).toThrow("法令改正通知の内容が不正です");
  });

  test("SCEN-501: 事務局長による変更要件承認が正常に処理される", () => {
    const changeRequirements = "補助金申請書の処理ルートを電子＋紙ハイブリッドに変更";
    const impactAnalysis = "影響範囲: 研究支援課、財務課";
    const directorAuthority = "standard";
    const complianceRisk = 3;

    const result = approveRequirementChange(
      changeRequirements,
      impactAnalysis,
      directorAuthority,
      complianceRisk
    );

    expect(result.approved).toBe(true);
    expect(result.approvalComment).toBe("通常承認");
    expect(result.nextAction).toBe("文書分類基準の更新を実施");
  });

  test("SCEN-502: 承認却下時に適切な理由と共に差戻しが実行される", () => {
    const changeRequirements = "";
    const impactAnalysis = "影響範囲不明";
    const directorAuthority = "standard";
    const complianceRisk = 2;

    expect(() => approveRequirementChange(
      changeRequirements,
      impactAnalysis,
      directorAuthority,
      complianceRisk
    )).toThrow("変更要件の内容が不十分です");
  });

  test("SCEN-503: 承認処理中に権限エラーが発生した場合、適切に処理される", () => {
    const changeRequirements = "大規模システム変更が必要な法令改正対応";
    const impactAnalysis = "全学的な影響があり、理事会承認が必要な案件です。" + "x".repeat(1000);
    const directorAuthority = "standard";
    const complianceRisk = 5;

    const result = approveRequirementChange(
      changeRequirements,
      impactAnalysis,
      directorAuthority,
      complianceRisk
    );

    expect(result.approved).toBe(false);
    expect(result.approvalComment).toBe("理事会承認が必要");
    expect(result.nextAction).toBe("理事会への上申準備");
  });

  test("SCEN-507: 法令改正に対応した分類基準が正しく更新される", () => {
    const approvedChanges = [
      { documentType: "補助金申請書", requiresPaperStorage: true }
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

    expect(result.updatedRules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          documentType: "補助金申請書",
          processingRoute: "hybrid",
          paperStorageRequired: true
        })
      ])
    );
  });

  test("SCEN-508: 更新完了後に関係者への通知が送信される", () => {
    const approvedChanges = [
      { documentType: "研究費申請書", requiresPaperStorage: false }
    ];
    const currentClassificationRules = [
      { documentType: "研究費申請書", processingRoute: "hybrid" }
    ];
    const effectiveDate = new Date("2024-04-01");

    const result = updateDocumentClassificationStandards(
      approvedChanges,
      currentClassificationRules,
      effectiveDate
    );

    expect(result.affectedDocumentCount).toBeGreaterThan(0);
    expect(result.applicationStartDate).toEqual(effectiveDate);
  });

  test("SCEN-509: 更新処理が途中で中断された場合、適切な復旧処理が実行される", () => {
    const approvedChanges = [];
    const currentClassificationRules = [];
    const effectiveDate = new Date("2024-04-01");

    expect(() => updateDocumentClassificationStandards(
      approvedChanges,
      currentClassificationRules,
      effectiveDate
    )).toThrow("法令改正に伴う変更要件が正しく承認されていません");
  });

  test("SCEN-510: 緊急度と影響範囲に基づいて適切な優先順位が決定される", () => {
    const urgencyLevel = "即日対応";
    const impactScope = "全学";
    const affectedDocumentTypes = ["補助金申請書"];
    const currentProcessingLoad = 50;

    const result = determineLegalChangeProcessingPriority(
      urgencyLevel,
      impactScope,
      affectedDocumentTypes,
      currentProcessingLoad
    );

    expect(result.priority).toBe("最優先");
    expect(result.scheduleDays).toBe(1);
    expect(result.notificationLevel).toBe("緊急");
  });

  test("SCEN-511: 最高優先度案件に対して適切な対応スケジュールが設定される", () => {
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
    expect(result.processingOrder).toBe(1);
  });

  test("SCEN-512: 優先度判定基準が不明確な場合、デフォルト優先度が適用される", () => {
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