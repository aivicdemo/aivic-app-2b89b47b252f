import { classifyDocumentTypeAndRoute } from '../../src/logic/it-1-br-2-1-1';

describe('申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能', () => {
  // SCEN-472
  test('[normal] 文書種別自動判定 - 補助金関連度と処理ルートが適切に決定される', () => {
    // 補助金関連キーワードを含む申請書類のテスト
    const subsidyTitle = "科学研究費助成事業に係る間接経費の執行について";
    const subsidyContent = "文部科学省所管の科研費による研究設備購入申請書です。運営費交付金との併用により設備整備費として活用予定。";
    const subsidyDepartment = "研究推進課";

    const subsidyResult = classifyDocumentTypeAndRoute(subsidyTitle, subsidyContent, subsidyDepartment);

    // 補助金関連度 70% 以上で補助金関連と判定
    expect(subsidyResult.subsidyRelated).toBe(true);
    // 補助金関連かつMOE要件該当で紙保管必要
    expect(subsidyResult.paperStorageRequired).toBe(true);
    // 紙保管必要なのでハイブリッド処理
    expect(subsidyResult.processingRoute).toBe("hybrid");
    expect(subsidyResult.documentType).toBe("補助金申請書");

    // 一般的な申請書類のテスト
    const generalTitle = "会議室利用申請書";
    const generalContent = "学内会議開催のため会議室の利用を申請いたします。";
    const generalDepartment = "総務課";

    const generalResult = classifyDocumentTypeAndRoute(generalTitle, generalContent, generalDepartment);

    // 補助金関連キーワード不足で非関連
    expect(generalResult.subsidyRelated).toBe(false);
    // 補助金非関連なので紙保管不要
    expect(generalResult.paperStorageRequired).toBe(false);
    // 紙保管不要なので電子のみ処理
    expect(generalResult.processingRoute).toBe("electronic");
    expect(generalResult.documentType).toBe("一般申請書");

    // 境界値テスト - 70%ギリギリのケース
    const borderTitle = "設備整備費による備品購入";
    const borderContent = "大学運営に係る設備購入申請";
    const borderDepartment = "施設課";

    const borderResult = classifyDocumentTypeAndRoute(borderTitle, borderContent, borderDepartment);

    // キーワード関連度が70%未満で非関連
    expect(borderResult.subsidyRelated).toBe(false);
    expect(borderResult.paperStorageRequired).toBe(false);
    expect(borderResult.processingRoute).toBe("electronic");

    // エラーケーステスト
    expect(() => {
      classifyDocumentTypeAndRoute("", "内容", "部署");
    }).toThrow("申請書類のタイトルは10文字以上で入力してください");

    expect(() => {
      classifyDocumentTypeAndRoute("タイトル", "", "部署");
    }).toThrow("申請書類の内容は50文字以上で入力してください");

    expect(() => {
      classifyDocumentTypeAndRoute("タイトル", "内容", "");
    }).toThrow("所属部署を選択してください");
  });
});