import { setApproverAuthorityLevel } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("承認ルート自動設定 - 権限レベルが不明な場合、エラーが発生する", () => {
    // SCEN-427

    // 権限レベルが不明なケース - 予算金額が負の値
    expect(() => {
      setApproverAuthorityLevel(
        "補助金申請書",
        true,
        true,
        "研究推進課",
        -1000000
      );
    }).toThrow("予算金額は0以上の値を入力してください");

    // 権限レベルが不明なケース - 申請者の所属部署が空
    expect(() => {
      setApproverAuthorityLevel(
        "補助金申請書",
        true,
        true,
        "",
        3000000
      );
    }).toThrow("申請者の所属部署を選択してください");

    // 正常なケース - 補助金関連で高額案件
    const result1 = setApproverAuthorityLevel(
      "補助金申請書",
      true,
      true,
      "研究推進課",
      8000000
    );
    expect(result1.requiredAuthorityLevel).toBe("department_head");
    expect(result1.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(result1.escalationRequired).toBe(false);

    // 正常なケース - 一般申請で低額案件
    const result2 = setApproverAuthorityLevel(
      "一般申請書",
      false,
      false,
      "総務課",
      200000
    );
    expect(result2.requiredAuthorityLevel).toBe("section_chief");
    expect(result2.approverRoles).toEqual(["section_chief"]);
    expect(result2.escalationRequired).toBe(false);

    // 超高額案件でエスカレーション必要なケース
    const result3 = setApproverAuthorityLevel(
      "設備申請書",
      false,
      false,
      "施設課",
      12000000
    );
    expect(result3.requiredAuthorityLevel).toBe("department_head");
    expect(result3.approverRoles).toEqual(["department_head"]);
    expect(result3.escalationRequired).toBe(true);
  });
});