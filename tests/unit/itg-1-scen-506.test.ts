import { migrateExistingDataToNewClassification } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("既存データ再分類 - 再分類処理中にデータ整合性エラーが発生した場合、適切に処理される", () => {
    // SCEN-506
    
    // 新しい分類基準（一部不正なルール含む）
    const newClassificationRules = [
      {
        documentType: "補助金申請書",
        subsidyRelated: true,
        processingRoute: "hybrid",
        paperStorageRequired: true
      },
      {
        documentType: "一般申請書", 
        subsidyRelated: false,
        processingRoute: "electronic",
        paperStorageRequired: false
      }
    ];

    // 既存文書データ（一部に整合性問題があるデータ）
    const existingDocuments = [
      {
        id: "DOC001",
        title: "科研費申請書",
        content: "研究費の申請について",
        documentType: "補助金申請書",
        current_processing_route: "electronic"
      },
      {
        id: "DOC002", 
        title: "備品購入申請",
        content: "パソコン購入の申請",
        documentType: "一般申請書",
        current_processing_route: "electronic"
      },
      {
        id: "DOC003",
        title: null, // データ整合性エラー: タイトルがnull
        content: "設備整備費申請",
        documentType: "補助金申請書", 
        current_processing_route: "electronic"
      }
    ];

    const migrationScope = "subsidy_related";

    const result = migrateExistingDataToNewClassification(
      newClassificationRules,
      existingDocuments,
      migrationScope
    );

    // 移行成功件数: DOC001のみ（ハイブリッドに変更）
    expect(result.migratedCount).toBe(1);
    
    // スキップ件数: DOC002（一般申請書のため対象外）
    expect(result.skippedCount).toBe(1);
    
    // エラー件数: DOC003（タイトルnullによる整合性エラー）
    expect(result.errorCount).toBe(1);
    
    // 更新されたルート: DOC001のみelectronic → hybridに変更
    expect(result.updatedRoutes).toEqual([
      {
        documentId: "DOC001",
        oldRoute: "electronic", 
        newRoute: "hybrid"
      }
    ]);
  });
});