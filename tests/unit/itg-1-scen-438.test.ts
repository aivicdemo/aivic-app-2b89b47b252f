import { handleSystemFailureFallback } from '../../src/logic/it-1';

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム障害検知時に紙ベース処理に自動切替される", () => {
    // SCEN-438
    
    // システム障害状態のテスト
    const criticalFailureResult = handleSystemFailureFallback(
      "down",
      "APP-001",
      "manager"
    );
    
    expect(criticalFailureResult.fallbackMethod).toBe("emergency_paper");
    expect(criticalFailureResult.emergencyContactList).toEqual(["all_staff", "management", "it_support"]);
    expect(criticalFailureResult.paperFormUrl).toBe("generated_paper_form_url");
    expect(criticalFailureResult.syncRequired).toBe(true);
    
    // 部分障害状態のテスト
    const partialFailureResult = handleSystemFailureFallback(
      "partial_failure",
      "APP-002",
      "staff"
    );
    
    expect(partialFailureResult.fallbackMethod).toBe("manual_hybrid_mode");
    expect(partialFailureResult.emergencyContactList).toEqual(["relevant_staff", "it_support"]);
    expect(partialFailureResult.paperFormUrl).toBe("generated_paper_form_url");
    expect(partialFailureResult.syncRequired).toBe(true);
    
    // 正常状態のテスト
    const normalResult = handleSystemFailureFallback(
      "running",
      "APP-003",
      "staff"
    );
    
    expect(normalResult.fallbackMethod).toBe("normal");
    expect(normalResult.emergencyContactList).toEqual([]);
    expect(normalResult.paperFormUrl).toBe("");
    expect(normalResult.syncRequired).toBe(false);
    
    // エラーケースのテスト - システム状況不明
    expect(() => {
      handleSystemFailureFallback(
        "unknown",
        "APP-004",
        "staff"
      );
    }).toThrow("システム状況を確認できません。情報システム課に連絡してください。");
    
    // エラーケースのテスト - 申請書類識別番号が存在しない
    expect(() => {
      handleSystemFailureFallback(
        "down",
        "",
        "staff"
      );
    }).toThrow("指定された申請書類が見つかりません。正しい申請番号を入力してください。");
    
    // 警告ケースのテスト - システム障害が長時間継続
    const longFailureResult = handleSystemFailureFallback(
      "down",
      "APP-005",
      "staff"
    );
    
    expect(longFailureResult.fallbackMethod).toBe("emergency_paper");
    expect(longFailureResult.syncRequired).toBe(true);
  });
});