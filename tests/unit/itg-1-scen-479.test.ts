import { setApproverAuthorityLevel } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("権限レベル情報が不正な場合、エラーが発生する", () => {
    // SCEN-479

    // 予算金額が負の値の場合
    expect(() =>
      setApproverAuthorityLevel("subsidy", true, true, "総務部", -1000000)
    ).toThrow("予算金額は0以上の値を入力してください");

    // 申請者の所属部署が空の場合
    expect(() =>
      setApproverAuthorityLevel("subsidy", true, true, "", 5000000)
    ).toThrow("申請者の所属部署を選択してください");

    // 正常なケースで権限レベルが正しく判定されることも確認
    const result1 = setApproverAuthorityLevel("subsidy", true, true, "総務部", 3000000);
    expect(result1.requiredAuthorityLevel).toBe("department_head");
    expect(result1.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(result1.escalationRequired).toBe(false);

    const result2 = setApproverAuthorityLevel("general", false, false, "経理部", 12000000);
    expect(result2.requiredAuthorityLevel).toBe("department_head");
    expect(result2.approverRoles).toEqual(["department_head"]);
    expect(result2.escalationRequired).toBe(true);

    const result3 = setApproverAuthorityLevel("general", false, false, "人事部", 2000000);
    expect(result3.requiredAuthorityLevel).toBe("section_chief");
    expect(result3.approverRoles).toEqual(["section_chief"]);
    expect(result3.escalationRequired).toBe(false);
  });
});