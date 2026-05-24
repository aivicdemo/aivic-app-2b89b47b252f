import { updateProcessingRoutesByRegulationChange } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正に対応した分類基準が正しく更新される", () => {
    // SCEN-507
    const regulationChangeNotice = "文部科学省令第25号により、補助金関連書類の電子化要件が変更されました。設備購入申請書および研究費申請書は令和5年4月1日より紙保管が必須となります。";
    
    const currentDocumentClassification = [
      { documentType: "設備購入申請書", processingRoute: "electronic", paperStorageRequired: false },
      { documentType: "研究費申請書", processingRoute: "electronic", paperStorageRequired: false },
      { documentType: "一般申請書", processingRoute: "electronic", paperStorageRequired: false }
    ];
    
    const affectedDocumentTypes = ["設備購入申請書", "研究費申請書"];

    const result = updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      affectedDocumentTypes
    );

    expect(result.updatedRoutes).toEqual([
      { documentType: "設備購入申請書", oldRoute: "electronic", newRoute: "hybrid" },
      { documentType: "研究費申請書", oldRoute: "electronic", newRoute: "hybrid" }
    ]);
    
    expect(result.notificationTargets).toEqual(["事務局長", "広報課長", "情報システム課長"]);
    
    expect(result.changeLog).toEqual({
      timestamp: expect.any(Date),
      changedDocuments: 2,
      regulationReference: "文部科学省令第25号"
    });
  });
});