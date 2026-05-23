import { validateApplicationBeforeSubmission, analyzeRegulationImpactScope, migrateExistingDataToNewClassification } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  
  test("申請書類提出検証 - すべての検証項目を満たす場合、申請が正常に提出される", () => {
    // SCEN-429
    const documentTitle = "令和6年度科学研究費助成事業申請書";
    const documentContent = "本研究は人工知能技術を用いた医療診断支援システムの開発を目的とする。研究期間は3年間とし、総予算は500万円を予定している。";
    const documentType = "subsidy";
    const processingRoute = "hybrid";
    const approvalRoute = ["課長", "部長"];
    const requiredFields = {
      applicantName: "田中太郎",
      budget: 5000000,
      period: "3年間"
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
    expect(result.warnings).toEqual([]);
  });

  test("申請書類提出検証 - 検証項目に不備がある場合、提出が阻止される", () => {
    // SCEN-430
    const documentTitle = "";
    const documentContent = "短い内容";
    const documentType = "subsidy";
    const processingRoute = "electronic";
    const approvalRoute = [];
    const requiredFields = {
      applicantName: "",
      budget: null,
      period: ""
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
    expect(result.errors).toContain("必須項目「applicantName」を入力してください");
    expect(result.errors).toContain("補助金関連書類はハイブリッド処理が必要です");
    expect(result.errors).toContain("承認者を設定してください");
  });

  test("申請書類提出検証 - 処理ルートの整合性に問題がある場合、エラーメッセージが表示される", () => {
    // SCEN-431
    expect(() => {
      validateApplicationBeforeSubmission(
        "",
        "内容が短い",
        "subsidy",
        "electronic",
        [],
        {}
      );
    }).toThrow("申請書類のタイトルを入力してください");
  });

  test("法令改正影響範囲分析 - 改正内容の影響を受ける文書種別が正しく特定される", () => {
    // SCEN-498
    const regulationChangeContent = "文部科学省の補助金申請書類について、電子保存に加えて紙による保管を義務化する";
    const affectedRegulationTypes = ["補助金要綱", "文書管理規則"];
    const currentDocumentTypes = [
      { typeName: "補助金申請書", regulationCategory: "補助金要綱", storageRequirement: "electronic" },
      { typeName: "一般申請書", regulationCategory: "一般事務", storageRequirement: "electronic" },
      { typeName: "研究費申請書", regulationCategory: "補助金要綱", storageRequirement: "electronic" }
    ];

    const result = analyzeRegulationImpactScope(
      regulationChangeContent,
      affectedRegulationTypes,
      currentDocumentTypes
    );

    expect(result.affectedDocumentTypes).toContain("補助金申請書");
    expect(result.affectedDocumentTypes).toContain("研究費申請書");
    expect(result.affectedDocumentTypes).not.toContain("一般申請書");
    expect(result.processingRouteChanges).toHaveLength(2);
    expect(result.processingRouteChanges[0]).toEqual({
      documentType: "補助金申請書",
      oldRoute: "electronic",
      newRoute: "hybrid"
    });
  });

  test("法令改正影響範囲分析 - 影響度レベルが適切に分類される", () => {
    // SCEN-499
    const regulationChangeContent = "文部科学省補助金の文書保管要件を変更";
    const affectedRegulationTypes = ["補助金要綱"];
    const currentDocumentTypes = [
      { typeName: "補助金申請書", regulationCategory: "補助金要綱", storageRequirement: "electronic" }
    ];

    const result = analyzeRegulationImpactScope(
      regulationChangeContent,
      affectedRegulationTypes,
      currentDocumentTypes
    );

    expect(result.impactLevel).toBe("軽微");
    expect(result.changeRequiredCount).toBe(1);
  });

  test("法令改正影響範囲分析 - 分析処理で予期しないデータ形式が検出された場合、エラーが発生する", () => {
    // SCEN-500
    expect(() => {
      analyzeRegulationImpactScope(
        "",
        ["補助金要綱"],
        []
      );
    }).toThrow("法令改正の変更内容が正しく取得できていません。改正通知の受信処理を確認してください。");
  });

  test("既存データ再分類 - 新しい分類基準に基づいて既存データが適切に再分類される", () => {
    // SCEN-504
    const newClassificationRules = [
      { documentType: "補助金申請書", processingRoute: "hybrid", paperStorageRequired: true },
      { documentType: "一般申請書", processingRoute: "electronic", paperStorageRequired: false }
    ];
    const existingDocuments = [
      { id: "doc001", documentType: "補助金申請書", current_processing_route: "electronic" },
      { id: "doc002", documentType: "一般申請書", current_processing_route: "electronic" }
    ];
    const migrationScope = "all";

    const result = migrateExistingDataToNewClassification(
      newClassificationRules,
      existingDocuments,
      migrationScope
    );

    expect(result.migratedCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(result.errorCount).toBe(0);
    expect(result.updatedRoutes).toHaveLength(1);
    expect(result.updatedRoutes[0]).toEqual({
      documentId: "doc001",
      oldRoute: "electronic",
      newRoute: "hybrid"
    });
  });

  test("既存データ再分類 - 移行対象外データが従来ルートを維持する", () => {
    // SCEN-505
    const newClassificationRules = [
      { documentType: "補助金申請書", processingRoute: "electronic", paperStorageRequired: false }
    ];
    const existingDocuments = [
      { id: "doc001", documentType: "補助金申請書", current_processing_route: "electronic" }
    ];
    const migrationScope = "all";

    const result = migrateExistingDataToNewClassification(
      newClassificationRules,
      existingDocuments,
      migrationScope
    );

    expect(result.migratedCount).toBe(0);
    expect(result.skippedCount).toBe(1);
    expect(result.errorCount).toBe(0);
    expect(result.updatedRoutes).toHaveLength(0);
  });

  test("既存データ再分類 - 再分類処理中にデータ整合性エラーが発生した場合、適切に処理される", () => {
    // SCEN-506
    expect(() => {
      migrateExistingDataToNewClassification(
        [],
        [{ id: "doc001", documentType: "補助金申請書", current_processing_route: "electronic" }],
        "all"
      );
    }).toThrow("法令改正に基づく新しい分類基準が設定されていません。分類基準を確認してください。");
  });

});