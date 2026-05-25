import { determineNextApprover } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("承認判断処理ルート決定 - 処理ルート決定に失敗した場合、エラー処理が実行される", () => {
    // SCEN-482
    
    // 無効な入力でエラーが発生するケース
    expect(() => {
      determineNextApprover("", "", "manager", "approve");
    }).toThrow("申請書類のタイトルが入力されていません。タイトルを入力してください。");
    
    expect(() => {
      determineNextApprover("補助金申請書", "研究費の申請", "", "approve");
    }).toThrow("承認者の役職情報が取得できません。システム管理者にお問い合わせください。");
    
    expect(() => {
      determineNextApprover("補助金申請書", "研究費の申請", "manager", "");
    }).toThrow("承認・差戻し・却下のいずれかを選択してください。");
    
    // 正常なケース - 補助金関連書類
    const subsidyResult = determineNextApprover(
      "科研費申請書類一式",
      "科学研究費助成事業への申請に必要な研究計画書および予算書等の関連資料",
      "section_chief",
      "approve"
    );
    
    expect(subsidyResult.isSubsidyRelated).toBe(true);
    expect(subsidyResult.requiresPaperStorage).toBe(true);
    expect(subsidyResult.processingRoute).toBe("hybrid");
    expect(subsidyResult.nextApprover).toBe("department_head");
    
    // 正常なケース - 一般書類
    const generalResult = determineNextApprover(
      "出張申請書",
      "学会参加のための出張申請書類",
      "section_chief", 
      "approve"
    );
    
    expect(generalResult.isSubsidyRelated).toBe(false);
    expect(generalResult.requiresPaperStorage).toBe(false);
    expect(generalResult.processingRoute).toBe("electronic");
    expect(generalResult.nextApprover).toBe("department_head");
  });
});