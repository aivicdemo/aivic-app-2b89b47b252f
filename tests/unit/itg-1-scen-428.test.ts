import { determineApprovalHierarchy } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("最高額の申請金額の場合、理事承認まで設定される", () => {
    // SCEN-428
    const result = determineApprovalHierarchy(
      100000000, // 1億円の申請金額
      "補助金申請",
      "研究推進部"
    );

    const expectedApprovers = ["課長", "部長", "理事"];
    
    expect(result.approvalLevel).toBe("理事承認");
    expect(result.approvers).toEqual(expectedApprovers);
    expect(result.estimatedDays).toBe(7);
    expect(result.requiresPaperApproval).toBe(true);
  });
});