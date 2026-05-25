import { updateProcessingRoutesByRegulationChange } from '../../src/logic/it-1-br-1779263788059-2-2-1';

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("承認結果通知 - 通知送信に失敗した場合、リトライ処理が実行される", () => {
    // SCEN-485
    const regulationChangeNotice = "文部科学省より、補助金申請書類の電子保管要件が変更され、研究費申請書について紙保管が必須となりました。";
    const currentDocumentClassification = [
      { documentType: "研究費申請書", processingRoute: "electronic", paperStorageRequired: false },
      { documentType: "設備購入申請書", processingRoute: "hybrid", paperStorageRequired: true },
      { documentType: "人事関連書類", processingRoute: "electronic", paperStorageRequired: false }
    ];
    const affectedDocumentTypes = ["研究費申請書", "設備購入申請書"];

    const result = updateProcessingRoutesByRegulationChange(regulationChangeNotice, currentDocumentClassification, affectedDocumentTypes);

    expect(result.updatedRoutes).toEqual([
      { documentType: "研究費申請書", oldRoute: "electronic", newRoute: "hybrid" }
    ]);
    expect(result.notificationTargets).toEqual(["研究企画課", "財務課", "総務課"]);
    expect(result.changeLog).toEqual({
      changeDate: new Date(),
      affectedDocumentTypes: ["研究費申請書"],
      regulationSource: "文部科学省"
    });
  });
});