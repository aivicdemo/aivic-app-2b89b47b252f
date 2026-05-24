import {
  setApproverAuthorityLevel
} from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("申請者の所属部署と申請金額に基づいて適切な承認者権限レベルが自動判定される", () => {
    // SCEN-477
    
    // 正常ケース: 補助金関連書類、高額申請（500万円超）
    const highBudgetSubsidyResult = setApproverAuthorityLevel(
      "補助金申請書",
      true,
      true,
      "研究推進部",
      6000000
    );
    expect(highBudgetSubsidyResult.requiredAuthorityLevel).toBe("department_head");
    expect(highBudgetSubsidyResult.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(highBudgetSubsidyResult.escalationRequired).toBe(false);

    // 一般申請、低額（500万円未満）
    const lowBudgetGeneralResult = setApproverAuthorityLevel(
      "物品購入申請",
      false,
      false,
      "総務部",
      300000
    );
    expect(lowBudgetGeneralResult.requiredAuthorityLevel).toBe("section_chief");
    expect(lowBudgetGeneralResult.approverRoles).toEqual(["section_chief"]);
    expect(lowBudgetGeneralResult.escalationRequired).toBe(false);

    // 超高額申請（1000万円超）による理事レベルエスカレーション
    const veryHighBudgetResult = setApproverAuthorityLevel(
      "設備導入申請",
      false,
      false,
      "情報システム部",
      12000000
    );
    expect(veryHighBudgetResult.requiredAuthorityLevel).toBe("department_head");
    expect(veryHighBudgetResult.approverRoles).toEqual(["department_head"]);
    expect(veryHighBudgetResult.escalationRequired).toBe(true);

    // 紙保管必須文書の事務局長承認追加
    const paperRequiredResult = setApproverAuthorityLevel(
      "研究費申請書",
      true,
      true,
      "学術研究部",
      3000000
    );
    expect(paperRequiredResult.requiredAuthorityLevel).toBe("department_head");
    expect(paperRequiredResult.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(paperRequiredResult.escalationRequired).toBe(false);

    // 境界値テスト: 予算金額0円
    expect(() => {
      setApproverAuthorityLevel("一般申請", false, false, "", 0);
    }).toThrow("予算金額は0以上の値を入力してください");

    // 境界値テスト: 負の値
    expect(() => {
      setApproverAuthorityLevel("一般申請", false, false, "総務部", -100000);
    }).toThrow("予算金額は0以上の値を入力してください");

    // エラーケース: 申請者の所属部署が空
    expect(() => {
      setApproverAuthorityLevel("一般申請", false, false, "", 100000);
    }).toThrow("申請者の所属部署を選択してください");
  });
});