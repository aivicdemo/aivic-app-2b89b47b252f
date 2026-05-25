import { migrateExistingDataToNewClassification } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("SCEN-504: [normal] 既存データ再分類 - 新しい分類基準に基づいて既存データが適切に再分類される", () => {
    // SCEN-504
    const newClassificationRules = [
      {
        documentType: "補助金申請書",
        keywords: ["補助金", "文部科学省"],
        threshold: 0.7,
        paperStorageRequired: true,
        processingRoute: "hybrid"
      },
      {
        documentType: "一般申請書", 
        keywords: ["申請", "許可"],
        threshold: 0.5,
        paperStorageRequired: false,
        processingRoute: "electronic"
      }
    ];

    const existingDocuments = [
      {
        id: "DOC001",
        title: "文部科学省補助金申請について",
        content: "補助金の申請を行います",
        current_processing_route: "electronic",
        documentType: "補助金申請書"
      },
      {
        id: "DOC002", 
        title: "設備購入許可申請",
        content: "設備の購入許可を申請します",
        current_processing_route: "hybrid",
        documentType: "一般申請書"
      },
      {
        id: "DOC003",
        title: "研究費補助金申請書",
        content: "研究費の補助金申請を提出します",
        current_processing_route: "electronic", 
        documentType: "補助金申請書"
      }
    ];

    const migrationScope = "subsidy_related";

    const result = migrateExistingDataToNewClassification(
      newClassificationRules,
      existingDocuments,
      migrationScope
    );

    expect(result.migratedCount).toBe(2);
    expect(result.skippedCount).toBe(0);
    expect(result.errorCount).toBe(0);
    expect(result.updatedRoutes).toHaveLength(2);
    expect(result.updatedRoutes[0]).toEqual({
      documentId: "DOC001",
      oldRoute: "electronic",
      newRoute: "hybrid"
    });
    expect(result.updatedRoutes[1]).toEqual({
      documentId: "DOC003", 
      oldRoute: "electronic",
      newRoute: "hybrid"
    });
  });
});