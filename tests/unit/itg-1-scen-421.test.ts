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
      7000000, // 申請金額が予算上限の5,000,000を超過
      "2024-04-01", // 実施開始日
      "2024-12-31", // 実施終了日
      "補助金申請書", // 文書種別
      budgetLimits
    );

    const today = new Date();
    const startDate = new Date("2024-04-01");
    const endDate = new Date("2024-12-31");
    
    // 期待結果の計算
    const budgetLimit = budgetLimits["補助金申請書"];
    const isAmountValid = 7000000 >= budgetLimit.minAmount && 7000000 <= budgetLimit.maxAmount;
    const isPeriodValid = startDate >= today && endDate > startDate;
    
    const validationErrors = [];
    if (!isAmountValid) {
      validationErrors.push("申請金額が規定範囲外です");
    }
    if (!isPeriodValid) {
      validationErrors.push("実施期間が不正です");
    }
    
    const canProceed = isAmountValid && isPeriodValid;

    expect(result).toEqual({
      isAmountValid: false,
      isPeriodValid: isPeriodValid,
      validationErrors: validationErrors,
      canProceed: canProceed
    });

    // 警告メッセージが含まれていることを確認
    expect(result.validationErrors).toContain("申請金額が規定範囲外です");
    expect(result.isAmountValid).toBe(false);
    expect(result.canProceed).toBe(false);
  });
});