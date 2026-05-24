import { setApproverAuthorityLevel } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("承認者権限レベル設定において権限レベルが不明な場合エラーが発生する", () => {
    // SCEN-427
    
    // 権限レベルが不明（undefinedまたは空文字）な場合のテスト
    expect(() => setApproverAuthorityLevel(
      "補助金申請", 
      true, 
      true, 
      "", // 申請者の所属部署が空
      5000000
    )).toThrow("申請者の所属部署を選択してください");

    // 予算金額が負の値の場合のエラーテスト
    expect(() => setApproverAuthorityLevel(
      "補助金申請", 
      true, 
      true, 
      "研究推進部", 
      -1000000
    )).toThrow("予算金額は0以上の値を入力してください");

    // 正常ケース: 補助金関連で高額案件
    const result1 = setApproverAuthorityLevel(
      "補助金申請", 
      true, 
      true, 
      "研究推進部", 
      6000000
    );
    expect(result1.requiredAuthorityLevel).toBe("department_head");
    expect(result1.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(result1.escalationRequired).toBe(false);

    // 正常ケース: 一般申請で低額
    const result2 = setApproverAuthorityLevel(
      "一般申請", 
      false, 
      false, 
      "総務部", 
      3000000
    );
    expect(result2.requiredAuthorityLevel).toBe("section_chief");
    expect(result2.approverRoles).toEqual(["section_chief"]);
    expect(result2.escalationRequired).toBe(false);

    // 超高額案件でエスカレーション必要
    const result3 = setApproverAuthorityLevel(
      "補助金申請", 
      true, 
      true, 
      "研究推進部", 
      12000000
    );
    expect(result3.requiredAuthorityLevel).toBe("department_head");
    expect(result3.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(result3.escalationRequired).toBe(true);
  });
});