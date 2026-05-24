import { checkApprovalStatusViewPermission } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("管理者権限での全案件表示が正常に動作する", () => {
    // SCEN-443
    
    // 管理者権限でのアクセステスト
    const result = checkApprovalStatusViewPermission(
      "admin001", 
      "app_20240315_001", 
      "manager", 
      "user002", 
      "dept_general_affairs"
    );
    
    expect(result.canView).toBe(true);
    expect(result.viewLevel).toBe("progress");
    expect(result.allowedFields).toEqual(["status", "currentApprover"]);
    
    // 管理職権限でのアクセステスト
    const managerResult = checkApprovalStatusViewPermission(
      "mgr001",
      "app_20240315_002", 
      "director",
      "user003",
      "dept_general_affairs"
    );
    
    expect(managerResult.canView).toBe(true);
    expect(managerResult.viewLevel).toBe("progress");
    expect(managerResult.allowedFields).toEqual(["status", "currentApprover"]);
    
    // 申請者本人の場合の全詳細表示
    const ownerResult = checkApprovalStatusViewPermission(
      "user004",
      "app_20240315_003",
      "staff", 
      "user004",
      "dept_research"
    );
    
    expect(ownerResult.canView).toBe(true);
    expect(ownerResult.viewLevel).toBe("full");
    expect(ownerResult.allowedFields).toEqual(["status", "currentApprover", "history", "comments"]);
    
    // 同一部署の一般職員の場合
    const sameDepResult = checkApprovalStatusViewPermission(
      "user005",
      "app_20240315_004",
      "staff",
      "user006", 
      "dept_research"
    );
    
    expect(sameDepResult.canView).toBe(true);
    expect(sameDepResult.viewLevel).toBe("basic");
    expect(sameDepResult.allowedFields).toEqual(["status"]);
    
    // 他部署からのアクセス拒否
    const otherDepResult = checkApprovalStatusViewPermission(
      "user007",
      "app_20240315_005", 
      "staff",
      "user008",
      "dept_other"
    );
    
    expect(otherDepResult.canView).toBe(false);
    expect(otherDepResult.viewLevel).toBe("none");
    expect(otherDepResult.allowedFields).toEqual([]);
  });
});