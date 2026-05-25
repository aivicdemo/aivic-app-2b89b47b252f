import { checkApprovalStatusViewPermission } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("SCEN-441: 承認状況表示権限制御 - 申請者が自身の申請について適切な情報を表示できる", () => {
    // 申請者本人の場合 - 全詳細表示権限
    const result1 = checkApprovalStatusViewPermission(
      "user001",
      "app001",
      "general_staff",
      "user001",
      "dept001"
    );
    expect(result1.canView).toBe(true);
    expect(result1.viewLevel).toBe("full");
    expect(result1.allowedFields).toEqual(["status", "currentApprover", "history", "comments"]);

    // 管理職が同じ部署の申請を確認する場合 - 進捗表示権限
    const result2 = checkApprovalStatusViewPermission(
      "user002",
      "app001",
      "manager",
      "user001",
      "dept001"
    );
    expect(result2.canView).toBe(true);
    expect(result2.viewLevel).toBe("progress");
    expect(result2.allowedFields).toEqual(["status", "currentApprover"]);

    // 同じ部署の一般職員の場合 - 基本情報のみ表示権限
    const result3 = checkApprovalStatusViewPermission(
      "user003",
      "app001",
      "general_staff",
      "user001",
      "dept001"
    );
    expect(result3.canView).toBe(true);
    expect(result3.viewLevel).toBe("basic");
    expect(result3.allowedFields).toEqual(["status"]);

    // 異なる部署の職員の場合 - 閲覧権限なし
    const result4 = checkApprovalStatusViewPermission(
      "user004",
      "app001",
      "general_staff",
      "user001",
      "dept002"
    );
    expect(result4.canView).toBe(false);
    expect(result4.viewLevel).toBe("none");
    expect(result4.allowedFields).toEqual([]);

    // 利用者識別番号が空の場合のエラー
    expect(() => {
      checkApprovalStatusViewPermission(
        "",
        "app001",
        "general_staff",
        "user001",
        "dept001"
      );
    }).toThrow("利用者の認証情報が確認できません。再度ログインしてください。");

    // 申請書類が存在しない場合のエラー
    expect(() => {
      checkApprovalStatusViewPermission(
        "user001",
        "nonexistent",
        "general_staff",
        "user001",
        "dept001"
      );
    }).toThrow("指定された申請書類が見つかりません。");
  });
});