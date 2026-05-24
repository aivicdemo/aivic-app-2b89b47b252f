import { handleEmergencyComplianceUpdate } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("法令改正影響範囲分析で予期しないデータ形式が検出された場合のエラー処理", () => {
    // SCEN-500

    // 正常なデータ形式での実行（基準値確認）
    const validRegulationNotice = "文部科学省令により補助金申請書類の紙保管要件が変更されました。研究費申請書について電子保管を許可します。";
    const validDocumentTypes = ["補助金申請書", "研究費申請書", "物品購入申請書"];
    const validProcessingRoutes = [
      { documentType: "補助金申請書", processingRoute: "hybrid", paperStorageRequired: true },
      { documentType: "研究費申請書", processingRoute: "hybrid", paperStorageRequired: true }
    ];

    const validResult = handleEmergencyComplianceUpdate(
      validRegulationNotice,
      validDocumentTypes,
      validProcessingRoutes
    );

    expect(validResult.affectedDocumentTypes).toEqual(["補助金申請書", "研究費申請書"]);
    expect(validResult.updatedRoutes).toHaveLength(2);
    expect(validResult.notificationTargets).toEqual(["広報課", "財務課", "各学部事務"]);
    expect(validResult.emergencyLevel).toBe("high");

    // 法令改正通知が空の場合
    expect(() => {
      handleEmergencyComplianceUpdate("", validDocumentTypes, validProcessingRoutes);
    }).toThrow("法令改正通知の内容を正しく読み込めませんでした。通知内容を確認してください。");

    // 法令改正通知が解析不可能な内容の場合
    expect(() => {
      handleEmergencyComplianceUpdate("無効な文字列###", validDocumentTypes, validProcessingRoutes);
    }).toThrow("法令改正通知の内容を正しく読み込めませんでした。通知内容を確認してください。");

    // 現在の申請書類種別データが空の場合
    expect(() => {
      handleEmergencyComplianceUpdate(validRegulationNotice, [], validProcessingRoutes);
    }).toThrow("システムエラーにより申請書類の種別情報を取得できませんでした。システム管理者に連絡してください。");

    // 現在の申請書類種別データがnullの場合
    expect(() => {
      handleEmergencyComplianceUpdate(validRegulationNotice, null as any, validProcessingRoutes);
    }).toThrow("システムエラーにより申請書類の種別情報を取得できませんでした。システム管理者に連絡してください。");

    // 影響を受ける申請書類が100件を超える場合の警告
    const manyDocumentTypes = Array.from({ length: 101 }, (_, i) => `申請書類${i + 1}`);
    const comprehensiveRegulationNotice = "文部科学省令により全ての申請書類について補助金関連度の判定基準が変更されました。";
    
    const warningResult = handleEmergencyComplianceUpdate(
      comprehensiveRegulationNotice,
      manyDocumentTypes,
      validProcessingRoutes
    );

    expect(warningResult.affectedDocumentTypes).toHaveLength(101);
    expect(warningResult.emergencyLevel).toBe("critical");

    // 不正な処理ルート設定データの場合
    expect(() => {
      handleEmergencyComplianceUpdate(validRegulationNotice, validDocumentTypes, null as any);
    }).toThrow("システムエラーにより申請書類の種別情報を取得できませんでした。システム管理者に連絡してください。");

    // 部分的に不正なデータが含まれている場合
    const partiallyInvalidDocumentTypes = ["補助金申請書", "", null as any, "研究費申請書"];
    
    const partialResult = handleEmergencyComplianceUpdate(
      validRegulationNotice,
      partiallyInvalidDocumentTypes,
      validProcessingRoutes
    );

    expect(partialResult.affectedDocumentTypes).toEqual(["補助金申請書", "研究費申請書"]);
    expect(partialResult.updatedRoutes).toHaveLength(2);

    // 複合的なエラー条件
    expect(() => {
      handleEmergencyComplianceUpdate("", [], null as any);
    }).toThrow("法令改正通知の内容を正しく読み込めませんでした。通知内容を確認してください。");
  });
});