import { checkApprovalStatusViewPermission } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("権限のない申請について情報が表示されない", () => {
    // SCEN-442

    // 他部署の申請者が申請した案件を、権限のない利用者が確認しようとするケース
    const result1 = checkApprovalStatusViewPermission(
      "user123",
      "app456", 
      "staff",
      "applicant789",
      "dept_A"
    );

    expect(result1).toEqual({
      canView: false,
      viewLevel: "none", 
      allowedFields: []
    });

    // 同部署の一般職員が他の職員の申請を確認するケース（閲覧権限あり・基本情報のみ）
    const result2 = checkApprovalStatusViewPermission(
      "user456",
      "app789",
      "staff", 
      "applicant123",
      "dept_B"
    );

    expect(result2).toEqual({
      canView: true,
      viewLevel: "basic",
      allowedFields: ["status"]
    });

    // 管理職が同部署の申請を確認するケース（進捗情報まで閲覧可能）
    const result3 = checkApprovalStatusViewPermission(
      "manager001",
      "app111",
      "manager",
      "staff222", 
      "dept_C"
    );

    expect(result3).toEqual({
      canView: true,
      viewLevel: "progress", 
      allowedFields: ["status", "currentApprover"]
    });

    // 申請者本人が自分の申請を確認するケース（全詳細情報閲覧可能）
    const result4 = checkApprovalStatusViewPermission(
      "applicant999",
      "app999",
      "staff",
      "applicant999",
      "dept_D"
    );

    expect(result4).toEqual({
      canView: true,
      viewLevel: "full",
      allowedFields: ["status", "currentApprover", "history", "comments"]
    });
  });
});