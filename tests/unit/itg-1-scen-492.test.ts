import { updateProcessingRoutesByRegulationChange } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正通知に基づいて処理ルートが正しく更新される", () => {
    // SCEN-492
    const regulationChangeNotice = "文部科学省からの法令改正通知により、補助金申請書類の保管要件が変更されました。補助金関連の設備費申請については紙保管が必須となります。";
    const currentDocumentClassification = [
      { documentType: "設備費申請", processingRoute: "electronic", paperRequired: false },
      { documentType: "一般事務申請", processingRoute: "electronic", paperRequired: false },
      { documentType: "人事申請", processingRoute: "electronic", paperRequired: false }
    ];
    const affectedDocumentTypes = ["設備費申請"];

    const result = updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      affectedDocumentTypes
    );

    expect(result.updatedRoutes).toEqual([
      { documentType: "設備費申請", oldRoute: "electronic", newRoute: "hybrid" }
    ]);
    expect(result.notificationTargets).toEqual(["関係部署担当者", "システム管理者"]);
    expect(result.changeLog).toEqual({
      timestamp: expect.any(Date),
      changes: [{ documentType: "設備費申請", oldRoute: "electronic", newRoute: "hybrid" }],
      regulation: regulationChangeNotice
    });
  });
});