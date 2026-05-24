import { determineDocumentTypeAndRoute } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("申請書類の内容から文書種別が正しく判定される", () => {
    // SCEN-471
    
    // 補助金関連書類の判定テスト（キーワード関連度70%以上）
    const subsidyDocument = determineDocumentTypeAndRoute(
      "科研費による研究設備導入申請書",
      "文部科学省科学研究費助成事業による研究設備の導入を申請いたします。運営費交付金との組み合わせにより効果的な研究環境を構築します。",
      "研究科"
    );
    expect(subsidyDocument.documentType).toBe("補助金申請");
    expect(subsidyDocument.processingRoute).toBe("hybrid");
    expect(subsidyDocument.subsidyRelated).toBe(true);
    expect(subsidyDocument.paperStorageRequired).toBe(true);

    // 一般申請書類の判定テスト（キーワード関連度70%未満）
    const normalDocument = determineDocumentTypeAndRoute(
      "備品購入申請書",
      "事務用品の購入を申請いたします。プリンター用紙とファイルボックスを購入予定です。",
      "総務課"
    );
    expect(normalDocument.documentType).toBe("一般申請");
    expect(normalDocument.processingRoute).toBe("electronic");
    expect(normalDocument.subsidyRelated).toBe(false);
    expect(normalDocument.paperStorageRequired).toBe(false);

    // 研究関連部署での補助金関連度判定基準テスト（60%以上で補助金関連）
    const researchDeptDocument = determineDocumentTypeAndRoute(
      "設備整備費申請書類",
      "研究機器の整備に関する申請です。設備整備費による機器更新を行います。",
      "理学部"
    );
    expect(researchDeptDocument.documentType).toBe("補助金申請");
    expect(researchDeptDocument.processingRoute).toBe("hybrid");
    expect(researchDeptDocument.subsidyRelated).toBe(true);
    expect(researchDeptDocument.paperStorageRequired).toBe(true);

    // 制約テスト：タイトルが空の場合
    expect(() => determineDocumentTypeAndRoute(
      "",
      "申請内容の詳細です。",
      "総務課"
    )).toThrow("申請書類のタイトルを入力してください");

    // 制約テスト：内容が10文字未満の場合
    expect(() => determineDocumentTypeAndRoute(
      "申請書類のタイトル",
      "短い内容",
      "総務課"
    )).toThrow("申請内容が短すぎる可能性があります。内容を確認してください");

    // 制約テスト：所属部署が未選択の場合
    expect(() => determineDocumentTypeAndRoute(
      "申請書類のタイトル",
      "申請内容の詳細を記載したものです。",
      ""
    )).toThrow("申請者の所属部署を選択してください");
  });
});