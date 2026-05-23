import {
  validateApplicationBeforeSubmission,
  analyzeRegulationImpactScope,
  classifyLegalChangeImpactLevel,
  migrateExistingDataToNewClassification
} from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("SCEN-429: すべての検証項目を満たす場合、申請が正常に提出される", () => {
    const documentTitle = "科研費申請書類";
    const documentContent = "研究内容の詳細を記載した申請書類です。";
    const documentType = "subsidy";
    const processingRoute = "hybrid";
    const approvalRoute = ["承認者1", "承認者2"];
    const requiredFields = {
      申請者名: "田中太郎",
      所属部署: "研究推進部",
      申請金額: "1000000"
    };

    const result = validateApplicationBeforeSubmission(
      documentTitle,
      documentContent,
      documentType,
      processingRoute,
      approvalRoute,
      requiredFields
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("SCEN-430: 検証項目に不備がある場合、提出が阻止される", () => {
    const documentTitle = "";
    const documentContent = "短い";
    const documentType = "subsidy";
    const processingRoute = "hybrid";
    const approvalRoute = [];
    const requiredFields = {
      申請者名: "",
      所属部署: "研究推進部"
    };

    const result = validateApplicationBeforeSubmission(
      documentTitle,
      documentContent,
      documentType,
      processingRoute,
      approvalRoute,
      requiredFields
    );

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("申請書類のタイトルを入力してください");
    expect(result.errors).toContain("申請内容を10文字以上で入力してください");
    expect(result.errors).toContain("必須項目「申請者名」を入力してください");
    expect(result.errors).toContain("承認者を設定してください");
  });

  test("SCEN-431: 処理ルートの整合性に問題がある場合、エラーメッセージが表示される", () => {
    expect(() => {
      validateApplicationBeforeSubmission(
        "補助金申請書類",
        "詳細な申請内容を記載しています。",
        "subsidy",
        "electronic",
        ["承認者1"],
        { 申請者名: "田中太郎" }
      );
    }).toThrow("補助金関連書類は紙保管が必要なため、ハイブリッド処理を選択してください");
  });

  test("SCEN-498: 改正内容の影響を受ける文書種別が正しく特定される", () => {
    const regulationChangeContent = "補助金申請書類の電子化要件が変更されました";
    const affectedRegulationTypes = ["補助金関連", "研究費関連"];
    const currentDocumentTypes = [
      { typeName: "補助金申請書", regulationCategory: "補助金関連", storageRequirement: "electronic" },
      { typeName: "一般申請書", regulationCategory: "一般事務", storageRequirement: "electronic" },
      { typeName: "研究費申請書", regulationCategory: "研究費関連", storageRequirement: "paper" }
    ];

    const result = analyzeRegulationImpactScope(
      regulationChangeContent,
      affectedRegulationTypes,
      currentDocumentTypes
    );

    expect(result.affectedDocumentTypes).toContain("補助金申請書");
    expect(result.affectedDocumentTypes).toContain("研究費申請書");
    expect(result.affectedDocumentTypes).not.toContain("一般申請書");
    expect(result.changeRequiredCount).toBeGreaterThan(0);
  });

  test("SCEN-499: 影響度レベルが適切に分類される", () => {
    const changeNotification = "補助金申請書類の保管要件が変更され、紙保管が義務化されました";
    const affectedDocumentTypes = Array(12).fill(0).map((_, i) => `補助金申請書${i + 1}`);
    const currentProcessingRules = Array(12).fill(0).map((_, i) => ({ 
      document_type: `補助金申請書${i + 1}`,
      processing_route: "electronic"
    }));
    const complianceDeadline = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);

    const result = classifyLegalChangeImpactLevel(
      changeNotification,
      affectedDocumentTypes,
      currentProcessingRules,
      complianceDeadline
    );

    expect(result.impactLevel).toBe("high");
    expect(result.priority).toBe(1);
    expect(result.requiredResponseDays).toBe(14);
    expect(result.affectedRuleCount).toBe(12);
    expect(result.riskAssessment).toBe("法令違反リスク高");
  });

  test("SCEN-500: 分析処理で予期しないデータ形式が検出された場合、エラーが発生する", () => {
    expect(() => {
      analyzeRegulationImpactScope(
        "",
        ["補助金関連"],
        []
      );
    }).toThrow("法令改正の変更内容が正しく取得できていません。改正通知の受信処理を確認してください。");
  });

  test("SCEN-504: 新しい分類基準に基づいて既存データが適切に再分類される", () => {
    const newClassificationRules = [
      { documentType: "補助金申請書", processingRoute: "hybrid", paperStorageRequired: true },
      { documentType: "一般申請書", processingRoute: "electronic", paperStorageRequired: false }
    ];
    const existingDocuments = [
      { id: "doc1", type: "補助金申請書", current_processing_route: "electronic" },
      { id: "doc2", type: "一般申請書", current_processing_route: "electronic" },
      { id: "doc3", type: "補助金申請書", current_processing_route: "electronic" }
    ];
    const migrationScope = "all";

    const result = migrateExistingDataToNewClassification(
      newClassificationRules,
      existingDocuments,
      migrationScope
    );

    expect(result.migratedCount).toBe(2);
    expect(result.skippedCount).toBe(1);
    expect(result.errorCount).toBe(0);
    expect(result.updatedRoutes).toHaveLength(2);
    expect(result.updatedRoutes[0].newRoute).toBe("hybrid");
  });

  test("SCEN-505: 移行対象外データが従来ルートを維持する", () => {
    const newClassificationRules = [
      { documentType: "補助金申請書", processingRoute: "hybrid", paperStorageRequired: true }
    ];
    const existingDocuments = [
      { id: "doc1", type: "補助金申請書", current_processing_route: "hybrid" },
      { id: "doc2", type: "一般申請書", current_processing_route: "electronic" }
    ];
    const migrationScope = "subsidy_only";

    const result = migrateExistingDataToNewClassification(
      newClassificationRules,
      existingDocuments,
      migrationScope
    );

    expect(result.migratedCount).toBe(0);
    expect(result.skippedCount).toBe(1);
    expect(result.errorCount).toBe(0);
  });

  test("SCEN-506: 再分類処理中にデータ整合性エラーが発生した場合、適切に処理される", () => {
    expect(() => {
      migrateExistingDataToNewClassification(
        [],
        [{ id: "doc1", type: "補助金申請書", current_processing_route: "electronic" }],
        "all"
      );
    }).toThrow("法令改正に基づく新しい分類基準が設定されていません。分類基準を確認してください。");
  });
});