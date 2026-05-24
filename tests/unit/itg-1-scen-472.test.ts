import { checkMoeComplianceRequirements } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("補助金関連度と文部科学省要件に基づいて処理ルートが自動決定される", () => {
    // SCEN-472

    // 補助金関連度60%以上で紙保管要件適合の場合 - ハイブリッド処理
    const result1 = checkMoeComplianceRequirements(
      "科学研究費助成事業による研究設備導入申請書",
      "文部科学省科学研究費助成事業における新規研究設備の導入に関する申請を行います。研究費総額は500万円を予定しており、運営費交付金との併用を検討しています。",
      "補助金申請書",
      ["補助金", "助成金", "文部科学省", "科研費", "運営費交付金"]
    );
    expect(result1.complianceStatus).toBe("compliant");
    expect(result1.paperStorageRequired).toBe(true);
    expect(result1.processingRoute).toBe("hybrid");
    expect(result1.riskLevel).toBe("high");

    // 補助金関連度40%以上60%未満の場合 - 電子処理
    const result2 = checkMoeComplianceRequirements(
      "研究関連の設備申請について",
      "大学の研究設備に関する申請書類です。一般的な設備導入の申請を行います。",
      "設備申請書",
      ["補助金", "助成金", "文部科学省", "科研費", "運営費交付金"]
    );
    expect(result2.complianceStatus).toBe("review_required");
    expect(result2.paperStorageRequired).toBe(false);
    expect(result2.processingRoute).toBe("electronic");
    expect(result2.riskLevel).toBe("medium");

    // 補助金関連度40%未満の場合 - 電子処理
    const result3 = checkMoeComplianceRequirements(
      "一般事務用品購入申請書",
      "事務用品の購入に関する申請書類です。文房具や消耗品の購入を行います。",
      "購入申請書",
      ["補助金", "助成金", "文部科学省", "科研費", "運営費交付金"]
    );
    expect(result3.complianceStatus).toBe("review_required");
    expect(result3.paperStorageRequired).toBe(false);
    expect(result3.processingRoute).toBe("electronic");
    expect(result3.riskLevel).toBe("low");

    // エラーケース: 申請書類のタイトルが空
    expect(() => 
      checkMoeComplianceRequirements(
        "",
        "申請内容",
        "補助金申請書",
        ["補助金", "科研費"]
      )
    ).toThrow("申請書類のタイトルが入力されていません。法令要件の判定ができません。");

    // エラーケース: 申請書類の内容が空
    expect(() => 
      checkMoeComplianceRequirements(
        "申請書タイトル",
        "",
        "補助金申請書",
        ["補助金", "科研費"]
      )
    ).toThrow("申請書類のタイトルが入力されていません。法令要件の判定ができません。");

    // エラーケース: 書類種別が未分類
    expect(() => 
      checkMoeComplianceRequirements(
        "申請書タイトル",
        "申請内容",
        "",
        ["補助金", "科研費"]
      )
    ).toThrow("書類種別の分類が完了していません。先に文書種別の確認を行ってください。");
  });
});