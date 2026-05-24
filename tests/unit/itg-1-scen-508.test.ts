import {
  updateProcessingRoutesByRegulationChange
} from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("文書分類基準更新 - 更新完了後に関係者への通知が送信される", () => {
    // SCEN-508
    const regulationChangeNotice = "文部科学省より通知：補助金申請書類の電子保管に関する要件が改正されました。";
    const currentDocumentClassification = [
      { documentType: "補助金申請書", processingRoute: "electronic" },
      { documentType: "実績報告書", processingRoute: "electronic" },
      { documentType: "収支決算書", processingRoute: "hybrid" }
    ];
    const affectedDocumentTypes = ["補助金申請書", "実績報告書"];

    const result = updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      affectedDocumentTypes
    );

    expect(result.updatedRoutes).toEqual([
      { documentType: "補助金申請書", oldRoute: "electronic", newRoute: "hybrid" },
      { documentType: "実績報告書", oldRoute: "electronic", newRoute: "hybrid" }
    ]);
    expect(result.notificationTargets).toEqual([
      "広報課担当者",
      "事務局長",
      "各部署事務担当者"
    ]);
    expect(result.changeLog).toEqual({
      changeDate: expect.any(Date),
      affectedDocumentTypes: ["補助金申請書", "実績報告書"],
      changeDescription: "法令改正により処理ルートを更新"
    });
  });
});