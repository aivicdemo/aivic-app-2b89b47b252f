import { migrateExistingDataToNewClassification } from '../../src/logic/it-1-br-1779263788059-2-1-1';

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("既存データ再分類 - 移行対象外データが従来ルートを維持する", () => {
    // SCEN-505
    
    const newClassificationRules = [
      {
        documentType: "補助金申請書",
        processingRoute: "hybrid",
        paperStorageRequired: true,
        migrationScope: "全学"
      },
      {
        documentType: "研究費申請書",
        processingRoute: "electronic",
        paperStorageRequired: false,
        migrationScope: "研究部門"
      }
    ];

    const existingDocuments = [
      {
        id: "DOC001",
        type: "補助金申請書",
        current_processing_route: "electronic",
        created_date: "2024-01-15",
        department: "総務課",
        migrationEligible: true
      },
      {
        id: "DOC002",
        type: "人事申請書",
        current_processing_route: "electronic",
        created_date: "2024-02-01",
        department: "人事課",
        migrationEligible: false
      },
      {
        id: "DOC003",
        type: "研究費申請書",
        current_processing_route: "hybrid",
        created_date: "2024-01-20",
        department: "研究支援課",
        migrationEligible: true
      },
      {
        id: "DOC004",
        type: "一般事務申請書",
        current_processing_route: "electronic",
        created_date: "2024-01-25",
        department: "学務課",
        migrationEligible: false
      }
    ];

    const migrationScope = "法令改正対象";

    const result = migrateExistingDataToNewClassification(
      newClassificationRules,
      existingDocuments,
      migrationScope
    );

    expect(result.migratedCount).toBe(1);
    expect(result.skippedCount).toBe(2);
    expect(result.errorCount).toBe(0);
    expect(result.updatedRoutes).toEqual([
      {
        documentId: "DOC001",
        oldRoute: "electronic",
        newRoute: "hybrid"
      }
    ]);
  });
});