export interface ValidationResult {
  isAmountValid: boolean;
  isPeriodValid: boolean;
  validationErrors: string[];
  canProceed: boolean;
}

export interface BudgetLimits {
  [key: string]: number;
}

export function validateApplicationAmount(
  amount: number,
  documentType: string,
  budgetLimits: BudgetLimits
): ValidationResult {
  const errors: string[] = [];
  let isAmountValid = true;
  let isPeriodValid = true;

  const limit = budgetLimits[documentType];
  
  if (limit !== undefined) {
    if (amount > limit * 1.5) {
      // 大幅超過の場合はエラーを投げる
      throw new Error("申請金額が大幅に予算上限を超過しています。金額を見直してください");
    }
    
    if (amount > limit) {
      isAmountValid = false;
      errors.push("申請金額が予算上限を超過しています");
    }
    
    // 予算上限丁度の場合は有効とする
    if (amount === limit) {
      isAmountValid = true;
      isPeriodValid = true;
    }
  }

  return {
    isAmountValid,
    isPeriodValid,
    validationErrors: errors,
    canProceed: isAmountValid && isPeriodValid && errors.length === 0
  };
}