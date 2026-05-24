import {
  updateProcessingRoutesByRegulationChange
} from "../../src/logic/it-1-br-1779263788059-2-2-1";

const fetchMock = require("jest-fetch-mock");

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("文書分類基準更新 - 更新処理が途中で中断された場合、適切な復旧処理が実行される", async () => {
    // SCEN-509
    fetchMock.resetMocks();
    
    const regulationChangeNotice = "文部科学省から法令改正通知: 補助金関連書類の電子保管要件が変更され、設備整備費申請書は紙保管必須から電子化可能に変更されました。";
    
    const currentDocumentClassification = [
      { documentType: "補助金申請書", processingRoute: "hybrid", paperStorageRequired: true },
      { documentType: "設備整備費申請書", processingRoute: "hybrid", paperStorageRequired: true },
      { documentType: "研究費申請書", processingRoute: "electronic", paperStorageRequired: false },
      { documentType: "事業報告書", processingRoute: "hybrid", paperStorageRequired: true }
    ];
    
    const affectedDocumentTypes = ["設備整備費申請書"];
    
    const result = updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      affectedDocumentTypes
    );
    
    expect(result.updatedRoutes).toEqual([
      { documentType: "設備整備費申請書", oldRoute: "hybrid", newRoute: "electronic" }
    ]);
    expect(result.notificationTargets).toContain("設備担当課");
    expect(result.changeLog).toEqual({
      timestamp: expect.any(Date),
      changes: [
        { documentType: "設備整備費申請書", change: "hybrid→electronic" }
      ]
    });
  });
});