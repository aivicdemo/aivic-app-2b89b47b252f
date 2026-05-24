import { determineApprovalHierarchy } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  // SCEN-428
  test("最高額の申請金額の場合、理事承認まで設定される", () => {
    const applicationAmount = 100000000;
    const documentType = "補助金申請";
    const applicantDepartment = "研究推進部";

    const result = determineApprovalHierarchy(applicationAmount, documentType, applicantDepartment);

    expect(result.approvalLevel).toBe("理事承認");
    expect(result.estimatedDays).toBe(7);
    expect(result.requiresPaperApproval).toBe(true);
    expect(result.approvers).toContain("理事");
  });
});