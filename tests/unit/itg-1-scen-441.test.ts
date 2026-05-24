import { checkApprovalStatusViewPermission } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("申請者本人が自身の申請について全詳細情報を閲覧できる", () => {
    // SCEN-441
    const userId = "user123";
    const applicationId = "app456";
    const userRole = "staff";
    const applicationOwner = "user123";
    const departmentId = "dept001";

    const result = checkApprovalStatusViewPermission(
      userId,
      applicationId,
      userRole,
      applicationOwner,
      departmentId
    );

    expect(result).toEqual({
      canView: true,
      viewLevel: "full",
      allowedFields: ["status", "currentApprover", "history", "comments"]
    });
  });
});