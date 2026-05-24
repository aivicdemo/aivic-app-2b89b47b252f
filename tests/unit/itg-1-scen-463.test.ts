import { handleSystemFailureFallback } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム障害時承認継続 - 障害復旧後のデータ同期が正常に実行される", () => {
    // SCEN-463
    
    // 正常動作時のケース
    const normalResult = handleSystemFailureFallback(
      "normal", // systemStatus
      "APP-001", // applicationId
      "admin" // userRole
    );
    
    expect(normalResult).toEqual({
      fallbackMethod: "normal",
      emergencyContactList: [],
      paperFormUrl: "",
      syncRequired: false
    });

    // システム障害発生時のケース（重要度高の申請書類）
    const downResult = handleSystemFailureFallback(
      "down", // systemStatus
      "APP-002", // applicationId
      "staff" // userRole
    );
    
    expect(downResult.fallbackMethod).toBe("emergency_paper");
    expect(downResult.syncRequired).toBe(true);
    expect(downResult.emergencyContactList.length).toBeGreaterThan(0);
    expect(downResult.paperFormUrl).toBeTruthy();

    // エラー状態でのケース
    const errorResult = handleSystemFailureFallback(
      "error", // systemStatus
      "APP-003", // applicationId
      "manager" // userRole
    );
    
    expect(errorResult.fallbackMethod).toBe("emergency_paper");
    expect(errorResult.syncRequired).toBe(true);

    // 申請書類が存在しない場合の制約テスト
    expect(() => {
      handleSystemFailureFallback(
        "down",
        "", // 空の申請ID
        "staff"
      );
    }).toThrow("指定された申請書類が見つかりません。正しい申請番号を入力してください。");

    // システム障害が長時間継続している場合の警告テスト
    const longDownResult = handleSystemFailureFallback(
      "down",
      "APP-LONG-DOWN",
      "staff"
    );
    
    // 長時間障害の場合でも同期が必要
    expect(longDownResult.syncRequired).toBe(true);
  });
});