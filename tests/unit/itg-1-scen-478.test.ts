import { setApproverAuthorityLevel } from '../../src/logic/it-1-br-2-2-1';

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  // SCEN-478
  test("承認権限レベル判定 - 権限不足の承認者の場合、上位承認者に振り分けられる", () => {
    // 一般申請・権限不足の場合
    const result1 = setApproverAuthorityLevel(
      "一般申請", 
      false, 
      false, 
      "総務課", 
      1000000
    );
    expect(result1.requiredAuthorityLevel).toBe("section_chief");
    expect(result1.approverRoles).toEqual(["section_chief"]);
    expect(result1.escalationRequired).toBe(false);

    // 補助金関連・高額案件の場合
    const result2 = setApproverAuthorityLevel(
      "補助金申請", 
      true, 
      false, 
      "研究支援課", 
      6000000
    );
    expect(result2.requiredAuthorityLevel).toBe("department_head");
    expect(result2.approverRoles).toEqual(["department_head"]);
    expect(result2.escalationRequired).toBe(false);

    // 紙保管必要・補助金関連の場合
    const result3 = setApproverAuthorityLevel(
      "補助金申請", 
      true, 
      true, 
      "財務課", 
      8000000
    );
    expect(result3.requiredAuthorityLevel).toBe("department_head");
    expect(result3.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(result3.escalationRequired).toBe(false);

    // 超高額案件（1000万円超）の場合
    const result4 = setApproverAuthorityLevel(
      "設備申請", 
      true, 
      true, 
      "研究支援課", 
      15000000
    );
    expect(result4.requiredAuthorityLevel).toBe("department_head");
    expect(result4.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(result4.escalationRequired).toBe(true);

    // エラーケース：予算金額が負の値
    expect(() => {
      setApproverAuthorityLevel("一般申請", false, false, "総務課", -1000);
    }).toThrow("予算金額は0以上の値を入力してください");

    // エラーケース：所属部署が空
    expect(() => {
      setApproverAuthorityLevel("一般申請", false, false, "", 1000);
    }).toThrow("申請者の所属部署を選択してください");
  });
});