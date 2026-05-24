import { checkApprovalStatusViewPermission } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("管理者権限での全案件表示が正常に動作する", () => {
    // SCEN-443
    
    // 管理者が自分以外の申請案件を確認する場合
    const result = checkApprovalStatusViewPermission(
      "admin001", // userId: 管理者のユーザーID
      "APP20240315001", // applicationId: 他の職員が提出した申請書類ID
      "manager", // userRole: 管理者権限
      "user001", // applicationOwner: 実際の申請者ID
      "dept001" // departmentId: 管理者の所属部署
    );

    // 管理者は同部署内の申請について進捗状況を閲覧可能
    expect(result.canView).toBe(true);
    expect(result.viewLevel).toBe("progress");
    expect(result.allowedFields).toEqual(["status", "currentApprover"]);
  });
});