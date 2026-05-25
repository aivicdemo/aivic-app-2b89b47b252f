import { checkApprovalStatusViewPermission } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  // SCEN-442: [error] 承認状況表示権限制御 - 権限のない申請について情報が表示されない
  test("権限のない申請について情報が表示されない", () => {
    const userId = "user456";
    const applicationId = "app789";
    const userRole = "staff";
    const applicationOwner = "user123";
    const departmentId = "finance_dept";

    const result = checkApprovalStatusViewPermission(
      userId,
      applicationId,
      userRole,
      applicationOwner,
      departmentId
    );

    expect(result.canView).toBe(false);
    expect(result.viewLevel).toBe("none");
    expect(result.allowedFields).toEqual([]);
  });
});