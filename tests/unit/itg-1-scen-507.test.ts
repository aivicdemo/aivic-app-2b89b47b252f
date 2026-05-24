import { updateDocumentClassificationStandards } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正に対応した分類基準が正しく更新される", () => {
    // SCEN-507
    
    const approvedChanges = [
      {
        documentType: "補助金申請書",
        oldRoute: "electronic",
        newRoute: "hybrid",
        reason: "文部科学省要件変更"
      },
      {
        documentType: "研究費申請書",
        oldRoute: "electronic", 
        newRoute: "hybrid",
        reason: "新法令対応"
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
        processingRoute: "electronic",
        paperStorageRequired: false
      },
      {
        documentType: "一般申請書",
        processingRoute: "electronic",
        paperStorageRequired: false
      }
    ];
    
    const effectiveDate = new Date("2024-04-01");
    
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
        processingRoute: "hybrid", 
        paperStorageRequired: true
      }
    ]);
    
    expect(result.affectedDocumentCount).toBe(2);
    
    expect(result.newProcessingRoutes).toEqual([
      { documentType: "補助金申請書", processingRoute: "hybrid" },
      { documentType: "研究費申請書", processingRoute: "hybrid" }
    ]);
    
    expect(result.applicationStartDate).toEqual(new Date("2024-04-01"));
  });
});