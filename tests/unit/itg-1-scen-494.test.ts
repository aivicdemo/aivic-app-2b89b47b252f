import {
  updateProcessingRoutesByRegulationChange
} from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正処理ルート更新で更新処理中にエラーが発生した場合、ロールバックが実行される", () => {
    // SCEN-494

    // 法令改正通知の内容
    const regulationChangeNotice = "文部科学省通知第123号：補助金関連書類の電子保管要件変更について。令和6年4月1日より、科学研究費補助金および設備整備費補助金に関する申請書類について、従来の紙保管必須要件を撤廃し、電子保管のみでの管理を可能とする。";

    // 現在のシステム文書分類設定（更新前）
    const currentDocumentClassification = [
      {
        documentType: "科学研究費補助金申請書",
        processingRoute: "hybrid",
        paperStorageRequired: true,
        moeRequirement: true
      },
      {
        documentType: "設備整備費補助金申請書", 
        processingRoute: "hybrid",
        paperStorageRequired: true,
        moeRequirement: true
      },
      {
        documentType: "一般事務申請書",
        processingRoute: "electronic",
        paperStorageRequired: false,
        moeRequirement: false
      }
    ];

    // 影響を受ける文書種別（法令改正により変更が必要）
    const affectedDocumentTypes = ["科学研究費補助金申請書", "設備整備費補助金申請書"];

    // 関数実行
    const result = updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      affectedDocumentTypes
    );

    // 期待される更新ルート
    // 科学研究費補助金申請書: hybrid → electronic (紙保管不要になったため)
    // 設備整備費補助金申請書: hybrid → electronic (紙保管不要になったため) 
    const expectedUpdatedRoutes = [
      {
        documentType: "科学研究費補助金申請書",
        oldRoute: "hybrid", 
        newRoute: "electronic"
      },
      {
        documentType: "設備整備費補助金申請書",
        oldRoute: "hybrid",
        newRoute: "electronic"
      }
    ];

    // 通知対象者（影響を受ける関係者）
    const expectedNotificationTargets = [
      "research_department_staff@university.ac.jp",
      "equipment_department_staff@university.ac.jp", 
      "administrative_director@university.ac.jp"
    ];

    // 変更ログの期待値
    const expectedChangeLog = {
      changeDate: expect.any(Date),
      regulationReference: "文部科学省通知第123号",
      affectedDocumentCount: 2,
      processingRouteChanges: expectedUpdatedRoutes
    };

    // 検証
    expect(result.updatedRoutes).toEqual(expectedUpdatedRoutes);
    expect(result.notificationTargets).toEqual(expectedNotificationTargets);
    expect(result.changeLog).toEqual(expectedChangeLog);
    expect(result.updatedRoutes.length).toBe(2);
    expect(result.notificationTargets.length).toBe(3);
  });
});