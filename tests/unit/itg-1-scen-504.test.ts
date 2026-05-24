import { migrateExistingDataToNewClassification } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("新しい分類基準に基づいて既存データが適切に再分類される", () => {
    // SCEN-504
    
    const newClassificationRules = [
      {
        documentType: "補助金申請書",
        subsidyKeywords: ["科研費", "運営費交付金", "設備整備費"],
        moeRequirement: true,
        processingRoute: "hybrid"
      },
      {
        documentType: "一般申請書",
        subsidyKeywords: [],
        moeRequirement: false,
        processingRoute: "electronic"
      }
    ];

    const existingDocuments = [
      {
        id: "DOC001",
        title: "科研費申請書類",
        content: "科学研究費補助金の申請に関する書類",
        documentType: "一般申請書",
        current_processing_route: "electronic"
      },
      {
        id: "DOC002",
        title: "設備整備費申請",
        content: "設備整備費補助金の申請書類",
        documentType: "補助金申請書",
        current_processing_route: "electronic"
      },
      {
        id: "DOC003",
        title: "人事関連書類",
        content: "人事に関する一般的な申請書類",
        documentType: "一般申請書",
        current_processing_route: "electronic"
      }
    ];

    const migrationScope = "補助金関連";

    const result = migrateExistingDataToNewClassification(
      newClassificationRules,
      existingDocuments,
      migrationScope
    );

    expect(result.migratedCount).toBe(2);
    expect(result.skippedCount).toBe(1);
    expect(result.errorCount).toBe(0);
    expect(result.updatedRoutes).toEqual([
      {
        documentId: "DOC001",
        oldRoute: "electronic",
        newRoute: "hybrid"
      },
      {
        documentId: "DOC002",
        oldRoute: "electronic",
        newRoute: "hybrid"
      }
    ]);
  });
});