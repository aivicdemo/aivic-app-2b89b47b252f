import { setApproverAuthorityLevel } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("承認権限レベル判定 - 権限レベル情報が不正な場合、エラーが発生する", () => {
    // SCEN-479
    
    // 予算金額が負の値のケース
    expect(() => 
      setApproverAuthorityLevel(
        "補助金申請", 
        true, 
        true, 
        "総務課", 
        -1000000
      )
    ).toThrow("予算金額は0以上の値を入力してください");

    // 申請者の所属部署が空のケース  
    expect(() => 
      setApproverAuthorityLevel(
        "補助金申請", 
        true, 
        true, 
        "", 
        5000000
      )
    ).toThrow("申請者の所属部署を選択してください");

    // 正常ケース: 補助金関連で高額案件
    const result1 = setApproverAuthorityLevel("補助金申請", true, true, "総務課", 6000000);
    expect(result1.requiredAuthorityLevel).toBe("department_head");
    expect(result1.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(result1.escalationRequired).toBe(false);

    // 正常ケース: 予算1000万円超でエスカレーション必要
    const result2 = setApproverAuthorityLevel("一般申請", false, false, "学務課", 12000000);
    expect(result2.requiredAuthorityLevel).toBe("department_head");
    expect(result2.approverRoles).toEqual(["department_head"]);
    expect(result2.escalationRequired).toBe(true);

    // 正常ケース: 一般申請で低額
    const result3 = setApproverAuthorityLevel("一般申請", false, false, "財務課", 1000000);
    expect(result3.requiredAuthorityLevel).toBe("section_chief");
    expect(result3.approverRoles).toEqual(["section_chief"]);
    expect(result3.escalationRequired).toBe(false);
  });
});