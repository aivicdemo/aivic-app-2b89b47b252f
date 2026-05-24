import { migrateExistingDataToNewClassification } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("既存データ再分類処理中にデータ整合性エラーが発生した場合の適切な処理", () => {
    // SCEN-506
    
    // 正常なデータと不整合データが混在する新分類ルール
    const newClassificationRules = [
      {
        documentType: "補助金申請書",
        processingRoute: "hybrid",
        paperStorageRequired: true
      },
      {
        documentType: "一般申請書", 
        processingRoute: "electronic",
        paperStorageRequired: false
      }
    ];

    // データ整合性エラーを含む既存文書データ
    const existingDocuments = [
      {
        id: "DOC001",
        type: "補助金申請書",
        current_processing_route: "electronic",
        created_date: new Date("2023-01-15")
      },
      {
        id: "DOC002", 
        type: "一般申請書",
        current_processing_route: "paper_only",
        created_date: new Date("2023-02-20")
      },
      {
        id: "DOC003",
        type: null, // データ整合性エラー: null値
        current_processing_route: "electronic",
        created_date: new Date("2023-03-10")
      },
      {
        id: "DOC004",
        type: "補助金申請書",
        current_processing_route: undefined, // データ整合性エラー: undefined値
        created_date: new Date("2023-04-05")
      }
    ];

    const migrationScope = "all_documents";

    const result = migrateExistingDataToNewClassification(
      newClassificationRules,
      existingDocuments, 
      migrationScope
    );

    // 正常処理された件数: DOC001とDOC002の2件
    expect(result.migratedCount).toBe(1);
    
    // スキップされた件数: DOC002（処理ルート変更不要）
    expect(result.skippedCount).toBe(1);
    
    // エラー件数: DOC003とDOC004の2件
    expect(result.errorCount).toBe(2);

    // 更新されたルート情報
    expect(result.updatedRoutes).toEqual([
      {
        documentId: "DOC001",
        oldRoute: "electronic", 
        newRoute: "hybrid"
      }
    ]);
  });
});