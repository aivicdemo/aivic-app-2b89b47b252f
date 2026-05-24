import { migrateExistingDataToNewClassification } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("既存データ再分類 - 再分類処理中にデータ整合性エラーが発生した場合、適切に処理される", () => {
    // SCEN-506
    
    const newClassificationRules = [
      {
        documentType: "補助金申請書",
        processingRoute: "hybrid",
        paperStorageRequired: true
      },
      {
        documentType: "研究費申請書",
        processingRoute: "electronic",
        paperStorageRequired: false
      }
    ];

    // データ整合性エラーが発生するケース：不正な文書IDを含む既存データ
    const existingDocuments = [
      {
        id: "doc001",
        type: "補助金申請書",
        current_processing_route: "electronic"
      },
      {
        id: "", // 空のID（整合性エラー）
        type: "研究費申請書",
        current_processing_route: "electronic"
      },
      {
        id: "doc003",
        type: "補助金申請書",
        current_processing_route: "electronic"
      }
    ];

    const migrationScope = "all";

    const result = migrateExistingDataToNewClassification(
      newClassificationRules,
      existingDocuments,
      migrationScope
    );

    // データ整合性エラーが発生した場合の期待結果
    // 正常処理された文書数：2件（doc001とdoc003）
    // エラー件数：1件（空のIDの文書）
    // スキップ件数：0件
    expect(result.migratedCount).toBe(2);
    expect(result.errorCount).toBe(1);
    expect(result.skippedCount).toBe(0);
    
    // 処理ルートが更新された文書の詳細確認
    expect(result.updatedRoutes).toEqual([
      {
        documentId: "doc001",
        oldRoute: "electronic",
        newRoute: "hybrid"
      },
      {
        documentId: "doc003",
        oldRoute: "electronic",
        newRoute: "hybrid"
      }
    ]);
  });
});