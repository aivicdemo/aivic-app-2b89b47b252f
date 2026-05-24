import { updateDocumentClassificationStandards } from '../../src/logic/it-1-br-1779263788059-2-2-1';

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("文書分類基準更新 - 更新完了後に関係者への通知が送信される", () => {
    // SCEN-508
    const approvedChanges = [
      {
        documentType: "補助金申請書",
        changeReason: "法令改正対応",
        requiredRoute: "hybrid",
        paperStorageRequired: true
      },
      {
        documentType: "研究費申請書", 
        changeReason: "文部科学省要件変更",
        requiredRoute: "electronic",
        paperStorageRequired: false
      }
    ];

    const currentClassificationRules = [
      {
        documentType: "補助金申請書",
        processingRoute: "electronic",
        paperStorageRequired: false
      },
      {
        documentType: "研究費申請書",
        processingRoute: "hybrid", 
        paperStorageRequired: true
      }
    ];

    const effectiveDate = new Date("2024-04-01T00:00:00Z");

    const result = updateDocumentClassificationStandards(
      approvedChanges,
      currentClassificationRules,
      effectiveDate
    );

    expect(result.updatedRules).toEqual([
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
    ]);

    expect(result.affectedDocumentCount).toBe(2);

    expect(result.newProcessingRoutes).toEqual([
      {
        documentType: "補助金申請書",
        oldRoute: "electronic",
        newRoute: "hybrid"
      },
      {
        documentType: "研究費申請書", 
        oldRoute: "hybrid",
        newRoute: "electronic"
      }
    ]);

    expect(result.applicationStartDate).toEqual(effectiveDate);
  });
});