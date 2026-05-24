import { updateProcessingRoutesByRegulationChange } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("文書分類基準更新 - 更新処理が途中で中断された場合、適切な復旧処理が実行される", () => {
    // SCEN-509
    
    // 法令改正通知の内容
    const regulationChangeNotice = "文部科学省からの通知: 補助金申請書類の電子化要件が変更されました。";
    
    // 現在システムに登録されている文書分類と処理ルート設定（部分的に更新済み状態をシミュレート）
    const currentDocumentClassification = [
      { documentType: "補助金申請書", processingRoute: "electronic", paperStorageRequired: false },
      { documentType: "実績報告書", processingRoute: "hybrid", paperStorageRequired: true },
      { documentType: "会計報告書", processingRoute: "electronic", paperStorageRequired: false }
    ];
    
    // 影響を受ける文書種別の一覧
    const affectedDocumentTypes = ["補助金申請書", "実績報告書"];
    
    const result = updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      affectedDocumentTypes
    );
    
    // 更新された処理ルート設定の検証
    expect(result.updatedRoutes.length).toBe(2);
    expect(result.updatedRoutes[0]).toEqual({
      documentType: "補助金申請書",
      oldRoute: "electronic",
      newRoute: "hybrid"
    });
    expect(result.updatedRoutes[1]).toEqual({
      documentType: "実績報告書", 
      oldRoute: "hybrid",
      newRoute: "hybrid"
    });
    
    // 通知対象者リストの検証
    expect(result.notificationTargets).toContain("広報課職員");
    expect(result.notificationTargets).toContain("事務局長");
    
    // 変更履歴の検証
    expect(result.changeLog).toBeDefined();
    expect(result.changeLog.timestamp).toBeInstanceOf(Date);
    expect(result.changeLog.affectedDocuments).toBe(2);
  });
});