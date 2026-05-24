import { determineProcessingRoute } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("補助金関連文書でハイブリッド処理が選択される", () => {
    // SCEN-474
    
    // 補助金関連度スコアが0.7以上で補助金申請書の場合
    const result1 = determineProcessingRoute(
      "補助金申請書",
      0.8,
      "令和6年度科学研究費補助金申請書",
      "本研究は文部科学省科研費による研究開発プロジェクトです。運営費交付金を活用した設備整備も含まれます。"
    );
    
    expect(result1.documentType).toBe("補助金申請書");
    expect(result1.processingRoute).toBe("hybrid");
    expect(result1.subsidyRelated).toBe(true);
    expect(result1.paperStorageRequired).toBe(true);
    expect(result1.approvalFlow).toBe("special");

    // 補助金関連度スコア境界値テスト（0.7ちょうど）
    const result2 = determineProcessingRoute(
      "研究費申請書",
      0.7,
      "研究費申請について",
      "補助金制度を利用した研究計画書"
    );
    
    expect(result2.documentType).toBe("研究費申請書");
    expect(result2.processingRoute).toBe("hybrid");
    expect(result2.subsidyRelated).toBe(true);
    expect(result2.paperStorageRequired).toBe(true);
    expect(result2.approvalFlow).toBe("special");

    // 設備導入申請書で補助金関連の場合
    const result3 = determineProcessingRoute(
      "設備導入申請書",
      0.75,
      "設備整備費申請",
      "文部科学省の設備整備費補助金による機器導入申請"
    );
    
    expect(result3.documentType).toBe("設備導入申請書");
    expect(result3.processingRoute).toBe("hybrid");
    expect(result3.subsidyRelated).toBe(true);
    expect(result3.paperStorageRequired).toBe(true);
    expect(result3.approvalFlow).toBe("special");

    // 非補助金関連文書は電子のみ処理
    const result4 = determineProcessingRoute(
      "一般事務申請書",
      0.3,
      "備品購入申請",
      "事務用品の購入を申請します"
    );
    
    expect(result4.documentType).toBe("一般事務申請書");
    expect(result4.processingRoute).toBe("electronic");
    expect(result4.subsidyRelated).toBe(false);
    expect(result4.paperStorageRequired).toBe(false);
    expect(result4.approvalFlow).toBe("standard");

    // 補助金関連度スコアが境界値未満（0.69）
    const result5 = determineProcessingRoute(
      "人事申請書",
      0.69,
      "人事異動申請",
      "人事関連の申請書類です"
    );
    
    expect(result5.documentType).toBe("人事申請書");
    expect(result5.processingRoute).toBe("electronic");
    expect(result5.subsidyRelated).toBe(false);
    expect(result5.paperStorageRequired).toBe(false);
    expect(result5.approvalFlow).toBe("standard");

    // エラーケース: 空のタイトル
    expect(() => {
      determineProcessingRoute("補助金申請書", 0.8, "", "内容あり");
    }).toThrow("申請書類のタイトルを入力してください");

    // エラーケース: 補助金関連度スコアが範囲外
    expect(() => {
      determineProcessingRoute("補助金申請書", 150, "タイトル", "内容");
    }).toThrow("補助金関連度の評価に異常があります。システム管理者にお問い合わせください");

    // 警告ケース: 文書種別が未分類
    const result6 = determineProcessingRoute(
      "未分類",
      0.8,
      "申請書類",
      "補助金関連の内容"
    );
    
    expect(result6.documentType).toBe("未分類");
    expect(result6.processingRoute).toBe("electronic");
    expect(result6.subsidyRelated).toBe(true);
    expect(result6.paperStorageRequired).toBe(false);
    expect(result6.approvalFlow).toBe("standard");
  });
});