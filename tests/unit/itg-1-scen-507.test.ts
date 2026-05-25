import { updateDocumentClassificationStandards } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("SCEN-507: 文書分類基準更新 - 法令改正に対応した分類基準が正しく更新される", () => {
    // 承認された変更要件
    const approvedChanges = [
      {
        changeId: "change-001",
        documentType: "補助金申請書",
        newPaperStorageRequired: true,
        reason: "文部科学省要件変更"
      },
      {
        changeId: "change-002", 
        documentType: "研究費申請書",
        newPaperStorageRequired: true,
        reason: "補助金関連度向上"
      }
    ];

    // 現在の文書分類基準
    const currentClassificationRules = [
      {
        documentType: "補助金申請書",
        processingRoute: "electronic",
        paperStorageRequired: false
      },
      {
        documentType: "研究費申請書", 
        processingRoute: "electronic",
        paperStorageRequired: false
      },
      {
        documentType: "一般申請書",
        processingRoute: "electronic", 
        paperStorageRequired: false
      }
    ];

    // 施行日
    const effectiveDate = new Date("2024-04-01T00:00:00Z");

    // テスト実行
    const result = updateDocumentClassificationStandards(
      approvedChanges,
      currentClassificationRules,
      effectiveDate
    );

    // 期待結果の算出（擬似コードに基づく）
    const expectedUpdatedRules = [
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

    const expectedAffectedCount = 150; // 補助金申請書100件 + 研究費申請書50件
    const expectedRouteMapping = [
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

    // アサーション
    expect(result.updatedRules).toEqual(expectedUpdatedRules);
    expect(result.affectedDocumentCount).toBe(expectedAffectedCount);
    expect(result.newProcessingRoutes).toEqual(expectedRouteMapping);
    expect(result.applicationStartDate).toEqual(effectiveDate);
  });
});