import { checkApprovalStatusViewPermission } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("権限のない申請について情報が表示されない", () => {
    // SCEN-442
    
    // 他部署の職員が異なる部署の申請を閲覧しようとする場合
    const result1 = checkApprovalStatusViewPermission(
      "user123",
      "app456",
      "staff",
      "owner789",
      "dept_A"
    );
    
    expect(result1.canView).toBe(false);
    expect(result1.viewLevel).toBe("none");
    expect(result1.allowedFields).toEqual([]);
    
    // 一般職員が他部署の申請を閲覧しようとする場合
    const result2 = checkApprovalStatusViewPermission(
      "user456",
      "app789",
      "staff",
      "owner123",
      "dept_B"
    );
    
    expect(result2.canView).toBe(false);
    expect(result2.viewLevel).toBe("none");
    expect(result2.allowedFields).toEqual([]);
    
    // 申請者本人による自分の申請閲覧（権限あり）
    const result3 = checkApprovalStatusViewPermission(
      "user789",
      "app123",
      "staff",
      "user789",
      "dept_C"
    );
    
    expect(result3.canView).toBe(true);
    expect(result3.viewLevel).toBe("full");
    expect(result3.allowedFields).toEqual(["status", "currentApprover", "history", "comments"]);
  });
});