import { handleEmergencyComplianceUpdate } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正処理ルート更新において影響を受ける文書種別が正しく特定される", () => {
    // SCEN-493
    const regulationNotice = "補助金関連書類の電子保管要件が改正されました。科研費申請書及び実績報告書について、従来の紙保管に加えて電子データでの長期保存が義務化されます。";
    const currentDocumentTypes = ["補助金申請書", "科研費申請書", "実績報告書", "一般申請書", "人事申請書"];
    const existingProcessingRoutes = [
      { documentType: "補助金申請書", processingRoute: "electronic", paperStorageRequired: false },
      { documentType: "科研費申請書", processingRoute: "electronic", paperStorageRequired: false },
      { documentType: "実績報告書", processingRoute: "paper", paperStorageRequired: true },
      { documentType: "一般申請書", processingRoute: "electronic", paperStorageRequired: false }
    ];

    const result = handleEmergencyComplianceUpdate(
      regulationNotice,
      currentDocumentTypes,
      existingProcessingRoutes
    );

    expect(result.affectedDocumentTypes).toEqual(["補助金申請書", "科研費申請書", "実績報告書"]);
    expect(result.updatedRoutes).toEqual([
      { documentType: "補助金申請書", processingRoute: "hybrid", paperStorageRequired: true },
      { documentType: "科研費申請書", processingRoute: "hybrid", paperStorageRequired: true },
      { documentType: "実績報告書", processingRoute: "hybrid", paperStorageRequired: true }
    ]);
    expect(result.notificationTargets).toContain("広報課");
    expect(result.notificationTargets).toContain("事務局長");
    expect(result.emergencyLevel).toBe("高");
  });
});