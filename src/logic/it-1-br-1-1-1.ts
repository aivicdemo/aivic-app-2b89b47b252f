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
  
  // 金額チェック
  const isAmountValid = amount <= budgetLimit;
  if (!isAmountValid) {
    errors.push('申請金額が予算上限を超えています');
  }
  
  // 期間チェック
  const isPeriodValid = isValidApplicationPeriod(applicationPeriod, currentDate);
  if (!isPeriodValid) {
    errors.push('申請期間が無効です');
  }
  
  return {
    isAmountValid,
    isPeriodValid,
    validationErrors: errors,
    canProceed: isAmountValid && isPeriodValid
  };
}

function isValidApplicationPeriod(applicationPeriod: string, currentDate: string): boolean {
  // 申請期間の形式: "2024-01-01 to 2024-12-31"
  const [startDate, endDate] = applicationPeriod.split(' to ');
  const current = new Date(currentDate);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return current >= start && current <= end;
}