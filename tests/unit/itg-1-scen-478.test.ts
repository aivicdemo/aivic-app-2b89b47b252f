import { setApproverAuthorityLevel } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("権限不足の承認者の場合、上位承認者に振り分けられる", () => {
    // SCEN-478
    
    // 補助金関連で高額案件のケース - 部長レベル以上が必要
    const result1 = setApproverAuthorityLevel(
      "補助金申請書",
      true,
      true,
      "研究支援課",
      6000000
    );
    
    expect(result1.requiredAuthorityLevel).toBe("department_head");
    expect(result1.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(result1.escalationRequired).toBe(false);
    
    // 一般申請で低額案件のケース - 課長レベルで十分
    const result2 = setApproverAuthorityLevel(
      "一般申請書",
      false,
      false,
      "総務課",
      300000
    );
    
    expect(result2.requiredAuthorityLevel).toBe("section_chief");
    expect(result2.approverRoles).toEqual(["section_chief"]);
    expect(result2.escalationRequired).toBe(false);
    
    // 超高額案件のケース - 理事レベルへのエスカレーションが必要
    const result3 = setApproverAuthorityLevel(
      "設備申請書",
      false,
      false,
      "施設課",
      12000000
    );
    
    expect(result3.requiredAuthorityLevel).toBe("section_chief");
    expect(result3.approverRoles).toEqual(["section_chief"]);
    expect(result3.escalationRequired).toBe(true);
    
    // 補助金関連で紙保管必須+高額のケース
    const result4 = setApproverAuthorityLevel(
      "科研費申請書",
      true,
      true,
      "学術研究課",
      8000000
    );
    
    expect(result4.requiredAuthorityLevel).toBe("department_head");
    expect(result4.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(result4.escalationRequired).toBe(false);
    
    // 予算金額が負の値の場合のエラー
    expect(() => {
      setApproverAuthorityLevel("一般申請書", false, false, "総務課", -100000);
    }).toThrow("予算金額は0以上の値を入力してください");
    
    // 申請者の所属部署が空の場合のエラー
    expect(() => {
      setApproverAuthorityLevel("一般申請書", false, false, "", 100000);
    }).toThrow("申請者の所属部署を選択してください");
  });
});