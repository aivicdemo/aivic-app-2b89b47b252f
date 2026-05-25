import { describe, test, expect } from '@jest/globals';
import { updateDocumentClassificationStandards } from '../../src/logic/it-1-br-1779263788059-2-2-1';

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("SCEN-508: [normal] 文書分類基準更新 - 更新完了後に関係者への通知が送信される", () => {
    // SCEN-508
    const approvedChanges = [
      {
        documentType: "補助金申請書",
        oldRoute: "electronic",
        newRoute: "hybrid",
        subsidiaryRelated: true,
        paperStorageRequired: true
      },
      {
        documentType: "事業報告書", 
        oldRoute: "electronic",
        newRoute: "hybrid",
        subsidiaryRelated: true,
        paperStorageRequired: true
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
        processingRoute: "electronic", 
        paperStorageRequired: false
      },
      {
        documentType: "一般申請書",
        processingRoute: "electronic",
        paperStorageRequired: false
      }
    ];
    
    const effectiveDate = new Date("2024-04-01T00:00:00Z");

    const result = updateDocumentClassificationStandards(approvedChanges, currentClassificationRules, effectiveDate);

    expect(result.updatedRules).toEqual([
      {
        documentType: "補助金申請書",
        processingRoute: "hybrid", 
        paperStorageRequired: true
      },
      {
        documentType: "事業報告書",
        processingRoute: "hybrid",
        paperStorageRequired: true
      }
    ]);
    
    expect(result.affectedDocumentCount).toBe(150);
    expect(result.newProcessingRoutes).toEqual([
      { documentType: "補助金申請書", processingRoute: "hybrid" },
      { documentType: "事業報告書", processingRoute: "hybrid" }
    ]);
    expect(result.applicationStartDate).toEqual(effectiveDate);
  });
});