import { validateApplicationAmountAndPeriod } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("SCEN-420: 申請金額が予算上限内の場合、正常に処理される", () => {
    // 申請金額が予算上限内の正常ケース
    const budgetLimits = {
      "補助金申請書": { minAmount: 100000, maxAmount: 5000000 },
      "設備申請書": { minAmount: 50000, maxAmount: 3000000 }
    };
    
    const result = validateApplicationAmountAndPeriod(
      2000000, // 申請金額（200万円）
      "2024-04-01", // 実施開始日
      "2024-12-31", // 実施終了日
      "補助金申請書",
      budgetLimits
    );
    
    expect(result.isAmountValid).toBe(true);
    expect(result.isPeriodValid).toBe(true);
    expect(result.validationErrors).toEqual([]);
    expect(result.canProceed).toBe(true);
    
    // 境界値テスト - 最小金額
    const minAmountResult = validateApplicationAmountAndPeriod(
      100000, // 最小金額
      "2024-04-01",
      "2024-12-31",
      "補助金申請書",
      budgetLimits
    );
    
    expect(minAmountResult.isAmountValid).toBe(true);
    expect(minAmountResult.canProceed).toBe(true);
    
    // 境界値テスト - 最大金額
    const maxAmountResult = validateApplicationAmountAndPeriod(
      5000000, // 最大金額
      "2024-04-01",
      "2024-12-31",
      "補助金申請書",
      budgetLimits
    );
    
    expect(maxAmountResult.isAmountValid).toBe(true);
    expect(maxAmountResult.canProceed).toBe(true);
    
    // 上限超過ケース
    const overLimitResult = validateApplicationAmountAndPeriod(
      6000000, // 予算上限超過
      "2024-04-01",
      "2024-12-31",
      "補助金申請書",
      budgetLimits
    );
    
    expect(overLimitResult.isAmountValid).toBe(false);
    expect(overLimitResult.validationErrors).toEqual(["申請金額が規定範囲外です"]);
    expect(overLimitResult.canProceed).toBe(false);
    
    // 下限未満ケース
    const underLimitResult = validateApplicationAmountAndPeriod(
      50000, // 予算下限未満
      "2024-04-01",
      "2024-12-31",
      "補助金申請書",
      budgetLimits
    );
    
    expect(underLimitResult.isAmountValid).toBe(false);
    expect(underLimitResult.validationErrors).toEqual(["申請金額が規定範囲外です"]);
    expect(underLimitResult.canProceed).toBe(false);
    
    // エラーケース - 負の申請金額
    expect(() => {
      validateApplicationAmountAndPeriod(
        -100000,
        "2024-04-01",
        "2024-12-31",
        "補助金申請書",
        budgetLimits
      );
    }).toThrow("申請金額は正の数値で入力してください");
  });
});