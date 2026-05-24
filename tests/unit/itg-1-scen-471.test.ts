import { determineDocumentTypeAndRoute } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("申請書類の内容から補助金関連度を評価し電子化可否を判定する", () => {
    // SCEN-471

    // 補助金関連度70%以上の場合（科研費申請）
    const subsidyResult = determineDocumentTypeAndRoute(
      "令和6年度科学研究費補助金申請書",
      "文部科学省の科学研究費補助金による研究計画について申請いたします。研究費として設備購入費用を含む",
      "研究部"
    );
    
    expect(subsidyResult.documentType).toBe("研究費申請書");
    expect(subsidyResult.processingRoute).toBe("hybrid");
    expect(subsidyResult.subsidyRelated).toBe(true);
    expect(subsidyResult.paperStorageRequired).toBe(true);

    // 補助金関連度70%未満の場合（一般事務）
    const generalResult = determineDocumentTypeAndRoute(
      "会議室予約申請書",
      "来月の部署会議のため会議室の使用を申請します。参加者は10名程度を予定しています",
      "総務部"
    );
    
    expect(generalResult.documentType).toBe("一般申請書");
    expect(generalResult.processingRoute).toBe("electronic");
    expect(generalResult.subsidyRelated).toBe(false);
    expect(generalResult.paperStorageRequired).toBe(false);

    // 研究部署の場合の判定基準調整（60%閾値）
    const researchDeptResult = determineDocumentTypeAndRoute(
      "研究設備導入申請書",
      "研究用設備の導入について申請します。運営費交付金の一部として活用予定です",
      "研究開発部"
    );
    
    expect(researchDeptResult.documentType).toBe("設備申請書");
    expect(researchDeptResult.processingRoute).toBe("hybrid");
    expect(researchDeptResult.subsidyRelated).toBe(true);
    expect(researchDeptResult.paperStorageRequired).toBe(true);

    // タイトルが空の場合
    expect(() => {
      determineDocumentTypeAndRoute("", "申請内容です", "総務部");
    }).toThrow("申請書類のタイトルを入力してください");

    // 内容が10文字未満の場合
    expect(() => {
      determineDocumentTypeAndRoute("申請書", "短い内容", "総務部");
    }).toThrow("申請書類の内容は10文字以上で入力してください");

    // 所属部署が未選択の場合
    expect(() => {
      determineDocumentTypeAndRoute("申請書類", "申請内容が記載されています", "");
    }).toThrow("申請者の所属部署を選択してください");
  });
});