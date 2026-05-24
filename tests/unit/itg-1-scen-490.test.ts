import { 
  classifyDocumentTypeAndRoute 
} from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("SCEN-490: ハイブリッド処理必要文書で電子＋紙保管が選択される", () => {
    // 補助金関連キーワードを多数含む申請書類
    const documentTitle = "文部科学省科学研究費助成事業の設備整備申請書";
    const documentContent = "本申請は科研費による研究設備の導入に関するもので、文部科学省の補助金制度に基づいて実施する重要な研究プロジェクトの一環として、運営費交付金との併用により効果的な研究環境の整備を目指すものです。";
    const applicantDepartment = "工学部";

    const result = classifyDocumentTypeAndRoute(
      documentTitle,
      documentContent,
      applicantDepartment
    );

    // キーワード含有率70%以上で補助金関連と判定
    expect(result.subsidyRelated).toBe(true);
    // 文部科学省要件に該当するため紙保管が必要
    expect(result.paperStorageRequired).toBe(true);
    // 紙保管必要なためハイブリッド処理を選択
    expect(result.processingRoute).toBe("hybrid");
    // 補助金申請書として分類
    expect(result.documentType).toBe("補助金申請書");

    // 非補助金関連書類の場合
    const generalTitle = "研究室の備品購入申請";
    const generalContent = "研究活動で使用する一般的な事務用品と消耗品の購入申請";
    
    const generalResult = classifyDocumentTypeAndRoute(
      generalTitle,
      generalContent,
      applicantDepartment
    );

    // キーワード含有率70%未満で補助金非関連
    expect(generalResult.subsidyRelated).toBe(false);
    // 紙保管不要
    expect(generalResult.paperStorageRequired).toBe(false);
    // 電子のみ処理
    expect(generalResult.processingRoute).toBe("electronic");

    // エラーケース
    expect(() => classifyDocumentTypeAndRoute("", documentContent, applicantDepartment))
      .toThrow("申請書類のタイトルは10文字以上で入力してください");

    expect(() => classifyDocumentTypeAndRoute(documentTitle, "", applicantDepartment))
      .toThrow("申請書類の内容は50文字以上で入力してください");

    expect(() => classifyDocumentTypeAndRoute(documentTitle, documentContent, ""))
      .toThrow("所属部署を選択してください");
  });
});