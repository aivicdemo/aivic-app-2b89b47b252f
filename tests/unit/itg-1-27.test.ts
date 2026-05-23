import { 
  validateApplicationAmountAndPeriod,
  determineApprovalHierarchy,
  determineApprovalAuthority,
  determineApprovalDecision,
  determineNextApprover
} from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("SCEN-420: [normal] 申請金額妥当性検証 - 申請金額が予算上限内の場合、正常に処理される", () => {
    const result = validateApplicationAmountAndPeriod(
      500000,
      "2024-04-01",
      "2024-03-31",
      "補助金申請書",
      { "補助金申請書": { minAmount: 10000, maxAmount: 1000000 } }
    );

    expect(result.isAmountValid).toBe(true);
    expect(result.isPeriodValid).toBe(true);
    expect(result.validationErrors).toEqual([]);
    expect(result.canProceed).toBe(true);
  });

  test("SCEN-421: [error] 申請金額妥当性検証 - 申請金額が予算上限を超過した場合、警告メッセージが表示される", () => {
    const result = validateApplicationAmountAndPeriod(
      1500000,
      "2024-04-01",
      "2024-03-31",
      "補助金申請書",
      { "補助金申請書": { minAmount: 10000, maxAmount: 1000000 } }
    );

    expect(result.isAmountValid).toBe(false);
    expect(result.validationErrors).toContain("申請金額が規定範囲外です");
    expect(result.canProceed).toBe(false);
  });

  test("SCEN-422: [edge] 申請金額妥当性検証 - 申請金額が予算上限丁度の場合、適切に処理される", () => {
    const result = validateApplicationAmountAndPeriod(
      1000000,
      "2024-04-01",
      "2024-03-31",
      "補助金申請書",
      { "補助金申請書": { minAmount: 10000, maxAmount: 1000000 } }
    );

    expect(result.isAmountValid).toBe(true);
    expect(result.isPeriodValid).toBe(true);
    expect(result.validationErrors).toEqual([]);
    expect(result.canProceed).toBe(true);
  });

  test("SCEN-426: [normal] 承認ルート自動設定 - 申請金額に応じて適切な承認階層が設定される", () => {
    const result = determineApprovalHierarchy(
      300000,
      "一般申請",
      "総務部"
    );

    expect(result.approvalLevel).toBe("部長承認");
    expect(result.estimatedDays).toBe(5);
    expect(result.requiresPaperApproval).toBe(false);
  });

  test("SCEN-427: [error] 承認ルート自動設定 - 権限レベルが不明な場合、エラーが発生する", () => {
    expect(() => {
      determineApprovalHierarchy(
        -100000,
        "補助金申請",
        "総務部"
      );
    }).toThrow("申請金額は1円以上で入力してください");
  });

  test("SCEN-428: [edge] 承認ルート自動設定 - 最高額の申請金額の場合、理事承認まで設定される", () => {
    const result = determineApprovalHierarchy(
      50000000,
      "補助金申請",
      "研究推進部"
    );

    expect(result.approvalLevel).toBe("理事承認");
    expect(result.estimatedDays).toBe(7);
    expect(result.requiresPaperApproval).toBe(true);
  });

  test("SCEN-477: [normal] 承認権限レベル判定 - 申請者と申請金額に基づいて適切な権限レベルが判定される", () => {
    const result = determineApprovalAuthority(
      "部長",
      500000,
      "設備購入申請",
      "approve"
    );

    expect(result.hasAuthority).toBe(true);
    expect(result.requiredPosition).toBe("部長");
    expect(result.processingRoute).toBe("approved");
  });

  test("SCEN-478: [normal] 承認権限レベル判定 - 権限不足の承認者の場合、上位承認者に振り分けられる", () => {
    const result = determineApprovalAuthority(
      "課長",
      5000000,
      "補助金申請",
      "approve"
    );

    expect(result.hasAuthority).toBe(false);
    expect(result.processingRoute).toBe("escalate");
    expect(result.nextApprover).not.toBeNull();
  });

  test("SCEN-479: [error] 承認権限レベル判定 - 権限レベル情報が不正な場合、エラーが発生する", () => {
    expect(() => {
      determineApprovalAuthority(
        "",
        500000,
        "一般申請",
        "approve"
      );
    }).toThrow("承認者の職位情報が確認できません。システム管理者にお問い合わせください。");
  });

  test("SCEN-480: [normal] 承認判断処理ルート決定 - 承認結果に基づいて適切な次の処理先が決定される", () => {
    const result = determineApprovalDecision(
      "設備購入申請書の内容です。必要な機器の仕様と予算を詳しく記載しています。",
      [],
      false,
      3
    );

    expect(result.decision).toBe("approve");
    expect(result.reason).toBe("不備なしまたは軽微な不備のみ");
    expect(result.nextAction).toBe("proceed");
  });

  test("SCEN-481: [normal] 承認判断処理ルート決定 - 差戻し時に適切な差戻し先が特定される", () => {
    const result = determineApprovalDecision(
      "申請内容が不明確です。",
      ["予算根拠不明", "仕様書未添付", "承認印なし"],
      true,
      2
    );

    expect(result.decision).toBe("reject");
    expect(result.reason).toBe("補助金関連書類で重要な不備があるため");
    expect(result.nextAction).toBe("resubmit");
  });

  test("SCEN-482: [error] 承認判断処理ルート決定 - 処理ルート決定に失敗した場合、エラー処理が実行される", () => {
    expect(() => {
      determineApprovalDecision(
        "",
        ["重大な不備"],
        false,
        3
      );
    }).toThrow("申請書類の内容が入力されていません。承認判定を行うことができません。");
  });
});