import { checkApprovalStatusViewPermission } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  // SCEN-441
  test("承認状況表示権限制御 - 申請者が自身の申請について適切な情報を表示できる", () => {
    // 申請者本人が自分の申請を確認する場合
    const result1 = checkApprovalStatusViewPermission(
      "user001",
      "app123",
      "general_user",
      "user001",
      "dept001"
    );
    expect(result1).toEqual({
      canView: true,
      viewLevel: "full",
      allowedFields: ["status", "currentApprover", "history", "comments"]
    });

    // 管理職が同じ部署の申請を確認する場合
    const result2 = checkApprovalStatusViewPermission(
      "user002",
      "app123",
      "manager",
      "user001",
      "dept001"
    );
    expect(result2).toEqual({
      canView: true,
      viewLevel: "progress",
      allowedFields: ["status", "currentApprover"]
    });

    // 一般職員が同じ部署の申請を確認する場合
    const result3 = checkApprovalStatusViewPermission(
      "user003",
      "app123",
      "general_user",
      "user001",
      "dept001"
    );
    expect(result3).toEqual({
      canView: true,
      viewLevel: "basic",
      allowedFields: ["status"]
    });

    // 他部署の職員が申請を確認しようとする場合
    const result4 = checkApprovalStatusViewPermission(
      "user004",
      "app123",
      "general_user",
      "user001",
      "dept002"
    );
    expect(result4).toEqual({
      canView: false,
      viewLevel: "none",
      allowedFields: []
    });

    // 利用者識別番号が空の場合
    expect(() => {
      checkApprovalStatusViewPermission(
        "",
        "app123",
        "general_user",
        "user001",
        "dept001"
      );
    }).toThrow("利用者の認証情報が確認できません。再度ログインしてください。");

    // 申請書類が存在しない場合
    expect(() => {
      checkApprovalStatusViewPermission(
        "user001",
        "invalid_app",
        "general_user",
        "user001",
        "dept001"
      );
    }).toThrow("指定された申請書類が見つかりません。");
  });
});