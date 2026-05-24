import { determineDirectorApprovalRequired } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("承認処理中に権限エラーが発生した場合、適切に処理される", () => {
    // SCEN-503
    
    // 権限エラーケース: 適合性チェック結果が空（権限なしでアクセスした状態）
    expect(() => {
      determineDirectorApprovalRequired(
        null,
        5000000,
        "中",
        "重点施策関連"
      );
    }).toThrow("適合性チェックが完了していません。先に適合性確認を実施してください");

    // 権限エラーケース: 申請金額が負の値（権限チェックで不正な値が渡された状態）
    expect(() => {
      determineDirectorApprovalRequired(
        { hasIssues: false },
        -1000000,
        "低",
        "一般"
      );
    }).toThrow("申請金額は0以上の値を入力してください");

    // 正常な承認処理: 高額申請のため事務局長承認が必要
    const result1 = determineDirectorApprovalRequired(
      { hasIssues: false },
      15000000,
      "低",
      "一般"
    );
    expect(result1).toEqual({
      approvalRequired: true,
      approvalReason: "高額申請のため",
      nextProcessStep: "事務局長承認待ち",
      riskAssessment: "標準"
    });

    // 正常な自動承認処理: すべて条件を満たさない場合
    const result2 = determineDirectorApprovalRequired(
      { hasIssues: false },
      5000000,
      "低",
      "一般"
    );
    expect(result2).toEqual({
      approvalRequired: false,
      approvalReason: "自動承認条件を満たすため",
      nextProcessStep: "申請資料作成",
      riskAssessment: "標準"
    });
  });
});