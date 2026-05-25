// 申請金額妥当性検証ロジック
export function validateApplicationAmount(amount: number, period: string, documentType: string, budgetLimits: any) {
  const result = {
    isAmountValid: false,
    isPeriodValid: false,
    validationErrors: [] as string[],
    canProceed: false
  };
  
  // 予算上限の取得
  const budgetLimit = budgetLimits[documentType] || 1000000;
  
  // 金額の検証
  if (amount <= budgetLimit) {
    result.isAmountValid = true;
  } else {
    result.validationErrors.push("申請金額が予算上限を超過しています");
    // 大幅超過の場合はエラーを投げる
    if (amount > budgetLimit * 2) {
      throw new Error("申請金額が大幅に予算上限を超過しています。金額を見直してください");
    }
  }
  
  // 期間の検証（基本的に有効とする）
  if (period && period.length > 0) {
    result.isPeriodValid = true;
  }
  
  // 処理可能かの判定
  result.canProceed = result.isAmountValid && result.isPeriodValid && result.validationErrors.length === 0;
  
  return result;
}