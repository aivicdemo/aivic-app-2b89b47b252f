import { migrateExistingDataToNewClassification } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("法令改正に基づく新しい分類基準で既存データを再分類し、処理ルートを適切に更新する", () => {
    // SCEN-504
    const newClassificationRules = [
      {
        documentType: "補助金申請書",
        subsidyRelatedThreshold: 0.6,
        paperStorageRequired: true,
        processingRoute: "hybrid"
      },
      {
        documentType: "研究費申請書",
        subsidyRelatedThreshold: 0.7,
        paperStorageRequired: true,
        processingRoute: "hybrid"
      },
      {
        documentType: "一般事務申請",
        subsidyRelatedThreshold: 0.8,
        paperStorageRequired: false,
        processingRoute: "electronic"
      }
    ];

    const existingDocuments = [
      {
        id: "DOC001",
        title: "科研費研究計画書",
        documentType: "補助金申請書",
        current_processing_route: "electronic",
        subsidyRelated: true
      },
      {
        id: "DOC002", 
        title: "設備購入申請書",
        documentType: "研究費申請書",
        current_processing_route: "electronic",
        subsidyRelated: true
      },
      {
        id: "DOC003",
        title: "会議室予約申請",
        documentType: "一般事務申請",
        current_processing_route: "electronic",
        subsidyRelated: false
      },
      {
        id: "DOC004",
        title: "旅費申請書",
        documentType: "一般事務申請", 
        current_processing_route: "hybrid",
        subsidyRelated: false
      }
    ];

    const migrationScope = "all_subsidy_related";

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