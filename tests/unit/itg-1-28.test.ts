import {
  validateApplicationBeforeSubmission,
  analyzeRegulationImpactScope,
  classifyLegalChangeImpactLevel,
  migrateExistingDataToNewClassification
} from "../../src/logic/it-1-br-1779263788059-2-1-1";

const fetchMock = require("jest-fetch-mock");

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test("すべての検証項目を満たす場合、申請が正常に提出される", () => {
    // SCEN-429
    const result = validateApplicationBeforeSubmission(
      "研究設備導入に関する補助金申請",
      "本申請は文部科学省の研究設備整備費補助金を活用し、最新の実験装置を導入することで研究環境の向上を図るものです。",
      "subsidy",
      "hybrid",
      ["承認者1", "承認者2"],
      { 申請金額: "5000000", 実施期間: "2024-04-01から2025-03-31", 申請理由: "研究環境向上のため" }
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  test("検証項目に不備がある場合、提出が阻止される", () => {
    // SCEN-430
    expect(() => validateApplicationBeforeSubmission(
      "",
      "短い内容",
      "subsidy",
      "hybrid",
      [],
      {}
    )).toThrow("申請書類のタイトルを入力してください");
  });

  test("処理ルートの整合性に問題がある場合、エラーメッセージが表示される", () => {
    // SCEN-431
    expect(() => validateApplicationBeforeSubmission(
      "文部科学省補助金申請書",
      "補助金申請に関する詳細な説明文書です。",
      "subsidy",
      "electronic",
      ["承認者1"],
      { 申請金額: "1000000" }
    )).toThrow("補助金関連書類は紙保管が必要なため、ハイブリッド処理を選択してください");
  });

  test("改正内容の影響を受ける文書種別が正しく特定される", () => {
    // SCEN-498
    const result = analyzeRegulationImpactScope(
      "文部科学省補助金要綱の改正により、研究設備費の申請書類について電子保存要件が変更されました。",
      ["補助金関連法令", "会計検査院規則"],
      [
        { typeName: "補助金申請書", regulationCategory: "補助金関連法令", storageRequirement: "paper" },
        { typeName: "研究費申請書", regulationCategory: "補助金関連法令", storageRequirement: "electronic" },
        { typeName: "一般事務書類", regulationCategory: "一般事務", storageRequirement: "electronic" }
      ]
    );

    expect(result.affectedDocumentTypes).toContain("補助金申請書");
    expect(result.affectedDocumentTypes).toContain("研究費申請書");
    expect(result.changeRequiredCount).toBe(2);
  });

  test("影響度レベルが適切に分類される", () => {
    // SCEN-499
    const result = classifyLegalChangeImpactLevel(
      "文部科学省補助金要綱の改正により、補助金申請書類の保存期間が7年から10年に延長されました。",
      ["補助金申請書", "実績報告書", "収支決算書"],
      [
        { document_type: "補助金申請書" },
        { document_type: "実績報告書" }
      ],
      new Date("2024-03-01")
    );

    expect(result.impactLevel).toBe("medium");
    expect(result.priority).toBe(2);
    expect(result.requiredResponseDays).toBe(30);
    expect(result.affectedRuleCount).toBe(2);
  });

  test("分析処理で予期しないデータ形式が検出された場合、エラーが発生する", () => {
    // SCEN-500
    expect(() => analyzeRegulationImpactScope(
      "",
      ["補助金関連法令"],
      []
    )).toThrow("法令改正の変更内容が正しく取得できていません。改正通知の受信処理を確認してください。");
  });

  test("新しい分類基準に基づいて既存データが適切に再分類される", () => {
    // SCEN-504
    const result = migrateExistingDataToNewClassification(
      [
        { documentType: "補助金申請書", processingRoute: "hybrid", paperStorageRequired: true },
        { documentType: "一般事務書類", processingRoute: "electronic", paperStorageRequired: false }
      ],
      [
        { id: "DOC001", document_type: "補助金申請書", current_processing_route: "electronic" },
        { id: "DOC002", document_type: "一般事務書類", current_processing_route: "electronic" }
      ],
      "補助金関連書類"
    );

    expect(result.migratedCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(result.errorCount).toBe(0);
    expect(result.updatedRoutes).toHaveLength(1);
    expect(result.updatedRoutes[0].oldRoute).toBe("electronic");
    expect(result.updatedRoutes[0].newRoute).toBe("hybrid");
  });

  test("移行対象外データが従来ルートを維持する", () => {
    // SCEN-505
    const result = migrateExistingDataToNewClassification(
      [{ documentType: "補助金申請書", processingRoute: "hybrid", paperStorageRequired: true }],
      [
        { id: "DOC001", document_type: "一般事務書類", current_processing_route: "electronic" },
        { id: "DOC002", document_type: "人事書類", current_processing_route: "electronic" }
      ],
      "補助金関連書類"
    );

    expect(result.migratedCount).toBe(0);
    expect(result.skippedCount).toBe(2);
    expect(result.updatedRoutes).toHaveLength(0);
  });

  test("再分類処理中にデータ整合性エラーが発生した場合、適切に処理される", () => {
    // SCEN-506
    expect(() => migrateExistingDataToNewClassification(
      [],
      [{ id: "DOC001", document_type: "補助金申請書", current_processing_route: "electronic" }],
      "補助金関連書類"
    )).toThrow("法令改正に基づく新しい分類基準が設定されていません。分類基準を確認してください。");
  });
});