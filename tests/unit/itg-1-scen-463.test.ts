import { handleSystemFailureFallback } from '../../src/logic/it-1';

describe('承認フローの進捗状況と滞留期間をリアルタイムで可視化する', () => {
  test('システム障害時承認継続 - 障害復旧後のデータ同期が正常に実行される', () => {
    // SCEN-463
    
    // 正常稼働状態のテスト
    const normalSystemResult = handleSystemFailureFallback(
      "normal",
      "APP-2024-001", 
      "staff",
      "normal"
    );
    
    expect(normalSystemResult).toEqual({
      fallbackMethod: "normal",
      emergencyContactList: [],
      paperFormUrl: "",
      syncRequired: false
    });
    
    // システムダウン状態で緊急申請のテスト
    const criticalFailureResult = handleSystemFailureFallback(
      "down",
      "APP-2024-002",
      "staff", 
      "subsidy"
    );
    
    expect(criticalFailureResult.fallbackMethod).toBe("emergency_paper");
    expect(criticalFailureResult.syncRequired).toBe(true);
    expect(criticalFailureResult.emergencyContactList.length).toBeGreaterThan(0);
    expect(criticalFailureResult.paperFormUrl).toContain("APP-2024-002");
    
    // システムエラー状態で高優先度申請のテスト
    const errorStateResult = handleSystemFailureFallback(
      "error",
      "APP-2024-003",
      "manager",
      "high"
    );
    
    expect(errorStateResult.fallbackMethod).toBe("emergency_paper");
    expect(errorStateResult.syncRequired).toBe(true);
    
    // システムダウン状態で通常申請のテスト
    const normalPriorityResult = handleSystemFailureFallback(
      "down", 
      "APP-2024-004",
      "staff",
      "standard"
    );
    
    expect(normalPriorityResult.fallbackMethod).toBe("wait_recovery");
    expect(normalPriorityResult.syncRequired).toBe(true);
    
    // 存在しない申請IDでのエラーテスト
    expect(() => {
      handleSystemFailureFallback(
        "down",
        "",
        "staff", 
        "normal"
      );
    }).toThrow("指定された申請書類が見つかりません。正しい申請番号を入力してください。");
  });
});