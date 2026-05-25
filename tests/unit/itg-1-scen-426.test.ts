import { determineApprovalHierarchy } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("承認ルート自動設定 - 申請金額に応じて適切な承認階層が設定される", () => {
    // SCEN-426

    // 10万円未満の一般申請 - 課長承認
    const lowAmountResult = determineApprovalHierarchy(50000, "一般申請", "総務課");
    expect(lowAmountResult.approvalLevel).toBe("課長承認");
    expect(lowAmountResult.estimatedDays).toBe(3);
    expect(lowAmountResult.requiresPaperApproval).toBe(false);

    // 10万円以上100万円未満の申請 - 部長承認
    const mediumAmountResult = determineApprovalHierarchy(500000, "物品購入", "財務課");
    expect(mediumAmountResult.approvalLevel).toBe("部長承認");
    expect(mediumAmountResult.estimatedDays).toBe(5);
    expect(mediumAmountResult.requiresPaperApproval).toBe(false);

    // 100万円以上の申請 - 理事承認
    const highAmountResult = determineApprovalHierarchy(1500000, "設備申請", "研究支援課");
    expect(highAmountResult.approvalLevel).toBe("理事承認");
    expect(highAmountResult.estimatedDays).toBe(7);
    expect(highAmountResult.requiresPaperApproval).toBe(false);

    // 補助金関連申請（金額に関わらず部長承認以上）
    const subsidyLowAmountResult = determineApprovalHierarchy(50000, "補助金申請", "研究支援課");
    expect(subsidyLowAmountResult.approvalLevel).toBe("部長承認");
    expect(subsidyLowAmountResult.estimatedDays).toBe(5);
    expect(subsidyLowAmountResult.requiresPaperApproval).toBe(true);

    // 補助金関連で100万円以上 - 理事承認
    const subsidyHighAmountResult = determineApprovalHierarchy(1200000, "補助金申請", "研究支援課");
    expect(subsidyHighAmountResult.approvalLevel).toBe("理事承認");
    expect(subsidyHighAmountResult.estimatedDays).toBe(7);
    expect(subsidyHighAmountResult.requiresPaperApproval).toBe(true);

    // 申請金額0円以下のエラーケース
    expect(() => determineApprovalHierarchy(0, "一般申請", "総務課"))
      .toThrow("申請金額は1円以上で入力してください");

    // 1億円超過の警告ケース（実行は可能だが警告が発生）
    const veryHighAmountResult = determineApprovalHierarchy(150000000, "設備申請", "財務課");
    expect(veryHighAmountResult.approvalLevel).toBe("理事承認");
    expect(veryHighAmountResult.estimatedDays).toBe(7);

    // 所属部署未入力のエラーケース
    expect(() => determineApprovalHierarchy(100000, "一般申請", ""))
      .toThrow("承認ルート設定のため、所属部署を入力してください");
  });
});