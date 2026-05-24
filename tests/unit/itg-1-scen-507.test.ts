import { updateProcessingRoutesByRegulationChange } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正に対応した分類基準が正しく更新される", () => {
    // SCEN-507
    const regulationChangeNotice = "文部科学省令第123号により、補助金申請書の電子保管について新たな要件を定める。設備購入申請書については紙保管を必須とし、研究費申請書については電子保管を可能とする。";
    
    const currentDocumentClassification = [
      { documentType: "設備購入申請書", processingRoute: "electronic", paperStorageRequired: false },
      { documentType: "研究費申請書", processingRoute: "hybrid", paperStorageRequired: true },
      { documentType: "人事申請書", processingRoute: "electronic", paperStorageRequired: false }
    ];

    const affectedDocumentTypes = ["設備購入申請書", "研究費申請書"];

    const result = updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      affectedDocumentTypes
    );

    // 設備購入申請書は電子のみからハイブリッドに変更
    const equipmentUpdate = result.updatedRoutes.find(route => route.documentType === "設備購入申請書");
    expect(equipmentUpdate.oldRoute).toBe("electronic");
    expect(equipmentUpdate.newRoute).toBe("hybrid");

    // 研究費申請書はハイブリッドから電子のみに変更
    const researchUpdate = result.updatedRoutes.find(route => route.documentType === "研究費申請書");
    expect(researchUpdate.oldRoute).toBe("hybrid");
    expect(researchUpdate.newRoute).toBe("electronic");

    // 影響のない人事申請書は更新対象に含まれない
    expect(result.updatedRoutes.some(route => route.documentType === "人事申請書")).toBe(false);

    // 通知対象者が設定される
    expect(result.notificationTargets).toContain("文書管理担当者");
    expect(result.notificationTargets).toContain("事務局長");

    // 変更ログが作成される
    expect(result.changeLog.changedDocumentTypes).toEqual(["設備購入申請書", "研究費申請書"]);
    expect(result.changeLog.changeDate).toBeDefined();
    expect(result.changeLog.regulationReference).toBe("文部科学省令第123号");

    // 更新件数の確認
    expect(result.updatedRoutes).toHaveLength(2);
  });
});