import { validateApplicationAmountAndPeriod } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("申請金額妥当性検証 - 申請金額が予算上限を超過した場合、警告メッセージが表示される", () => {
    // SCEN-421

    // 申請金額が予算上限の150%を超えているケース - エラーがスローされる
    const budgetLimits = {
      "補助金申請書": {
        minAmount: 100000,
        maxAmount: 10000000
      }
    };

    expect(() => {
      validateApplicationAmountAndPeriod(
        15000001, // 予算上限の150%超過
        "2024-04-01",
        "2024-12-31",
        "補助金申請書",
        budgetLimits
      );
    }).toThrow("申請金額が大幅に予算上限を超過しています。金額を見直してください");

    // 申請金額が予算上限を超過しているが150%以下のケース
    const result = validateApplicationAmountAndPeriod(
      12000000, // 予算上限超過だが150%以下
      "2024-04-01", 
      "2024-12-31",
      "補助金申請書",
      budgetLimits
    );

    expect(result.isAmountValid).toBe(false);
    expect(result.isPeriodValid).toBe(true);
    expect(result.validationErrors).toEqual(["申請金額が規定範囲外です"]);
    expect(result.canProceed).toBe(false);

    // 申請金額が適正範囲内のケース
    const validResult = validateApplicationAmountAndPeriod(
      5000000, // 適正範囲内
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