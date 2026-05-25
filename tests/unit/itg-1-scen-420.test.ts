import { validateApplicationAmountAndPeriod } from '../../src/logic/it-1-br-2-2-1';

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("申請金額妥当性検証 - 申請金額が予算上限内の場合、正常に処理される", () => {
    // SCEN-420
    const applicationAmount = 8000000;
    const implementationStartDate = "2024-04-01";
    const implementationEndDate = "2024-12-31";
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

    expect(result.isAmountValid).toBe(true);
    expect(result.isPeriodValid).toBe(true);
    expect(result.validationErrors).toEqual([]);
    expect(result.canProceed).toBe(true);
  });
});