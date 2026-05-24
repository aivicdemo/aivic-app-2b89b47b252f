import { determineApprovalHierarchy } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("SCEN-426: 申請金額に応じて適切な承認階層が設定される", () => {
    // 申請金額が10万円未満の場合は課長承認
    expect(determineApprovalHierarchy(50000, "一般申請", "総務課")).toEqual({
      approvalLevel: "課長承認",
      approvers: ["総務課課長"],
      estimatedDays: 3,
      requiresPaperApproval: false
    });

    // 申請金額が10万円以上100万円未満の場合は部長承認
    expect(determineApprovalHierarchy(500000, "物品購入", "学務部")).toEqual({
      approvalLevel: "部長承認",
      approvers: ["学務部部長"],
      estimatedDays: 5,
      requiresPaperApproval: false
    });

    // 申請金額が100万円以上の場合は理事承認
    expect(determineApprovalHierarchy(1500000, "設備申請", "研究推進課")).toEqual({
      approvalLevel: "理事承認",
      approvers: ["理事"],
      estimatedDays: 7,
      requiresPaperApproval: false
    });

    // 補助金関連で100万円以上の場合は理事承認＋紙承認必須
    expect(determineApprovalHierarchy(1500000, "補助金申請", "研究推進課")).toEqual({
      approvalLevel: "理事承認",
      approvers: ["理事"],
      estimatedDays: 7,
      requiresPaperApproval: true
    });

    // 補助金関連で100万円未満の場合は部長承認＋紙承認必須
    expect(determineApprovalHierarchy(500000, "補助金申請", "研究推進課")).toEqual({
      approvalLevel: "部長承認",
      approvers: ["研究推進課部長"],
      estimatedDays: 5,
      requiresPaperApproval: true
    });

    // 申請金額が0円以下の場合はエラー
    expect(() => determineApprovalHierarchy(0, "一般申請", "総務課")).toThrow("申請金額は1円以上で入力してください");
    
    // 申請金額が1億円を超える場合は警告メッセージ
    expect(() => determineApprovalHierarchy(150000000, "設備申請", "総務課")).toThrow("高額申請のため、理事会での特別承認が必要になる可能性があります");

    // 所属部署が未入力の場合はエラー
    expect(() => determineApprovalHierarchy(100000, "一般申請", "")).toThrow("承認ルート設定のため、所属部署を入力してください");
  });
});