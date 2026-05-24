import { checkApprovalStatusViewPermission } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("管理者権限での全案件表示が正常に動作する", () => {
    // SCEN-443

    // 管理者権限での全案件表示
    const result1 = checkApprovalStatusViewPermission(
      "manager001",
      "app123",
      "manager",
      "user001",
      "dept001"
    );
    expect(result1.canView).toBe(true);
    expect(result1.viewLevel).toBe("progress");
    expect(result1.allowedFields).toEqual(["status", "currentApprover"]);

    // 管理者権限（director）での全案件表示
    const result2 = checkApprovalStatusViewPermission(
      "director001",
      "app456",
      "director",
      "user002",
      "dept001"
    );
    expect(result2.canView).toBe(true);
    expect(result2.viewLevel).toBe("progress");
    expect(result2.allowedFields).toEqual(["status", "currentApprover"]);

    // 申請者本人の場合（フル権限）
    const result3 = checkApprovalStatusViewPermission(
      "user001",
      "app789",
      "user",
      "user001",
      "dept001"
    );
    expect(result3.canView).toBe(true);
    expect(result3.viewLevel).toBe("full");
    expect(result3.allowedFields).toEqual(["status", "currentApprover", "history", "comments"]);

    // 異なる部署の管理者（アクセス拒否）
    const result4 = checkApprovalStatusViewPermission(
      "manager002",
      "app999",
      "manager",
      "user003",
      "dept002"
    );
    expect(result4.canView).toBe(false);
    expect(result4.viewLevel).toBe("none");
    expect(result4.allowedFields).toEqual([]);

    // 同一部署の一般職員（基本情報のみ）
    const result5 = checkApprovalStatusViewPermission(
      "staff001",
      "app555",
      "staff",
      "user004",
      "dept001"
    );
    expect(result5.canView).toBe(true);
    expect(result5.viewLevel).toBe("basic");
    expect(result5.allowedFields).toEqual(["status"]);

    // 利用者識別番号が空の場合のエラー
    expect(() => checkApprovalStatusViewPermission(
      "",
      "app123",
      "manager",
      "user001",
      "dept001"
    )).toThrow("利用者の認証情報が確認できません。再度ログインしてください。");

    // 申請書類識別番号が存在しない場合のエラー
    expect(() => checkApprovalStatusViewPermission(
      "manager001",
      "invalid_app",
      "manager",
      "user001",
      "dept001"
    )).toThrow("指定された申請書類が見つかりません。");
  });
});