import { determineApprovalAuthority } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("承認判断処理ルート決定 - 処理ルート決定に失敗した場合、エラー処理が実行される", () => {
    // SCEN-482
    
    // 承認者の職位情報が取得できない場合のエラー処理
    expect(() => 
      determineApprovalAuthority("", 1000000, "補助金申請", "approve")
    ).toThrow("承認者の職位情報を確認できません。システム管理者にお問い合わせください。");
    
    // 申請金額が負の値の場合のエラー処理
    expect(() => 
      determineApprovalAuthority("部長", -500000, "補助金申請", "approve")
    ).toThrow("申請金額に正しい値を入力してください。");
    
    // 申請種別が未選択の場合のエラー処理
    expect(() => 
      determineApprovalAuthority("課長", 1000000, "", "approve")
    ).toThrow("申請種別を選択してください。");
    
    // 正常なケース - 部長権限での補助金申請承認
    const result = determineApprovalAuthority("部長", 5000000, "補助金申請", "approve");
    expect(result.hasAuthority).toBe(true);
    expect(result.processingRoute).toBe("approved");
    expect(result.nextApprover).toBe(null);
    
    // 権限不足でエスカレーションが必要なケース - 課長が高額申請を処理
    const escalationResult = determineApprovalAuthority("課長", 10000000, "補助金申請", "approve");
    expect(escalationResult.hasAuthority).toBe(false);
    expect(escalationResult.processingRoute).toBe("escalate");
    expect(escalationResult.nextApprover).not.toBe(null);
  });
});