import { migrateExistingDataToNewClassification } from '../../src/logic/it-1-br-1779263788059-2-2-1';

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("文書分類基準更新 - 更新処理が途中で中断された場合、適切な復旧処理が実行される", () => {
    // SCEN-509
    
    // 法令改正により新しい分類基準が適用される状況
    const newClassificationRules = [
      {
        documentType: "補助金申請書",
        processingRoute: "hybrid",
        paperStorageRequired: true,
        regulationCategory: "subsidy"
      },
      {
        documentType: "研究費申請書",
        processingRoute: "electronic", 
        paperStorageRequired: false,
        regulationCategory: "research"
      }
    ];

    // 既存の申請書類データ（更新対象と対象外が混在）
    const existingDocuments = [
      {
        id: "DOC-001",
        type: "補助金申請書",
        current_processing_route: "electronic",
        created_date: new Date("2024-01-15"),
        department: "総務部"
      },
      {
        id: "DOC-002", 
        type: "研究費申請書",
        current_processing_route: "hybrid",
        created_date: new Date("2024-02-10"),
        department: "研究支援課"
      },
      {
        id: "DOC-003",
        type: "人事申請書",
        current_processing_route: "electronic",
        created_date: new Date("2024-01-20"),
        department: "人事課"
      }
    ];

    // 今回の法令改正で影響を受ける文書の範囲指定
    const migrationScope = "subsidy_and_research_documents";

    const result = migrateExistingDataToNewClassification(
      newClassificationRules,
      existingDocuments, 
      migrationScope
    );

    // 移行成功件数の検証（2件が対象、1件が実際に変更される）
    expect(result.migratedCount).toBe(1);
    
    // 移行対象外件数の検証（1件は処理ルートが同じため変更なし、1件は範囲外）
    expect(result.skippedCount).toBe(1);
    
    // エラー件数の検証（全て正常処理）
    expect(result.errorCount).toBe(0);
    
    // 処理ルートが変更された書類の詳細検証
    expect(result.updatedRoutes).toEqual([
      {
        documentId: "DOC-001",
        oldRoute: "electronic",
        newRoute: "hybrid"
      }
    ]);
  });
});