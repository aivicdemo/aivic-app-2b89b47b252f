import { determineNextApprover } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("承認判断処理ルート決定 - 処理ルート決定に失敗した場合、エラー処理が実行される", () => {
    // SCEN-482
    
    // 申請書類のタイトルが空の場合
    expect(() => determineNextApprover("", "申請書類の本文内容", "課長", "承認")).toThrow("申請書類のタイトルが入力されていません。タイトルを入力してください。");
    
    // 承認判断が選択されていない場合
    expect(() => determineNextApprover("補助金申請書", "科研費の申請内容です", "課長", "")).toThrow("承認・差戻し・却下のいずれかを選択してください。");
    
    // 現在の承認者の役職が不明な場合
    expect(() => determineNextApprover("補助金申請書", "科研費の申請内容です", "", "承認")).toThrow("承認者の役職情報が取得できません。システム管理者にお問い合わせください。");
    
    // 正常ケース: 補助金関連書類で紙保管が必要
    const result1 = determineNextApprover("科研費申請書", "科研費による研究費申請書類です", "課長", "承認");
    expect(result1.isSubsidyRelated).toBe(true);
    expect(result1.requiresPaperStorage).toBe(true);
    expect(result1.processingRoute).toBe("hybrid");
    expect(result1.nextApprover).toBe("部長");
    
    // 正常ケース: 一般申請書類で電子のみ処理
    const result2 = determineNextApprover("備品購入申請書", "研究室の机と椅子の購入申請です", "課長", "承認");
    expect(result2.isSubsidyRelated).toBe(false);
    expect(result2.requiresPaperStorage).toBe(false);
    expect(result2.processingRoute).toBe("electronic");
    expect(result2.nextApprover).toBe("部長");
  });
});