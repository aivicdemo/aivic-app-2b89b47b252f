import { updateProcessingRoutesByRegulationChange } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正処理ルート更新 - 影響を受ける文書種別が正しく特定される", () => {
    // SCEN-493
    
    // 文部科学省からの法令改正通知
    const regulationChangeNotice = "補助金申請書および事業報告書の保管方法に関する省令の改正について。令和6年4月1日より、研究費申請書類の電子化保管を推奨し、紙保管要件を緩和する。";
    
    // 現在のシステム文書分類設定
    const currentDocumentClassification = [
      { documentType: "補助金申請書", processingRoute: "hybrid", paperStorageRequired: true },
      { documentType: "事業報告書", processingRoute: "hybrid", paperStorageRequired: true },
      { documentType: "人事申請書", processingRoute: "electronic", paperStorageRequired: false },
      { documentType: "物品購入申請", processingRoute: "electronic", paperStorageRequired: false }
    ];
    
    // 影響を受ける可能性のある文書種別
    const affectedDocumentTypes = ["補助金申請書", "事業報告書", "研究費申請書"];
    
    const result = updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      affectedDocumentTypes
    );
    
    // 構造化ルールの擬似コードに基づく期待値計算
    // affectedTypes = analyzeRegulationImpact(通知) で「補助金申請書」「事業報告書」が特定される
    // 新要件により紙保管が不要になった場合、electronic に変更
    // 補助金申請書: hybrid → electronic (newRequirement.paperStorageRequired = false)
    // 事業報告書: hybrid → electronic (newRequirement.paperStorageRequired = false)
    
    expect(result.updatedRoutes).toEqual([
      { documentType: "補助金申請書", oldRoute: "hybrid", newRoute: "electronic" },
      { documentType: "事業報告書", oldRoute: "hybrid", newRoute: "electronic" }
    ]);
    
    // 通知対象者は影響を受ける文書種別の関係者
    expect(result.notificationTargets).toEqual(
      expect.arrayContaining(["財務課", "研究支援課", "事務局長"])
    );
    
    // 変更履歴の記録確認
    expect(result.changeLog).toEqual(
      expect.objectContaining({
        changeDate: expect.any(Date),
        affectedDocuments: ["補助金申請書", "事業報告書"],
        regulationSource: "文部科学省省令改正"
      })
    );
    
    // 2件の処理ルート変更が発生
    expect(result.updatedRoutes).toHaveLength(2);
  });
});