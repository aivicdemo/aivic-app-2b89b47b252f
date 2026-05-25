import { setApproverAuthorityLevel } from '../../src/logic/it-1-br-2-2-1';

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("SCEN-427: [error] 承認ルート自動設定 - 権限レベルが不明な場合、エラーが発生する", () => {
    // 権限レベルが不明な場合のテストケース
    expect(() => 
      setApproverAuthorityLevel(
        "一般申請",          // documentType
        false,               // subsidyRelated
        false,               // paperStorageRequired
        "",                  // applicantDepartment (空文字 = 不明)
        3000000             // budgetAmount
      )
    ).toThrow("申請者の所属部署を選択してください");

    // 予算金額が負の値の場合のテストケース
    expect(() => 
      setApproverAuthorityLevel(
        "補助金申請",        // documentType
        true,                // subsidyRelated
        true,                // paperStorageRequired
        "研究推進部",        // applicantDepartment
        -1000000            // budgetAmount (負の値)
      )
    ).toThrow("予算金額は0以上の値を入力してください");

    // 正常ケースでの動作確認
    const result = setApproverAuthorityLevel(
      "補助金申請",          // documentType
      true,                  // subsidyRelated
      true,                  // paperStorageRequired
      "研究推進部",          // applicantDepartment
      7000000               // budgetAmount
    );

    expect(result.requiredAuthorityLevel).toBe("department_head");
    expect(result.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(result.escalationRequired).toBe(false);
  });
});