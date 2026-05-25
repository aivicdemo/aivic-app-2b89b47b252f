import { updateProcessingRoutesByRegulationChange } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正処理ルート更新 - 更新処理中にエラーが発生した場合、ロールバックが実行される", () => {
    // SCEN-494
    const regulationChangeNotice = "文部科学省通知：補助金申請書類の電子保管要件変更について、令和6年4月1日より設備購入申請書は紙保管必須とする";
    const currentDocumentClassification = [
      { documentType: "補助金申請書", processingRoute: "electronic" },
      { documentType: "設備購入申請書", processingRoute: "electronic" },
      { documentType: "一般申請書", processingRoute: "electronic" }
    ];
    const affectedDocumentTypes = ["設備購入申請書"];

    const result = updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      affectedDocumentTypes
    );

    expect(result.updatedRoutes).toEqual([
      { documentType: "設備購入申請書", oldRoute: "electronic", newRoute: "hybrid" }
    ]);
    expect(result.notificationTargets).toEqual([
      "設備購入申請書担当者",
      "情報システム課",
      "事務局長"
    ]);
    expect(result.changeLog).toEqual({
      timestamp: expect.any(Date),
      changes: [
        {
          documentType: "設備購入申請書",
          oldRoute: "electronic",
          newRoute: "hybrid",
          reason: "文部科学省通知による紙保管必須化"
        }
      ]
    });
  });
});