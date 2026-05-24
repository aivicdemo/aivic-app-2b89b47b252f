import { setApproverAuthorityLevel } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("承認者の権限レベルが不明な場合、エラーが発生する", () => {
    // SCEN-427

    // 権限レベルが不明な場合のテスト
    expect(() => setApproverAuthorityLevel(
      "不明種別",
      false,
      false,
      "",
      1000000
    )).toThrow("申請者の所属部署を選択してください");

    // 予算金額が負の値の場合のテスト
    expect(() => setApproverAuthorityLevel(
      "補助金申請",
      true,
      true,
      "研究推進課",
      -1000000
    )).toThrow("予算金額は0以上の値を入力してください");

    // 正常なケース：補助金関連で高額案件の場合
    const result1 = setApproverAuthorityLevel(
      "補助金申請",
      true,
      true,
      "研究推進課",
      6000000
    );
    expect(result1.requiredAuthorityLevel).toBe("department_head");
    expect(result1.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(result1.escalationRequired).toBe(false);

    // 正常なケース：非補助金関連で低額案件の場合
    const result2 = setApproverAuthorityLevel(
      "一般申請",
      false,
      false,
      "総務課",
      100000
    );
    expect(result2.requiredAuthorityLevel).toBe("section_chief");
    expect(result2.approverRoles).toEqual(["section_chief"]);
    expect(result2.escalationRequired).toBe(false);

    // 正常なケース：超高額案件でエスカレーションが必要
    const result3 = setApproverAuthorityLevel(
      "設備申請",
      false,
      false,
      "施設課",
      15000000
    );
    expect(result3.requiredAuthorityLevel).toBe("department_head");
    expect(result3.approverRoles).toEqual(["department_head"]);
    expect(result3.escalationRequired).toBe(true);

    // 正常なケース：補助金関連で紙保管必須かつ超高額
    const result4 = setApproverAuthorityLevel(
      "科研費申請",
      true,
      true,
      "研究推進課",
      12000000
    );
    expect(result4.requiredAuthorityLevel).toBe("department_head");
    expect(result4.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(result4.escalationRequired).toBe(true);

    // 正常なケース：補助金関連だが低額案件
    const result5 = setApproverAuthorityLevel(
      "補助金申請",
      true,
      false,
      "学務課",
      2000000
    );
    expect(result5.requiredAuthorityLevel).toBe("department_head");
    expect(result5.approverRoles).toEqual(["department_head"]);
    expect(result5.escalationRequired).toBe(false);
  });
});