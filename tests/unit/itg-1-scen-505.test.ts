import { migrateExistingDataToNewClassification } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("既存データ再分類処理において移行対象外データが従来ルートを維持する", () => {
    // SCEN-505
    const newClassificationRules = [
      {
        documentType: "補助金申請書",
        subsidyRelated: true,
        paperStorageRequired: true,
        processingRoute: "hybrid"
      },
      {
        documentType: "一般申請書",
        subsidyRelated: false,
        paperStorageRequired: false,
        processingRoute: "electronic"
      }
    ];

    const existingDocuments = [
      {
        id: "doc-001",
        documentType: "補助金申請書",
        current_processing_route: "electronic",
        title: "科研費申請書",
        content: "研究費の申請です"
      },
      {
        id: "doc-002", 
        documentType: "人事申請書",
        current_processing_route: "electronic",
        title: "休暇申請書",
        content: "有給休暇の申請です"
      },
      {
        id: "doc-003",
        documentType: "一般申請書",
        current_processing_route: "electronic", 
        title: "会議室使用申請",
        content: "会議室の使用申請です"
      }
    ];

    const migrationScope = "補助金関連文書のみ";

    const result = migrateExistingDataToNewClassification(
      newClassificationRules,
      existingDocuments,
      migrationScope
    );

    expect(result.migratedCount).toBe(1);
    expect(result.skippedCount).toBe(2);
    expect(result.errorCount).toBe(0);
    expect(result.updatedRoutes).toHaveLength(1);
    expect(result.updatedRoutes[0]).toEqual({
      documentId: "doc-001",
      oldRoute: "electronic",
      newRoute: "hybrid"
    });
  });
});