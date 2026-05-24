import { checkApprovalStatusViewPermission } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("申請者が自身の申請について適切な情報を表示できる", () => {
    // SCEN-441

    // 申請者本人が自分の申請を確認する場合
    const ownerResult = checkApprovalStatusViewPermission(
      "user001",
      "app001", 
      "staff",
      "user001",
      "dept001"
    );

    expect(ownerResult.canView).toBe(true);
    expect(ownerResult.viewLevel).toBe("full");
    expect(ownerResult.allowedFields).toEqual(["status", "currentApprover", "history", "comments"]);

    // 同じ部署の管理職が部署の申請を確認する場合
    const managerResult = checkApprovalStatusViewPermission(
      "user002",
      "app001",
      "manager", 
      "user001",
      "dept001"
    );

    expect(managerResult.canView).toBe(true);
    expect(managerResult.viewLevel).toBe("progress");
    expect(managerResult.allowedFields).toEqual(["status", "currentApprover"]);

    // 同じ部署の一般職員が他人の申請を確認する場合
    const colleagueResult = checkApprovalStatusViewPermission(
      "user003",
      "app001",
      "staff",
      "user001", 
      "dept001"
    );

    expect(colleagueResult.canView).toBe(true);
    expect(colleagueResult.viewLevel).toBe("basic");
    expect(colleagueResult.allowedFields).toEqual(["status"]);

    // 他部署の職員が申請を確認しようとする場合
    const otherDeptResult = checkApprovalStatusViewPermission(
      "user004",
      "app001",
      "staff",
      "user001",
      "dept002"
    );

    expect(otherDeptResult.canView).toBe(false);
    expect(otherDeptResult.viewLevel).toBe("none");
    expect(otherDeptResult.allowedFields).toEqual([]);

    // 利用者の識別番号が空の場合のエラー
    expect(() => {
      checkApprovalStatusViewPermission(
        "",
        "app001",
        "staff",
        "user001",
        "dept001"
      );
    }).toThrow("利用者の認証情報が確認できません。再度ログインしてください。");

    // 申請書類の識別番号が存在しない場合のエラー
    expect(() => {
      checkApprovalStatusViewPermission(
        "user001",
        "nonexistent",
        "staff",
        "user001",
        "dept001"
      );
    }).toThrow("指定された申請書類が見つかりません。");
  });
});