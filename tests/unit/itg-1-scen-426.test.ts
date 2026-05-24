import { determineApprovalHierarchy } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  // SCEN-426: [normal] 承認ルート自動設定 - 申請金額に応じて適切な承認階層が設定される
  test("申請金額に応じて適切な承認階層（課長承認、部長承認、理事承認等）が自動的に決定され、承認フローが設定される", () => {
    // 10万円未満の場合は課長承認
    expect(determineApprovalHierarchy(50000, "一般申請", "総務部")).toEqual({
      approvalLevel: "課長承認",
      approvers: ["総務部課長"],
      estimatedDays: 3,
      requiresPaperApproval: false
    });

    // 10万円以上100万円未満の場合は部長承認
    expect(determineApprovalHierarchy(500000, "物品購入", "財務部")).toEqual({
      approvalLevel: "部長承認",
      approvers: ["財務部部長"],
      estimatedDays: 5,
      requiresPaperApproval: false
    });

    // 100万円以上の場合は理事承認
    expect(determineApprovalHierarchy(1500000, "設備申請", "研究推進部")).toEqual({
      approvalLevel: "理事承認",
      approvers: ["研究推進部理事"],
      estimatedDays: 7,
      requiresPaperApproval: false
    });

    // 補助金関連で100万円以上の場合は理事承認＋紙承認必要
    expect(determineApprovalHierarchy(1200000, "補助金申請", "研究支援課")).toEqual({
      approvalLevel: "理事承認",
      approvers: ["研究支援課理事"],
      estimatedDays: 7,
      requiresPaperApproval: true
    });

    // 補助金関連で100万円未満の場合は部長承認＋紙承認必要
    expect(determineApprovalHierarchy(800000, "補助金申請", "学術振興部")).toEqual({
      approvalLevel: "部長承認",
      申請金額が1億円を超える場合の警告
    expect(() => determineApprovalHierarchy(120000000, "設備申請", "総務部"))
      .toThrow("高額申請のため、理事会での特別承認が必要になる可能性があります");

    // 申請金額が0円以下の場合のエラー
    expect(() => determineApprovalHierarchy(0, "一般申請", "総務部"))
      .toThrow("申請金額は1円以上で入力してください");

    // 所属部署が未入力の場合のエラー
    expect(() => determineApprovalHierarchy(100000, "一般申請", ""))
      .toThrow("承認ルート設定のため、所属部署を入力してください");
  });
});