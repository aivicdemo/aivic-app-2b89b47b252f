import { determineDocumentTypeAndRoute } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("必須項目が全て入力されている場合、次の処理に進むことができる", () => {
    // SCEN-417
    
    // 有効な申請書類のタイトル（10文字以上）
    const documentTitle = "科学研究費助成事業申請書類";
    
    // 有効な申請書類の内容（50文字以上）
    const documentContent = "本申請は文部科学省科学研究費助成事業における基盤研究（C）の申請書類であり、研究期間は2024年4月1日から2027年3月31日までの3年間を予定しております。";
    
    // 有効な申請者の所属部署名
    const applicantDepartment = "理学部";

    const result = determineDocumentTypeAndRoute(
      documentTitle,
      documentContent,
      applicantDepartment
    );

    // 補助金関連キーワードマッチ度が0.7以上のため補助金関連と判定
    expect(result.isSubsidyRelated).toBe(true);

    // 補助金関連でかつ文部科学省要件に該当するためハイブリッド処理
    expect(result.processingRoute).toBe("hybrid");

    // 補助金関連書類のため紙保管が必要
    expect(result.requiresPaperStorage).toBe(true);

    // 文書種別が設定されている
    expect(result.documentType).toBeDefined();
    expect(typeof result.documentType).toBe("string");
    expect(result.documentType.length).toBeGreaterThan(0);

    // エラーが発生しない場合の正常な結果構造を確認
    expect(result).toHaveProperty("documentType");
    expect(result).toHaveProperty("processingRoute");
    expect(result).toHaveProperty("isSubsidyRelated");
    expect(result).toHaveProperty("requiresPaperStorage");

    // タイトルが10文字未満の場合のエラー検証
    expect(() => determineDocumentTypeAndRoute(
      "短いタイトル",
      documentContent,
      applicantDepartment
    )).toThrow("申請書類のタイトルは10文字以上で入力してください");

    // 内容が10文字未満の場合の警告検証
    expect(() => determineDocumentTypeAndRoute(
      documentTitle,
      "短い内容",
      applicantDepartment
    )).toThrow("申請内容が短すぎる可能性があります。内容を確認してください");

    // 所属部署が未選択の場合のエラー検証
    expect(() => determineDocumentTypeAndRoute(
      documentTitle,
      documentContent,
      ""
    )).toThrow("申請者の所属部署を選択してください");

    // 補助金関連度が低い場合（電子のみ処理）
    const nonSubsidyResult = determineDocumentTypeAndRoute(
      "一般事務処理申請書類について",
      "この申請書類は一般的な事務手続きに関するものであり、特定の補助金制度には該当しません。通常の業務フローで処理されます。",
      "総務課"
    );

    expect(nonSubsidyResult.isSubsidyRelated).toBe(false);
    expect(nonSubsidyResult.processingRoute).toBe("electronic");
    expect(nonSubsidyResult.requiresPaperStorage).toBe(false);
  });
});