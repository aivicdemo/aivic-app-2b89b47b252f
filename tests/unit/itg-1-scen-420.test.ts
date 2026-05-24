import { validateApplicationAmountAndPeriod } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("申請金額が予算上限内の場合、正常に処理される", () => {
    // SCEN-420
    const budgetLimits = {
      "補助金申請書": {
        minAmount: 100000,
        maxAmount: 5000000
      }
    };

    // 予算上限内の正常な申請金額をテスト
    const result = validateApplicationAmountAndPeriod(
      3000000, // 申請金額（300万円、上限500万円以内）
      "2024-04-01", // 実施開始予定日
      "2024-12-31", // 実施終了予定日
      "補助金申請書", // 文書種別
      budgetLimits
    );

    const beforeAmount = budgetLimits["補助金申請書"];
    const isAmountValid = 3000000 >= beforeAmount.minAmount && 3000000 <= beforeAmount.maxAmount;
    const startDate = new Date("2024-04-01");
    const endDate = new Date("2024-12-31");
    const today = new Date();
    const isPeriodValid = startDate >= today && endDate > startDate;
    const canProceed = isAmountValid && isPeriodValid;

    expect(result).toEqual({
      isAmountValid: true,
      isPeriodValid: true,
      validationErrors: [],
      canProceed: true
    });
  });
});