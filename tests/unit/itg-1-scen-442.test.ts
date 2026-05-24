import { checkApprovalStatusViewPermission } from '../../src/logic/it-1';

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("権限のない申請について情報が表示されない", () => {
    // SCEN-442
    
    // 他部署の一般職員が他部署の申請を確認しようとする場合（権限なし）
    const result1 = checkApprovalStatusViewPermission(
      "user001",
      "app123",
      "staff",
      "user002",
      "dept001"
    );
    
    expect(result1).toEqual({
      canView: false,
      viewLevel: "none",
      allowedFields: []
    });
    
    // 同じ部署の一般職員が他人の申請を確認する場合（基本情報のみ）
    const result2 = checkApprovalStatusViewPermission(
      "user003",
      "app456",
      "staff",
      "user004",
      "dept002"
    );
    
    expect(result2).toEqual({
      canView: true,
      viewLevel: "basic",
      allowedFields: ["status"]
    });
    
    // 管理者が同じ部署の申請を確認する場合（進捗情報表示）
    const result3 = checkApprovalStatusViewPermission(
      "user005",
      "app789",
      "manager",
      "user006",
      "dept003"
    );
    
    expect(result3).toEqual({
      canView: true,
      viewLevel: "progress",
      allowedFields: ["status", "currentApprover"]
    });
    
    // 申請者本人が自分の申請を確認する場合（全詳細表示）
    const result4 = checkApprovalStatusViewPermission(
      "user007",
      "app012",
      "staff",
      "user007",
      "dept004"
    );
    
    expect(result4).toEqual({
      canView: true,
      viewLevel: "full",
      allowedFields: ["status", "currentApprover", "history", "comments"]
    });
  });
});