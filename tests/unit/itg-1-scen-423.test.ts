import { determineDocumentTypeAndRoute } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("SCEN-423: [normal] 文書種別自動判別 - 補助金関連文書の場合、ハイブリッド処理ルートが設定される", () => {
    // 補助金関連キーワードを含む申請書類のタイトルと内容
    const documentTitle = "令和6年度科学研究費助成事業（科研費）基盤研究（C）申請書";
    const documentContent = "本研究では、文部科学省科学研究費補助金を活用して、運営費交付金による基盤的研究環境の整備と併せて、設備整備費による研究機器の導入を計画している。研究期間は3年間とし、毎年度の実績報告書を文部科学省に提出する予定である。";
    const applicantDepartment = "理学部";

    const result = determineDocumentTypeAndRoute(documentTitle, documentContent, applicantDepartment);

    // keywordScore = calculateSubsidyKeywords() による関連度計算で0.7以上
    // subsidyRelated = true (keywordScore >= 0.7)
    // paperStorageRequired = true (補助金関連かつ文部科学省要件該当)
    // processingRoute = "hybrid" (paperStorageRequired = true)
    // documentType = 補助金関連として分類
    expect(result.documentType).toBe("補助金申請書");
    expect(result.processingRoute).toBe("hybrid");
    expect(result.isSubsidyRelated).toBe(true);
    expect(result.requiresPaperStorage).toBe(true);

    // タイトルが空の場合のエラーテスト
    expect(() => determineDocumentTypeAndRoute("", documentContent, applicantDepartment))
      .toThrow("申請書類のタイトルを入力してください");

    // 内容が短い場合の警告テスト
    expect(() => determineDocumentTypeAndRoute(documentTitle, "短い内容", applicantDepartment))
      .toThrow("申請書類の内容は10文字以上で入力してください");

    // 所属部署が未選択の場合のエラーテスト
    expect(() => determineDocumentTypeAndRoute(documentTitle, documentContent, ""))
      .toThrow("申請者の所属部署を選択してください");

    // 補助金関連度が低い場合（電子のみ処理）
    const nonSubsidyTitle = "一般事務連絡書";
    const nonSubsidyContent = "各部署への事務連絡事項をお知らせします。会議の日程調整について";
    const nonSubsidyResult = determineDocumentTypeAndRoute(nonSubsidyTitle, nonSubsidyContent, applicantDepartment);

    expect(nonSubsidyResult.processingRoute).toBe("electronic");
    expect(nonSubsidyResult.isSubsidyRelated).toBe(false);
    expect(nonSubsidyResult.requiresPaperStorage).toBe(false);
  });
});