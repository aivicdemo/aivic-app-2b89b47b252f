import { determineApprovalAuthority } from '../../src/logic/it-1-br-2-2-1';

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("承認権限レベル判定 - 権限レベル情報が不正な場合、エラーが発生する", () => {
    // SCEN-479
    
    // 不正な承認者職位データでエラーが発生することを確認
    expect(() => {
      determineApprovalAuthority(
        "", // 空の承認者職位
        5000000, // 申請金額500万円
        "補助金申請", // 申請種別
        "approve" // 承認判断
      );
    }).toThrow("承認者の職位情報を確認できません。システム管理者にお問い合わせください。");

    // 申請金額が負の値の場合
    expect(() => {
      determineApprovalAuthority(
        "課長", // 承認者職位
        -1000000, // 負の申請金額
        "一般申請", // 申請種別
        "approve" // 承認判断
      );
    }).toThrow("申請金額に正しい値を入力してください。");

    // 申請種別が未選択の場合
    expect(() => {
      determineApprovalAuthority(
        "部長", // 承認者職位
        3000000, // 申請金額300万円
        "", // 空の申請種別
        "approve" // 承認判断
      );
    }).toThrow("申請種別を選択してください。");
  });
});