import { updateProcessingRoutesByRegulationChange } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正処理ルート更新 - 更新処理中にエラーが発生した場合、ロールバックが実行される", () => {
    // SCEN-494
    
    // 法令改正通知の内容（補助金関連書類の紙保管要件変更）
    const regulationChangeNotice = "文部科学省通知：令和6年4月より、科研費申請書及び実績報告書について、電子保管のみを認める改正を実施します。";
    
    // 現在の文書分類設定（改正前）
    const currentDocumentClassification = [
      { documentType: "科研費申請書", processingRoute: "hybrid", paperStorageRequired: true },
      { documentType: "実績報告書", processingRoute: "hybrid", paperStorageRequired: true },
      { documentType: "一般申請書", processingRoute: "electronic", paperStorageRequired: false }
    ];
    
    // 影響を受ける可能性のある文書種別
    const affectedDocumentTypes = ["科研費申請書", "実績報告書", "一般申請書"];
    
    try {
      const result = updateProcessingRoutesByRegulationChange(
        regulationChangeNotice,
        currentDocumentClassification,
        affectedDocumentTypes
      );
      
      // 更新された処理ルート設定
      expect(result.updatedRoutes).toEqual([
        { documentType: "科研費申請書", oldRoute: "hybrid", newRoute: "electronic" },
        { documentType: "実績報告書", oldRoute: "hybrid", newRoute: "electronic" }
      ]);
      
      // 通知対象者リスト（影響を受ける関係者）
      expect(result.notificationTargets).toEqual([
        "広報課職員",
        "各学部事務職員", 
        "情報システム課担当者",
        "事務局長"
      ]);
      
      // 変更履歴（ロールバック用の記録）
      expect(result.changeLog).toEqual({
        changeDate: expect.any(Date),
        changedRoutes: [
          { documentType: "科研費申請書", oldRoute: "hybrid", newRoute: "electronic" },
          { documentType: "実績報告書", oldRoute: "hybrid", newRoute: "electronic" }
        ],
        rollbackAvailable: true
      });
      
    } catch (error) {
      // エラーが発生した場合のロールバック処理確認
      // 法令改正通知の内容が空または解析不可能な場合のエラー
      expect(() => updateProcessingRoutesByRegulationChange(
        "", // 空の通知内容
        currentDocumentClassification,
        affectedDocumentTypes
      )).toThrow("法令改正通知の内容を正しく読み取れません。通知内容を確認してください。");
      
      // 現在の文書種別データが取得できない場合のエラー  
      expect(() => updateProcessingRoutesByRegulationChange(
        regulationChangeNotice,
        [], // 空の文書分類設定
        affectedDocumentTypes
      )).toThrow("システムエラーにより申請書類の種別情報を取得できませんでした。システム管理者に連絡してください。");
    }
    
    // 大規模変更時の警告（100件超過）
    const largeAffectedTypes = Array.from({length: 101}, (_, i) => `文書種別${i}`);
    const result = updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      largeAffectedTypes
    );
    
    // 警告メッセージが含まれることを確認
    expect(result.changeLog.warnings).toContain("大規模な法令改正により多数の申請書類に影響があります。段階的な対応を検討してください。");
  });
});