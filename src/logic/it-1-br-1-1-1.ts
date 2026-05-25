export interface ValidationResult {
  isAmountValid: boolean;
  isPeriodValid: boolean;
  validationErrors: string[];
  canProceed: boolean;
}

export function validateApplicationAmount(
  amount: number,
  budgetLimit: number,
  applicationPeriod: string,
  currentDate: string
): ValidationResult {
  const errors: string[] = [];
  let isAmountValid = false;
  let isPeriodValid = false;

  // 金額チェック
  if (amount <= budgetLimit) {
    isAmountValid = true;
  } else {
    errors.push('申請金額が予算上限を超えています');
  }

  // 期間チェック
  const periodStart = new Date(applicationPeriod.split(' - ')[0]);
  const periodEnd = new Date(applicationPeriod.split(' - ')[1]);
  const current = new Date(currentDate);
  
  if (current >= periodStart && current <= periodEnd) {
    isPeriodValid = true;
  } else {
    errors.push('申請期間外です');
  }

  return {
    isAmountValid,
    isPeriodValid,
    validationErrors: errors,
    canProceed: isAmountValid && isPeriodValid
  };
}