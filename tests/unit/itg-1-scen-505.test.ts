import { migrateExistingDataToNewClassification } from "../../src/logic/it-1-br-1779263788059-2-1-1";

interface ClassificationRule {
  documentType: string;
  processingRoute: string;
  paperStorageRequired: boolean;
}

interface Document {
  id: string;
  type: string;
  current_processing_route: string;
}

interface RouteUpdate {
  documentId: string;
  oldRoute: string;
  newRoute: string;
}

interface MigrationResult {
  migratedCount: number;
  skippedCount: number;
  errorCount: number;
  updatedRoutes: RouteUpdate[];
}

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("法令改正により影響を受けない文書が従来の処理ルートを維持すること", () => {
    // SCEN-505
    const newClassificationRules: ClassificationRule[] = [
      {
        documentType: "補助金申請書",
        processingRoute: "hybrid",
        paperStorageRequired: true
      },
      {
        documentType: "研究費申請書", 
        processingRoute: "hybrid",
        paperStorageRequired: true
      }
    ];

    const existingDocuments: Document[] = [
      {
        id: "doc001",
        type: "補助金申請書",
        current_processing_route: "electronic"
      },
      {
        id: "doc002", 
        type: "一般申請書",
        current_processing_route: "electronic"
      },
      {
        id: "doc003",
        type: "人事申請書",
        current_processing_route: "electronic"
      }
    ];

    const migrationScope = "補助金関連";

    const result: MigrationResult = migrateExistingDataToNewClassification(
      newClassificationRules,
      existingDocuments,
      migrationScope
    );

    expect(result.migratedCount).toBe(1);
    expect(result.skippedCount).toBe(2);
    expect(result.errorCount).toBe(0);
    expect(result.updatedRoutes.length).toBe(1);
    expect(result.updatedRoutes[0]).toEqual({
      documentId: "doc001",
      oldRoute: "electronic",
      newRoute: "hybrid"
    });
  });
});