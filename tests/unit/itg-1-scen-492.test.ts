import { updateProcessingRoutesByRegulationChange } from '../../src/logic/it-1-br-1779263788059-2-2-1';

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正通知に基づいて処理ルートが正しく更新される", () => {
    // SCEN-492
    const regulationChangeNotice = "令和6年度より科学研究費助成事業の実績報告書及び収支決算書については、電子提出に加えて紙媒体での保管を必須とする改正が行われます。";
    const currentDocumentClassification = [
      {
        documentType: "科研費申請書",
        processingRoute: "electronic",
        paperStorageRequired: false
      },
      {
        documentType: "実績報告書", 
        processingRoute: "electronic",
        paperStorageRequired: false
      },
      {
        documentType: "収支決算書",
        processingRoute: "electronic", 
        paperStorageRequired: false
      },
      {
        documentType: "一般申請書",
        processingRoute: "electronic",
        paperStorageRequired: false
      }
    ];
    const affectedDocumentTypes = ["実績報告書", "収支決算書"];

    const result = updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      affectedDocumentTypes
    );

    expect(result.updatedRoutes).toEqual([
      {
        documentType: "実績報告書",
        oldRoute: "electronic", 
        newRoute: "hybrid"
      },
      {
        documentType: "収支決算書",
        oldRoute: "electronic",
        newRoute: "hybrid" 
      }
    ]);
    expect(result.notificationTargets).toEqual(["財務課", "研究推進課", "事務局長"]);
    expect(result.changeLog).toEqual({
      updatedRoutes: result.updatedRoutes,
      changeDate: expect.any(Date)
    });
  });
});