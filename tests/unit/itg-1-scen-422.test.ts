import { validateApplicationAmountAndPeriod } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("申請金額が予算上限丁度の場合、適切に処理される", () => {
    // SCEN-422
    
    // 申請金額が予算上限丁度（maxAmount = 10000000）の場合
    const result = validateApplicationAmountAndPeriod(
      10000000, // 予算上限丁度の金額
      "2024-04-01", // 実施開始日
      "2024-12-31", // 実施終了日
      "補助金申請書", // 文書種別
      {
        "補助金申請書": {
          minAmount: 100000,
          maxAmount: 10000000
        }
      } // 予算上限設定
    );

    // 予算上限丁度なので金額は妥当
    expect(result.isAmountValid).toBe(true);
    // 実施期間は適切
    expect(result.isPeriodValid).toBe(true);
    // エラーなし
    expect(result.validationErrors).toEqual([]);
    // 次のステップに進行可能
    expect(result.canProceed).toBe(true);
  });
});