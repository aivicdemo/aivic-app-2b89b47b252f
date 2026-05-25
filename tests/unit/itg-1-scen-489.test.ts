import { determineDocumentStorageMethod } from '../../src/logic/it-1-br-2-1-1';

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("法令要件に基づいて適切な保管方式が選択される", () => {
    // SCEN-489
    
    // 補助金関連書類で紙保管が必要な場合
    const subsidyKeywords = ["科研費", "運営費交付金", "設備整備費", "補助金"];
    
    const result1 = determineDocumentStorageMethod(
      "科研費による研究設備購入申請書",
      "本申請は文部科学省科学研究費助成事業における研究設備の購入に関するものです。運営費交付金との併用により効果的な研究環境の整備を目指します。",
      "補助金申請書",
      subsidyKeywords
    );
    
    expect(result1.documentType).toBe("補助金申請書");
    expect(result1.processingRoute).toBe("hybrid");
    expect(result1.subsidyRelated).toBe(true);
    expect(result1.paperStorageRequired).toBe(true);
    
    // 一般書類で電子のみ処理の場合
    const result2 = determineDocumentStorageMethod(
      "年次会議開催に関する企画書",
      "来年度の年次会議の開催に向けて、会場確保と参加者調整を行います。効率的な運営を目指し準備を進めております。",
      "一般企画書",
      subsidyKeywords
    );
    
    expect(result2.documentType).toBe("一般企画書");
    expect(result2.processingRoute).toBe("electronic");
    expect(result2.subsidyRelated).toBe(false);
    expect(result2.paperStorageRequired).toBe(false);
    
    // 境界値テスト：キーワード一致度が70%ちょうどの場合
    const result3 = determineDocumentStorageMethod(
      "設備整備費に関する書類",
      "設備整備に関する内容です",
      "設備申請書",
      subsidyKeywords
    );
    
    expect(result3.subsidyRelated).toBe(true);
    expect(result3.processingRoute).toBe("hybrid");
    expect(result3.paperStorageRequired).toBe(true);
    
    // エラーケース：タイトルが空の場合
    expect(() => {
      determineDocumentStorageMethod(
        "",
        "内容がある書類",
        "一般書類",
        subsidyKeywords
      );
    }).toThrow("申請書類のタイトルが入力されていません。タイトルを入力してください。");
    
    // エラーケース：内容が10文字未満の場合
    expect(() => {
      determineDocumentStorageMethod(
        "正常なタイトル",
        "短い",
        "一般書類",
        subsidyKeywords
      );
    }).toThrow("申請内容が短すぎる可能性があります。内容を確認してください。");
  });
});