import {
  validateApplicationAmountAndPeriod
} from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("申請金額が予算上限内の場合、正常に処理される", () => {
    // SCEN-420
    
    // 予算上限内の正常な申請金額
    const applicationAmount = 800000;
    const implementationStartDate = "2024-04-01";
    const implementationEndDate = "2024-09-30";
    const documentType = "補助金申請書";
    const budgetLimits = {
      "補助金申請書": { minAmount: 100000, maxAmount: 1000000 }
    };

    const result = validateApplicationAmountAndPeriod(
      applicationAmount,
      implementationStartDate,
      implementationEndDate,
      documentType,
      budgetLimits
    );

    // 予算上限内なので金額は有効
    expect(result.isAmountValid).toBe(true);
    // 開始日が現在より後、終了日が開始日より後なので期間は有効
    expect(result.isPeriodValid).toBe(true);
    // エラーがないので空配列
    expect(result.validationErrors).toEqual([]);
    // 金額・期間ともに有効なので次ステップに進める
    expect(result.canProceed).toBe(true);

    // 境界値テスト - 最小額
    const minAmountResult = validateApplicationAmountAndPeriod(
      100000,
      implementationStartDate,
      implementationEndDate,
      documentType,
      budgetLimits
    );
    expect(minAmountResult.isAmountValid).toBe(true);
    expect(minAmountResult.canProceed).toBe(true);

    // 境界値テスト - 最大額
    const maxAmountResult = validateApplicationAmountAndPeriod(
      1000000,
      implementationStartDate,
      implementationEndDate,
      documentType,
      budgetLimits
    );
    expect(maxAmountResult.isAmountValid).toBe(true);
    expect(maxAmountResult.canProceed).toBe(true);

    // 予算上限超過の場合
    expect(() => validateApplicationAmountAndPeriod(
      1200000,
      implementationStartDate,
      implementationEndDate,
      documentType,
      budgetLimits
    )).toThrow("申請金額が規定範囲外です");

    // 0以下の金額の場合
    expect(() => validateApplicationAmountAndPeriod(
      -100000,
      implementationStartDate,
      implementationEndDate,
      documentType,
      budgetLimits
    )).toThrow("申請金額は正の数値で入力してください");

    // 無効な日付形式の場合
    expect(() => validateApplicationAmountAndPeriod(
      500000,
      "invalid-date",
      implementationEndDate,
      documentType,
      budgetLimits
    )).toThrow("実施期間は有効な日付形式で入力してください");
  });
});