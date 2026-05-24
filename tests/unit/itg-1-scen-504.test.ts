import { migrateExistingDataToNewClassification } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("新しい分類基準に基づいて既存データが適切に再分類される", () => {
    // SCEN-504
    
    const newClassificationRules = [
      {
        documentType: "補助金申請書",
        subsidyKeywords: ["補助金", "助成金", "文部科学省"],
        processingRoute: "hybrid",
        paperStorageRequired: true
      },
      {
        documentType: "研究費申請書",
        subsidyKeywords: ["科研費", "研究費", "運営費交付金"],
        processingRoute: "hybrid",
        paperStorageRequired: true
      },
      {
        documentType: "一般申請書",
        subsidyKeywords: [],
        processingRoute: "electronic",
        paperStorageRequired: false
      }
    ];

    const existingDocuments = [
      {
        id: "DOC001",
        title: "令和6年度文部科学省補助金申請について",
        content: "文部科学省の補助金制度に基づく申請書類です",
        current_processing_route: "electronic"
      },
      {
        id: "DOC002", 
        title: "科研費基盤研究申請書",
        content: "科学研究費助成事業の基盤研究申請に関する書類",
        current_processing_route: "electronic"
      },
      {
        id: "DOC003",
        title: "備品購入申請書",
        content: "事務用品の購入に関する申請書類",
        current_processing_route: "electronic"
      },
      {
        id: "DOC004",
        title: "研究設備導入申請書",
        content: "運営費交付金による研究設備の導入申請",
        current_processing_route: "electronic"
      }
    ];

    const migrationScope = "法令改正対応";

    const result = migrateExistingDataToNewClassification(
      newClassificationRules,
      existingDocuments,
      migrationScope
    );

    expect(result.migratedCount).toBe(3);
    expect(result.skippedCount).toBe(1);
    expect(result.errorCount).toBe(0);
    expect(result.updatedRoutes).toHaveLength(3);
    
    expect(result.updatedRoutes[0]).toEqual({
      documentId: "DOC001",
      oldRoute: "electronic",
      newRoute: "hybrid"
    });
    
    expect(result.updatedRoutes[1]).toEqual({
      documentId: "DOC002",
      oldRoute: "electronic", 
      newRoute: "hybrid"
    });
    
    expect(result.updatedRoutes[2]).toEqual({
      documentId: "DOC004",
      oldRoute: "electronic",
      newRoute: "hybrid"
    });
  });
});