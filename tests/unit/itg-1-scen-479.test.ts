import { determineApprovalHierarchy } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("承認権限レベル判定 - 権限レベル情報が不正な場合、エラーが発生する", () => {
    // SCEN-479

    // 申請金額が0円以下の場合
    expect(() => determineApprovalHierarchy(-100000, "補助金申請", "総務課"))
      .toThrow("申請金額は1円以上で入力してください");

    expect(() => determineApprovalHierarchy(0, "物品購入", "経理課"))
      .toThrow("申請金額は1円以上で入力してください");

    // 申請者の所属部署が未入力の場合
    expect(() => determineApprovalHierarchy(500000, "旅費申請", ""))
      .toThrow("承認ルート設定のため、所属部署を入力してください");

    expect(() => determineApprovalHierarchy(1500000, "設備申請", null as any))
      .toThrow("承認ルート設定のため、所属部署を入力してください");

    // 正常ケース: 申請金額が10万円未満の場合は課長承認レベル
    const result1 = determineApprovalHierarchy(50000, "物品購入", "総務課");
    expect(result1).toEqual({
      approvalLevel: "課長承認",
      approvers: ["課長"],
      estimatedDays: 3,
      requiresPaperApproval: false
    });

    // 正常ケース: 申請金額が10万円以上100万円未満の場合は部長承認レベル
    const result2 = determineApprovalHierarchy(500000, "設備申請", "情報システム課");
    expect(result2).toEqual({
      approvalLevel: "部長承認", 
      approvers: ["部長"],
      estimatedDays: 5,
      requiresPaperApproval: false
    });

    // 正常ケース: 申請金額が100万円以上の場合は理事承認レベル
    const result3 = determineApprovalHierarchy(1500000, "研究費申請", "研究推進課");
    expect(result3).toEqual({
      approvalLevel: "理事承認",
      approvers: ["理事"], 
      estimatedDays: 7,
      requiresPaperApproval: false
    });

    // 正常ケース: 補助金関連書類で100万円以上の場合
    const result4 = determineApprovalHierarchy(1200000, "補助金申請", "財務課");
    expect(result4).toEqual({
      approvalLevel: "理事承認",
      approvers: ["理事"],
      estimatedDays: 7, 
      requiresPaperApproval: true
    });

    // 正常ケース: 補助金関連書類で100万円未満の場合
    const result5 = determineApprovalHierarchy(800000, "補助金申請", "研究推進課");
    expect(result5).toEqual({
      approvalLevel: "部長承認",
      approvers: ["部長"],
      estimatedDays: 5,
      requiresPaperApproval: true
    });
  });
});