import { setApproverAuthorityLevel } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("SCEN-477: 承認権限レベル判定 - 申請者と申請金額に基づいて適切な権限レベルが判定される", () => {
    // 補助金関連・高額案件（500万円超）の場合は部長レベル承認が必要
    const result1 = setApproverAuthorityLevel(
      "補助金申請書",
      true,
      true,
      "研究推進課",
      6000000
    );
    expect(result1.requiredAuthorityLevel).toBe("department_head");
    expect(result1.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(result1.escalationRequired).toBe(false);

    // 一般申請・低額案件（500万円以下）の場合は課長レベル承認
    const result2 = setApproverAuthorityLevel(
      "設備申請書",
      false,
      false,
      "総務課",
      3000000
    );
    expect(result2.requiredAuthorityLevel).toBe("section_chief");
    expect(result2.approverRoles).toEqual(["section_chief"]);
    expect(result2.escalationRequired).toBe(false);

    // 非常に高額案件（1000万円超）の場合は理事レベルへエスカレーション
    const result3 = setApproverAuthorityLevel(
      "補助金申請書",
      true,
      true,
      "研究推進課",
      12000000
    );
    expect(result3.requiredAuthorityLevel).toBe("department_head");
    expect(result3.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(result3.escalationRequired).toBe(true);

    // 予算金額が負の値の場合はエラー
    expect(() => setApproverAuthorityLevel(
      "申請書",
      false,
      false,
      "総務課",
      -1000000
    )).toThrow("予算金額は0以上の値を入力してください");

    // 申請者の所属部署が空の場合はエラー
    expect(() => setApproverAuthorityLevel(
      "申請書",
      false,
      false,
      "",
      1000000
    )).toThrow("申請者の所属部署を選択してください");
  });
});