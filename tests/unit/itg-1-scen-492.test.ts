import { updateProcessingRoutesByRegulationChange } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正通知に基づいて処理ルートが正しく更新される", () => {
    // SCEN-492

    const regulationChangeNotice = "文部科学省告示第123号：補助金申請書類および実績報告書について、令和6年4月1日より電子保存に加えて紙媒体での7年間保管を義務付ける";
    
    const currentDocumentClassification = [
      { documentType: "補助金申請書", processingRoute: "electronic", paperStorageRequired: false },
      { documentType: "実績報告書", processingRoute: "electronic", paperStorageRequired: false },
      { documentType: "一般申請書", processingRoute: "electronic", paperStorageRequired: false }
    ];

    const affectedDocumentTypes = ["補助金申請書", "実績報告書"];

    const result = updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      affectedDocumentTypes
    );

    const expectedUpdatedRoutes = [
      { documentType: "補助金申請書", oldRoute: "electronic", newRoute: "hybrid" },
      { documentType: "実績報告書", oldRoute: "electronic", newRoute: "hybrid" }
    ];

    const expectedNotificationTargets = [
      "広報課職員",
      "各学部事務職員",
      "情報システム課職員",
      "事務局長"
    ];

    const expectedChangeLog = {
      changeDate: expect.any(Date),
      affectedDocumentTypes: ["補助金申請書", "実績報告書"],
      regulationSource: "文部科学省告示第123号",
      changeType: "紙保管義務化"
    };

    expect(result.updatedRoutes).toEqual(expectedUpdatedRoutes);
    expect(result.notificationTargets).toEqual(expectedNotificationTargets);
    expect(result.changeLog).toEqual(expectedChangeLog);
  });
});