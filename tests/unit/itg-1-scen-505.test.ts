import { migrateExistingDataToNewClassification } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("既存データ再分類 - 移行対象外データが従来ルートを維持する", () => {
    // SCEN-505
    
    const newClassificationRules = [
      {
        documentType: "補助金申請書",
        keywords: ["補助金", "助成金", "文部科学省"],
        processingRoute: "hybrid",
        paperStorageRequired: true
      },
      {
        documentType: "設備購入申請書",
        keywords: ["設備", "機器", "購入"],
        processingRoute: "electronic",
        paperStorageRequired: false
      }
    ];

    const existingDocuments = [
      {
        id: "DOC001",
        title: "文部科学省運営費交付金申請書",
        content: "運営費交付金による研究設備の購入申請",
        document_type: "補助金申請書",
        current_processing_route: "electronic",
        created_date: new Date("2024-01-15T10:00:00Z")
      },
      {
        id: "DOC002", 
        title: "一般事務用品購入依頼書",
        content: "事務用品の購入に関する依頼",
        document_type: "一般購入申請書",
        current_processing_route: "electronic",
        created_date: new Date("2024-01-16T14:30:00Z")
      },
      {
        id: "DOC003",
        title: "設備機器導入申請書",
        content: "研究用設備機器の導入申請",
        document_type: "設備購入申請書", 
        current_processing_route: "electronic",
        created_date: new Date("2024-01-17T09:15:00Z")
      }
    ];

    const migrationScope = "補助金関連および設備購入関連";

    const result = migrateExistingDataToNewClassification(
      newClassificationRules,
      existingDocuments,
      migrationScope
    );

    expect(result.migratedCount).toBe(1);
    expect(result.skippedCount).toBe(2);
    expect(result.errorCount).toBe(0);
    expect(result.updatedRoutes).toHaveLength(1);
    expect(result.updatedRoutes[0].documentId).toBe("DOC001");
    expect(result.updatedRoutes[0].oldRoute).toBe("electronic");
    expect(result.updatedRoutes[0].newRoute).toBe("hybrid");
  });
});