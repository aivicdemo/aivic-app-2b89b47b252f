import {
  determineApprovalHierarchy,
  determineApprovalAuthority,
  determineNextApprover
} from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  // SCEN-420: [normal] 申請金額妥当性検証 - 申請金額が予算上限内の場合、正常に処理される
  test("申請金額が予算上限内の場合、正常に処理される", () => {
    const result = determineApprovalHierarchy(500000, "一般申請", "総務課");
    
    expect(result.approvalLevel).toBe("部長承認");
    expect(result.estimatedDays).toBe(5);
    expect(result.requiresPaperApproval).toBe(false);
  });

  // SCEN-421: [error] 申請金額妥当性検証 - 申請金額が予算上限を超過した場合、警告メッセージが表示される
  test("申請金額が予算上限を超過した場合、警告メッセージが表示される", () => {
    expect(() => determineApprovalHierarchy(100000000, "補助金申請", "研究課")).toThrow("高額申請のため、理事会での特別承認が必要になる可能性があります");
  });

  // SCEN-422: [edge] 申請金額妥当性検証 - 申請金額が予算上限丁度の場合、適切に処理される
  test("申請金額が予算上限丁度の場合、適切に処理される", () => {
    const result = determineApprovalHierarchy(1000000, "補助金申請", "研究課");
    
    expect(result.approvalLevel).toBe("理事承認");
    expect(result.estimatedDays).toBe(7);
    expect(result.requiresPaperApproval).toBe(true);
  });

  // SCEN-426: [normal] 承認ルート自動設定 - 申請金額に応じて適切な承認階層が設定される
  test("申請金額に応じて適切な承認階層が設定される", () => {
    const result = determineApprovalHierarchy(50000, "物品購入", "事務課");
    
    expect(result.approvalLevel).toBe("課長承認");
    expect(result.approvers.length).toBeGreaterThan(0);
    expect(result.estimatedDays).toBe(3);
  });

  // SCEN-427: [error] 承認ルート自動設定 - 権限レベルが不明な場合、エラーが発生する
  test("権限レベルが不明な場合、エラーが発生する", () => {
    expect(() => determineApprovalAuthority("不明な職位", 100000, "一般申請", "approve")).toThrow("承認者の職位情報を確認できません。システム管理者にお問い合わせください。");
  });

  // SCEN-428: [edge] 承認ルート自動設定 - 最高額の申請金額の場合、理事承認まで設定される
  test("最高額の申請金額の場合、理事承認まで設定される", () => {
    const result = determineApprovalHierarchy(50000000, "設備申請", "研究課");
    
    expect(result.approvalLevel).toBe("理事承認");
    expect(result.estimatedDays).toBe(7);
    expect(result.approvers).toContain("理事");
  });

  // SCEN-477: [normal] 承認権限レベル判定 - 申請者と申請金額に基づいて適切な権限レベルが判定される
  test("申請者と申請金額に基づいて適切な権限レベルが判定される", () => {
    const result = determineApprovalAuthority("課長", 200000, "物品購入", "approve");
    
    expect(result.hasAuthority).toBe(true);
    expect(result.requiredPosition).toBe("課長");
    expect(result.processingRoute).toBe("approved");
  });

  // SCEN-478: [normal] 承認権限レベル判定 - 権限不足の承認者の場合、上位承認者に振り分けられる
  test("権限不足の承認者の場合、上位承認者に振り分けられる", () => {
    const result = determineApprovalAuthority("係長", 5000000, "補助金申請", "approve");
    
    expect(result.hasAuthority).toBe(false);
    expect(result.nextApprover).not.toBeNull();
    expect(result.processingRoute).toBe("escalate");
  });

  // SCEN-479: [error] 承認権限レベル判定 - 権限レベル情報が不正な場合、エラーが発生する
  test("権限レベル情報が不正な場合、エラーが発生する", () => {
    expect(() => determineApprovalAuthority("", 100000, "一般申請", "approve")).toThrow("承認者の職位情報を確認できません。システム管理者にお問い合わせください。");
  });

  // SCEN-480: [normal] 承認判断処理ルート決定 - 承認結果に基づいて適切な次の処理先が決定される
  test("承認結果に基づいて適切な次の処理先が決定される", () => {
    const result = determineNextApprover("補助金申請書", "研究開発の予算申請", "課長", "approve");
    
    expect(result.nextApprover).toBe("部長");
    expect(result.processingRoute).toBe("hybrid");
    expect(result.isSubsidyRelated).toBe(true);
  });

  // SCEN-481: [normal] 承認判断処理ルート決定 - 差戻し時に適切な差戻し先が特定される
  test("差戻し時に適切な差戻し先が特定される", () => {
    const result = determineNextApprover("一般申請書", "物品購入申請", "部長", "reject");
    
    expect(result.nextApprover).toBe("申請者");
    expect(result.processingRoute).toBe("electronic");
    expect(result.isSubsidyRelated).toBe(false);
  });

  // SCEN-482: [error] 承認判断処理ルート決定 - 処理ルート決定に失敗した場合、エラー処理が実行される
  test("処理ルート決定に失敗した場合、エラー処理が実行される", () => {
    expect(() => determineNextApprover("", "申請内容", "課長", "approve")).toThrow("申請書類のタイトルが入力されていません。タイトルを入力してください。");
  });
});