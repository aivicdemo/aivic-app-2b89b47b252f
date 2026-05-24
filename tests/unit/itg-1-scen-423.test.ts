import { determineDocumentTypeAndRoute } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("補助金関連文書の場合、ハイブリッド処理ルートが設定される", () => {
    // SCEN-423
    
    // 補助金関連キーワードを70%以上含む文書でハイブリッド処理が設定されるケース
    const result1 = determineDocumentTypeAndRoute(
      "科研費研究設備導入申請書",
      "文部科学省科学研究費助成事業における研究設備整備費の申請について。運営費交付金との併用により効率的な研究環境の構築を図る。",
      "研究部"
    );
    expect(result1).toEqual({
      documentType: "補助金申請",
      processingRoute: "hybrid",
      subsidyRelated: true,
      paperStorageRequired: true
    });

    // 補助金関連度が70%未満の場合、電子のみ処理が設定されるケース
    const result2 = determineDocumentTypeAndRoute(
      "一般備品購入申請書",
      "研究室で使用する一般的な事務用品の購入申請です。",
      "総務部"
    );
    expect(result2).toEqual({
      documentType: "一般申請",
      processingRoute: "electronic",
      subsidyRelated: false,
      paperStorageRequired: false
    });

    // 研究関連部署で補助金関連度60%以上の場合、ハイブリッド処理が設定されるケース
    const result3 = determineDocumentTypeAndRoute(
      "研究費申請書類",
      "研究活動に必要な経費の申請について記載します。",
      "工学研究科"
    );
    expect(result3).toEqual({
      documentType: "研究関連",
      processingRoute: "hybrid",
      subsidyRelated: true,
      paperStorageRequired: true
    });

    // 申請書類のタイトルが空の場合のエラー
    expect(() => determineDocumentTypeAndRoute(
      "",
      "申請内容です",
      "研究部"
    )).toThrow("申請書類のタイトルを入力してください");

    // 申請書類の内容が10文字未満の場合のエラー
    expect(() => determineDocumentTypeAndRoute(
      "科研費申請書",
      "短い内容",
      "研究部"
    )).toThrow("申請内容が短すぎる可能性があります。内容を確認してください");

    // 申請者の所属部署が未選択の場合のエラー
    expect(() => determineDocumentTypeAndRoute(
      "科研費申請書",
      "文部科学省科学研究費助成事業における申請書類です。",
      ""
    )).toThrow("申請者の所属部署を選択してください");
  });
});