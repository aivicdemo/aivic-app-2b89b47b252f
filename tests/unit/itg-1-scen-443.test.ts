import { checkApprovalStatusViewPermission } from '../../src/logic/it-1';

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("管理者権限での全案件表示が正常に動作する", () => {
    // SCEN-443
    
    // 管理者権限の利用者が別部署の申請案件を確認する場合
    const result = checkApprovalStatusViewPermission(
      "admin001",
      "APP202401015", 
      "director",
      "user789",
      "finance_dept"
    );

    expect(result).toEqual({
      canView: true,
      viewLevel: "progress",
      allowedFields: ["status", "currentApprover"]
    });
  });
});