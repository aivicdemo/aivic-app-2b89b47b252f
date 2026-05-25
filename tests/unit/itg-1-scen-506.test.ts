import { migrateExistingDataToNewClassification } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("SCEN-506: 既存データ再分類 - 再分類処理中にデータ整合性エラーが発生した場合、適切に処理される", () => {
    const newClassificationRules = [
      {
        documentType: "補助金申請書",
        keywords: ["補助金", "助成金"],
        processingRoute: "hybrid"
      }
    ];

    const existingDocuments = [
      {
        id: "doc1",
        title: "補助金申請",
        content: "研究費補助金の申請",
        current_processing_route: "electronic"
      },
      {
        id: "doc2", 
        title: "一般申請",
        content: "設備購入申請",
        current_processing_route: "electronic"
      },
      {
        id: "doc3",
        title: null, // データ整合性エラーの原因
        content: "補助金関連書類",
        current_processing_route: "electronic"
      }
    ];

    const migrationScope = "all";

    const result = migrateExistingDataToNewClassification(
      newClassificationRules,
      existingDocuments,
      migrationScope
    );

    expect(result.migratedCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(result.errorCount).toBe(1);
    expect(result.updatedRoutes).toEqual([
      {
        documentId: "doc1",
        oldRoute: "electronic", 
        newRoute: "hybrid"
      }
    ]);
  });
});