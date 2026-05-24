import { determineDocumentAcceptanceEligibility } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("申請内容入力検証で必須項目が未入力の場合エラーメッセージが表示される", () => {
    // SCEN-418
    
    // 申請書類のタイトルが空の場合
    expect(() => {
      determineDocumentAcceptanceEligibility("", "申請内容の詳細です", "補助金申請書");
    }).toThrow("申請書類のタイトルを入力してください");
    
    // 申請書類の内容が10文字未満の場合
    expect(() => {
      determineDocumentAcceptanceEligibility("研究費申請書", "短い内容", "補助金申請書");
    }).toThrow("申請書類の内容は10文字以上で入力してください");
    
    // 文書種別が未選択の場合
    expect(() => {
      determineDocumentAcceptanceEligibility("研究費申請書", "研究費の申請を行います。詳細な研究内容と予算計画を記載しています。", "");
    }).toThrow("文書種別を選択してください");
    
    // 正常なケース: 補助金関連書類の判定
    const result1 = determineDocumentAcceptanceEligibility(
      "科学研究費助成事業申請書",
      "文部科学省の科学研究費助成事業に関する研究計画書です。研究目的、方法、期待される成果について詳細に記載しています。",
      "補助金申請書"
    );
    
    expect(result1).toEqual({
      documentType: "補助金申請書",
      processingRoute: "hybrid",
      subsidyRelated: true,
      paperStorageRequired: true,
      acceptanceEligible: true
    });
    
    // 正常なケース: 一般書類の判定
    const result2 = determineDocumentAcceptanceEligibility(
      "会議室利用申請書",
      "学内の会議室を利用するための申請書類です。利用目的、日時、参加者数を記載しています。",
      "一般申請書"
    );
    
    expect(result2).toEqual({
      documentType: "一般申請書",
      processingRoute: "electronic",
      subsidyRelated: false,
      paperStorageRequired: false,
      acceptanceEligible: false
    });
  });
});