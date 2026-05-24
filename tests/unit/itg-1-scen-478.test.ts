import { setApproverAuthorityLevel } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("SCEN-478: 権限不足の承認者の場合、上位承認者に振り分けられる", () => {
    // 高額な補助金申請で権限不足のケース
    const result1 = setApproverAuthorityLevel(
      "補助金申請書",
      true,
      true,
      "総務課",
      8000000
    );
    expect(result1.requiredAuthorityLevel).toBe("department_head");
    expect(result1.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(result1.escalationRequired).toBe(false);

    // 非常に高額な案件でエスカレーション必要なケース
    const result2 = setApproverAuthorityLevel(
      "設備購入申請書",
      false,
      false,
      "情報システム課",
      15000000
    );
    expect(result2.requiredAuthorityLevel).toBe("department_head");
    expect(result2.approverRoles).toEqual(["department_head"]);
    expect(result2.escalationRequired).toBe(true);

    // 補助金関連で紙保管必要なケース
    const result3 = setApproverAuthorityLevel(
      "科研費申請書",
      true,
      true,
      "研究推進課",
      3000000
    );
    expect(result3.requiredAuthorityLevel).toBe("department_head");
    expect(result3.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(result3.escalationRequired).toBe(false);

    // 低額案件で課長レベル承認のケース
    const result4 = setApproverAuthorityLevel(
      "一般事務申請",
      false,
      false,
      "総務課",
      300000
    );
    expect(result4.requiredAuthorityLevel).toBe("section_chief");
    expect(result4.approverRoles).toEqual(["section_chief"]);
    expect(result4.escalationRequired).toBe(false);

    // 予算金額が負の値の場合のエラー
    expect(() => {
      setApproverAuthorityLevel("一般申請", false, false, "総務課", -1000000);
    }).toThrow("予算金額は0以上の値を入力してください");

    // 申請者の所属部署が空の場合のエラー
    expect(() => {
      setApproverAuthorityLevel("補助金申請書", true, true, "", 5000000);
    }).toThrow("申請者の所属部署を選択してください");
  });
});