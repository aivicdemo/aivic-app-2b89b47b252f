import { validateApplicationAmountAndPeriod } from '../../src/logic/it-1-br-2-2-1';

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("申請金額妥当性検証 - 申請金額が予算上限を超過した場合、警告メッセージが表示される", () => {
    // SCEN-421
    const applicationAmount = 150000000; // 予算上限を超過した申請金額
    const implementationStartDate = "2024-04-01";
    const implementationEndDate = "2024-09-30";
    const documentType = "補助金申請書";
    const budgetLimits = {
      "補助金申請書": {
        minAmount: 1000000,
        maxAmount: 100000000
      }
    };

    expect(() => validateApplicationAmountAndPeriod(
      applicationAmount,
      implementationStartDate,
      implementationEndDate,
      documentType,
      budgetLimits
    )).toThrow("申請金額が大幅に予算上限を超過しています。金額を見直してください");
  });
});