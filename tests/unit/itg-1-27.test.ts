import {
  validateApplicationInput,
  validateApplicationAmountAndPeriod,
  determineApprovalHierarchy,
  determineApprovalAuthority,
  determineApprovalDecision,
  determineNextApprover
} from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("SCEN-420: 申請金額が予算上限内の場合、正常に処理される", () => {
    const budgetLimits = {
      "補助金申請書": { minAmount: 10000, maxAmount: 5000000 }
    };
    
    const result = validateApplicationAmountAndPeriod(
      3000000,
      "2024-04-01",
      "2024-12-31",
      "補助金申請書",
      budgetLimits
    );
    
    expect(result.isAmountValid).toBe(true);
    expect(result.isPeriodValid).toBe(true);
    expect(result.canProceed).toBe(true);
    expect(result.validationErrors).toEqual([]);
  });

  test("SCEN-421: 申請金額が予算上限を超過した場合、警告メッセージが表示される", () => {
    const budgetLimits = {
      "補助金申請書": { minAmount: 10000, maxAmount: 5000000 }
    };
    
    const result = validateApplicationAmountAndPeriod(
      6000000,
      "2024-04-01",
      "2024-12-31",
      "補助金申請書",
      budgetLimits
    );
    
    expect(result.isAmountValid).toBe(false);
    expect(result.canProceed).toBe(false);
    expect(result.validationErrors).toContain("申請金額が規定範囲外です");
  });

  test("SCEN-422: 申請金額が予算上限丁度の場合、適切に処理される", () => {
    const budgetLimits = {
      "補助金申請書": { minAmount: 10000, maxAmount: 5000000 }
    };
    
    const result = validateApplicationAmountAndPeriod(
      5000000,
      "2024-04-01",
      "2024-12-31",
      "補助金申請書",
      budgetLimits
    );
    
    expect(result.isAmountValid).toBe(true);
    expect(result.isPeriodValid).toBe(true);
    expect(result.canProceed).toBe(true);
    expect(result.validationErrors).toEqual([]);
  });

  test("SCEN-426: 申請金額に応じて適切な承認階層が設定される", () => {
    const result = determineApprovalHierarchy(
      500000,
      "補助金申請",
      "財務課"
    );
    
    expect(result.approvalLevel).toBe("部長承認");
    expect(result.estimatedDays).toBe(5);
    expect(result.requiresPaperApproval).toBe(true);
    expect(result.approvers).toBeDefined();
  });

  test("SCEN-427: 権限レベルが不明な場合、エラーが発生する", () => {
    expect(() => {
      determineApprovalAuthority(
        "",
        500000,
        "補助金申請",
        "approve"
      );
    }).toThrow("承認者の職位情報を確認できません。システム管理者にお問い合わせください。");
  });

  test("SCEN-428: 最高額の申請金額の場合、理事承認まで設定される", () => {
    const result = determineApprovalHierarchy(
      2000000,
      "補助金申請",
      "財務課"
    );
    
    expect(result.approvalLevel).toBe("理事承認");
    expect(result.estimatedDays).toBe(7);
    expect(result.requiresPaperApproval).toBe(true);
  });

  test("SCEN-477: 申請者と申請金額に基づいて適切な権限レベルが判定される", () => {
    const result = determineApprovalAuthority(
      "部長",
      800000,
      "補助金申請",
      "approve"
    );
    
    expect(result.hasAuthority).toBe(true);
    expect(result.requiredPosition).toBe("部長");
    expect(result.nextApprover).toBe(null);
    expect(result.processingRoute).toBe("approved");
  });

  test("SCEN-478: 権限不足の承認者の場合、上位承認者に振り分けられる", () => {
    const result = determineApprovalAuthority(
      "課長",
      2000000,
      "補助金申請",
      "approve"
    );
    
    expect(result.hasAuthority).toBe(false);
    expect(result.requiredPosition).toBe("理事");
    expect(result.nextApprover).toBeDefined();
    expect(result.processingRoute).toBe("escalate");
  });

  test("SCEN-479: 権限レベル情報が不正な場合、エラーが発生する", () => {
    expect(() => {
      determineApprovalAuthority(
        "不正な職位",
        -100000,
        "",
        "approve"
      );
    }).toThrow("申請金額に正しい値を入力してください。");
  });

  test("SCEN-480: 承認結果に基づいて適切な次の処理先が決定される", () => {
    const result = determineNextApprover(
      "補助金研究費申請書",
      "科研費による研究設備購入申請",
      "課長",
      "approve"
    );
    
    expect(result.nextApprover).toBeDefined();
    expect(result.processingRoute).toBe("hybrid");
    expect(result.isSubsidyRelated).toBe(true);
    expect(result.requiresPaperStorage).toBe(true);
  });

  test("SCEN-481: 差戻し時に適切な差戻し先が特定される", () => {
    const result = determineApprovalDecision(
      "補助金申請書の内容に不備があります",
      ["必要書類の添付漏れ", "金額の記載ミス", "期間設定の誤り"],
      true,
      4
    );
    
    expect(result.decision).toBe("reject");
    expect(result.reason).toBe("重大な不備が複数あるため");
    expect(result.conditionalRequirements).toEqual([]);
    expect(result.nextAction).toBe("resubmit");
  });

  test("SCEN-482: 処理ルート決定に失敗した場合、エラー処理が実行される", () => {
    expect(() => {
      determineNextApprover(
        "",
        "申請書類の内容",
        "課長",
        "approve"
      );
    }).toThrow("申請書類のタイトルが入力されていません。タイトルを入力してください。");
  });
});