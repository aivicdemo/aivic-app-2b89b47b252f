import { updateDocumentClassificationStandards } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  // SCEN-509: [error] 文書分類基準更新 - 更新処理が途中で中断された場合、適切な復旧処理が実行される
  test("更新処理中断時の復旧処理実行", () => {
    const approvedChanges = [
      {
        changeId: "change-001",
        documentType: "補助金申請書",
        newPaperRequirement: true,
        effectiveDate: new Date("2024-01-15T09:00:00Z"),
        status: "interrupted"
      },
      {
        changeId: "change-002", 
        documentType: "事業報告書",
        newPaperRequirement: false,
        effectiveDate: new Date("2024-01-15T09:00:00Z"),
        status: "interrupted"
      }
    ];

    const currentClassificationRules = [
      {
        documentType: "補助金申請書",
        processingRoute: "electronic",
        paperStorageRequired: false
      },
      {
        documentType: "事業報告書", 
        processingRoute: "hybrid",
        paperStorageRequired: true
      }
    ];

    const effectiveDate = new Date("2024-01-15T09:00:00Z");

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
        documentType: "事業報告書",
        processingRoute: "electronic",
        paperStorageRequired: false
      }
    ]);
    expect(result.affectedDocumentCount).toBe(200);
    expect(result.newProcessingRoutes).toEqual([
      {
        documentType: "補助金申請書", 
        from: "electronic",
        to: "hybrid"
      },
      {
        documentType: "事業報告書",
        from: "hybrid", 
        to: "electronic"
      }
    ]);
    expect(result.applicationStartDate).toEqual(new Date("2024-01-15T09:00:00Z"));
  });
});