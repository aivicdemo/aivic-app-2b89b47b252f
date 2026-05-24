import { validateApplicationAmountAndPeriod } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("申請金額が予算上限丁度の場合、適切に処理される", () => {
    // SCEN-422
    
    // 申請金額が予算上限丁度（1000万円）の場合
    const applicationAmount = 10000000;
    const implementationStartDate = "2024-04-01";
    const implementationEndDate = "2024-06-30";
    const documentType = "補助金申請書";
    const budgetLimits = {
      "補助金申請書": {
        minAmount: 1000000,
        maxAmount: 10000000
      }
    };

    const result = validateApplicationAmountAndPeriod(
      applicationAmount,
      implementationStartDate,
      implementationEndDate,
      documentType,
      budgetLimits
    );

    // 申請金額が上限と一致するため、isAmountValidはtrue
    // 実施期間が適切なため、isPeriodValidはtrue
    // 両方が適切なため、canProceedはtrue
    expect(result.isAmountValid).toBe(true);
    expect(result.isPeriodValid).toBe(true);
    expect(result.validationErrors).toEqual([]);
    expect(result.canProceed).toBe(true);

    // 申請金額が上限を超過している場合
    const resultExceed = validateApplicationAmountAndPeriod(
      10000001,
      implementationStartDate,
      implementationEndDate,
      documentType,
      budgetLimits
    );

    expect(resultExceed.isAmountValid).toBe(false);
    expect(resultExceed.validationErrors).toEqual(["申請金額が規定範囲外です"]);
    expect(resultExceed.canProceed).toBe(false);

    // 申請金額が下限を下回る場合
    const resultBelow = validateApplicationAmountAndPeriod(
      999999,
      implementationStartDate,
      implementationEndDate,
      documentType,
      budgetLimits
    );

    expect(resultBelow.isAmountValid).toBe(false);
    expect(resultBelow.validationErrors).toEqual(["申請金額が規定範囲外です"]);
    expect(resultBelow.canProceed).toBe(false);
  });
});