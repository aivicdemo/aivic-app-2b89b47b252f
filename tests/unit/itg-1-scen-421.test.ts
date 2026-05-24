import { validateApplicationAmountAndPeriod } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("申請金額が予算上限を超過した場合、警告メッセージが表示される", () => {
    // SCEN-421
    const budgetLimits = {
      "補助金申請書": {
        minAmount: 100000,
        maxAmount: 5000000
      }
    };

    // 予算上限を超過するケース
    const result = validateApplicationAmountAndPeriod(
      6000000,
      "2024-04-01",
      "2024-12-31",
      "補助金申請書",
      budgetLimits
    );

    expect(result.isAmountValid).toBe(false);
    expect(result.isPeriodValid).toBe(true);
    expect(result.validationErrors).toEqual(["申請金額が規定範囲外です"]);
    expect(result.canProceed).toBe(false);

    // 予算上限の150%を超過する場合は例外発生
    expect(() => validateApplicationAmountAndPeriod(
      7500001,
      "2024-04-01", 
      "2024-12-31",
      "補助金申請書",
      budgetLimits
    )).toThrow("申請金額が大幅に予算上限を超過しています。金額を見直してください");

    // 正常範囲内のケース
    const validResult = validateApplicationAmountAndPeriod(
      3000000,
      "2024-04-01",
      "2024-12-31", 
      "補助金申請書",
      budgetLimits
    );

    expect(validResult.isAmountValid).toBe(true);
    expect(validResult.isPeriodValid).toBe(true);
    expect(validResult.validationErrors).toEqual([]);
    expect(validResult.canProceed).toBe(true);
  });
});