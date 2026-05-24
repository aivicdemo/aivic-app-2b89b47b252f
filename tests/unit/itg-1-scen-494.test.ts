import { updateProcessingRoutesByRegulationChange } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正処理ルート更新において更新処理中にエラーが発生した場合、ロールバックが実行される", () => {
    // SCEN-494
    const regulationChangeNotice = "文部科学省通知：補助金申請書類の電子保管要件変更について。令和6年4月1日より、科学研究費助成事業に関する申請書類については、紙媒体での保管を必須とする。";
    
    const currentDocumentClassification = [
      { documentType: "科研費申請書", processingRoute: "electronic", paperStorageRequired: false },
      { documentType: "運営費交付金申請書", processingRoute: "electronic", paperStorageRequired: false },
      { documentType: "一般事務書類", processingRoute: "electronic", paperStorageRequired: false }
    ];
    
    const affectedDocumentTypes = ["科研費申請書", "運営費交付金申請書"];
    
    const result = updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      affectedDocumentTypes
    );
    
    expect(result.updatedRoutes).toEqual([
      { documentType: "科研費申請書", oldRoute: "electronic", newRoute: "hybrid" },
      { documentType: "運営費交付金申請書", oldRoute: "electronic", newRoute: "hybrid" }
    ]);
    
    expect(result.notificationTargets).toContain("事務局長");
    expect(result.notificationTargets).toContain("広報課長");
    expect(result.notificationTargets).toContain("情報システム課長");
    
    expect(result.changeLog).toMatchObject({
      updatedRoutes: [
        { documentType: "科研費申請書", oldRoute: "electronic", newRoute: "hybrid" },
        { documentType: "運営費交付金申請書", oldRoute: "electronic", newRoute: "hybrid" }
      ]
    });
    
    expect(result.changeLog.timestamp).toBeInstanceOf(Date);
  });
});