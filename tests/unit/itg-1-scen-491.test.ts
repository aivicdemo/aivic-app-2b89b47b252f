import { handleEmergencyComplianceUpdate } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("保管方式判定条件が不明な場合、最も安全な方式が選択される", () => {
    // SCEN-491

    // 文部科学省からの法令改正通知（保管方式判定条件が不明瞭）
    const regulationNotice = "文書保管に関する改正について。詳細な判定条件については追って通知予定。";
    
    // 現在システムで管理している申請書類の種別一覧
    const currentDocumentTypes = ["補助金申請書", "研究費申請書", "設備導入申請書", "人事関連書類"];
    
    // 既存の申請書類処理ルート設定
    const existingProcessingRoutes = [
      { documentType: "補助金申請書", processingRoute: "electronic", paperStorageRequired: false },
      { documentType: "研究費申請書", processingRoute: "electronic", paperStorageRequired: false },
      { documentType: "設備導入申請書", processingRoute: "hybrid", paperStorageRequired: true },
      { documentType: "人事関連書類", processingRoute: "electronic", paperStorageRequired: false }
    ];

    const result = handleEmergencyComplianceUpdate(
      regulationNotice,
      currentDocumentTypes,
      existingProcessingRoutes
    );

    // 判定条件が不明な場合、補助金関連書類は最も安全なハイブリッド方式を選択
    expect(result.affectedDocumentTypes).toEqual(["補助金申請書", "研究費申請書", "設備導入申請書"]);
    expect(result.updatedRoutes).toEqual([
      { documentType: "補助金申請書", processingRoute: "hybrid", paperStorageRequired: true },
      { documentType: "研究費申請書", processingRoute: "hybrid", paperStorageRequired: true },
      { documentType: "設備導入申請書", processingRoute: "hybrid", paperStorageRequired: true }
    ]);
    expect(result.notificationTargets).toEqual(["広報課", "事務局", "情報システム課"]);
    expect(result.emergencyLevel).toBe("高");
  });
});