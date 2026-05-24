import { setApproverAuthorityLevel } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("申請者と申請金額に基づいて適切な権限レベルが判定される", () => {
    // SCEN-477
    
    // 補助金関連書類で高額案件（1000万円）の場合
    const result1 = setApproverAuthorityLevel(
      "補助金申請書",
      true,
      false,
      "研究推進課",
      10000000
    );
    expect(result1.requiredAuthorityLevel).toBe("department_head");
    expect(result1.approverRoles).toEqual(["department_head"]);
    expect(result1.escalationRequired).toBe(true);

    // 一般書類で低額案件（100万円）の場合
    const result2 = setApproverAuthorityLevel(
      "一般申請書",
      false,
      false,
      "総務課",
      1000000
    );
    expect(result2.requiredAuthorityLevel).toBe("section_chief");
    expect(result2.approverRoles).toEqual(["section_chief"]);
    expect(result2.escalationRequired).toBe(false);

    // 紙保管必須書類の場合
    const result3 = setApproverAuthorityLevel(
      "実績報告書",
      true,
      true,
      "財務課",
      3000000
    );
    expect(result3.requiredAuthorityLevel).toBe("department_head");
    expect(result3.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(result3.escalationRequired).toBe(false);

    // 超高額案件（1000万円以上）で理事レベルエスカレーション
    const result4 = setApproverAuthorityLevel(
      "設備導入申請書",
      true,
      false,
      "研究推進課",
      15000000
    );
    expect(result4.requiredAuthorityLevel).toBe("department_head");
    expect(result4.approverRoles).toEqual(["department_head"]);
    expect(result4.escalationRequired).toBe(true);

    // 境界値テスト：500万円ちょうど
    const result5 = setApproverAuthorityLevel(
      "研究費申請書",
      true,
      false,
      "研究推進課",
      5000000
    );
    expect(result5.requiredAuthorityLevel).toBe("section_chief");
    expect(result5.approverRoles).toEqual(["section_chief"]);
    expect(result5.escalationRequired).toBe(false);

    // 境界値テスト：500万円+1円で高額案件
    const result6 = setApproverAuthorityLevel(
      "研究費申請書",
      true,
      false,
      "研究推進課",
      5000001
    );
    expect(result6.requiredAuthorityLevel).toBe("department_head");
    expect(result6.approverRoles).toEqual(["department_head"]);
    expect(result6.escalationRequired).toBe(false);

    // エラーケース：予算金額が負の値
    expect(() => {
      setApproverAuthorityLevel(
        "申請書",
        false,
        false,
        "総務課",
        -1000000
      );
    }).toThrow("予算金額は0以上の値を入力してください");

    // エラーケース：所属部署が空
    expect(() => {
      setApproverAuthorityLevel(
        "申請書",
        false,
        false,
        "",
        1000000
      );
    }).toThrow("申請者の所属部署を選択してください");
  });
});