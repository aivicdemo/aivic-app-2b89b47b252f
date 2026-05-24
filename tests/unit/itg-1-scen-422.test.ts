import { validateApplicationAmountAndPeriod } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("申請金額が予算上限丁度の場合、適切に処理される", () => {
    // SCEN-422
    const budgetLimits = {
      "補助金申請": {
        minAmount: 100000,
        maxAmount: 10000000
      }
    };

    const result = validateApplicationAmountAndPeriod(
      10000000,
      "2024-04-01",
      "2024-03-31", 
      "補助金申請",
      budgetLimits
    );

    expect(result.isAmountValid).toBe(true);
    expect(result.isPeriodValid).toBe(false);
    expect(result.validationErrors).toEqual(["実施期間が不正です"]);
    expect(result.canProceed).toBe(false);
  });
});