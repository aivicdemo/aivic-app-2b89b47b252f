import { determineApprovalHierarchy } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("申請金額に応じて適切な承認階層が設定される", () => {
    // SCEN-426

    // 10万円未満 - 課長承認レベル
    const result1 = determineApprovalHierarchy(50000, "一般申請", "総務部");
    expect(result1.approvalLevel).toBe("課長承認");
    expect(result1.approvers).toEqual(["課長"]);
    expect(result1.estimatedDays).toBe(3);
    expect(result1.requiresPaperApproval).toBe(false);

    // 10万円以上100万円未満 - 部長承認レベル
    const result2 = determineApprovalHierarchy(500000, "物品購入", "情報システム課");
    expect(result2.approvalLevel).toBe("部長承認");
    expect(result2.approvers).toEqual(["部長"]);
    expect(result2.estimatedDays).toBe(5);
    expect(result2.requiresPaperApproval).toBe(false);

    // 100万円以上 - 理事承認レベル
    const result3 = determineApprovalHierarchy(2000000, "設備申請", "研究支援課");
    expect(result3.approvalLevel).toBe("理事承認");
    expect(result3.approvers).toEqual(["理事"]);
    expect(result3.estimatedDays).toBe(7);
    expect(result3.requiresPaperApproval).toBe(false);

    // 補助金関連・100万円以上 - 理事承認レベル・紙承認必要
    const result4 = determineApprovalHierarchy(1500000, "補助金申請", "学術振興課");
    expect(result4.approvalLevel).toBe("理事承認");
    expect(result4.approvers).toEqual(["理事"]);
    expect(result4.estimatedDays).toBe(7);
    expect(result4.requiresPaperApproval).toBe(true);

    // 補助金関連・100万円未満でも部長承認以上
    const result5 = determineApprovalHierarchy(800000, "補助金申請", "研究推進課");
    expect(result5.approvalLevel).toBe("部長承認");
    expect(result5.approvers).toEqual(["部長"]);
    expect(result5.estimatedDays).toBe(5);
    expect(result5.requiresPaperApproval).toBe(true);

    // 境界値テスト: 0円（エラー）
    expect(() => determineApprovalHierarchy(0, "一般申請", "総務部")).toThrow("申請金額は1円以上で入力してください");

    // 境界値テスト: 1億円超過（警告だが処理続行）
    const result6 = determineApprovalHierarchy(150000000, "設備申請", "施設課");
    expect(result6.approvalLevel).toBe("理事承認");
    expect(result6.approvers).toEqual(["理事"]);
    expect(result6.estimatedDays).toBe(7);
    expect(result6.requiresPaperApproval).toBe(false);

    // 所属部署未入力エラー
    expect(() => determineApprovalHierarchy(100000, "一般申請", "")).toThrow("承認ルート設定のため、所属部署を入力してください");
  });
});