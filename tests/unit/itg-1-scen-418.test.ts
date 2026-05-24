import { checkComplianceAndDetermineRoute } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("申請内容入力検証 - 必須項目が未入力の場合、エラーメッセージが表示される", () => {
    // SCEN-418

    // タイトルが空の場合
    expect(() => checkComplianceAndDetermineRoute(
      "",
      "申請書類の内容です。補助金に関連する詳細な説明が記載されています。",
      "補助金申請書",
      ["補助金", "助成金", "文部科学省", "科研費"]
    )).toThrow("申請書類のタイトルは10文字以上で入力してください");

    // タイトルが10文字未満の場合
    expect(() => checkComplianceAndDetermineRoute(
      "短いタイトル",
      "申請書類の内容です。補助金に関連する詳細な説明が記載されています。",
      "補助金申請書", 
      ["補助金", "助成金", "文部科学省", "科研費"]
    )).toThrow("申請書類のタイトルは10文字以上で入力してください");

    // 内容が空の場合
    expect(() => checkComplianceAndDetermineRoute(
      "科学研究費助成事業申請書類について",
      "",
      "補助金申請書",
      ["補助金", "助成金", "文部科学省", "科研費"]
    )).toThrow("申請書類の内容は50文字以上で入力してください");

    // 内容が50文字未満の場合
    expect(() => checkComplianceAndDetermineRoute(
      "科学研究費助成事業申請書類について",
      "短い内容です",
      "補助金申請書",
      ["補助金", "助成金", "文部科学省", "科研費"]
    )).toThrow("申請書類の内容は50文字以上で入力してください");

    // 文書種別が未設定の場合
    expect(() => checkComplianceAndDetermineRoute(
      "科学研究費助成事業申請書類について",
      "申請書類の内容です。補助金に関連する詳細な説明が記載されています。文部科学省の要件に従って適切に記載しております。",
      "",
      ["補助金", "助成金", "文部科学省", "科研費"]
    )).toThrow("書類種別の分類が完了していません。先に文書種別の確認を行ってください。");

    // 正常な場合 - 補助金関連書類でハイブリッド処理
    const result1 = checkComplianceAndDetermineRoute(
      "科学研究費助成事業申請書類について",
      "申請書類の内容です。補助金に関連する詳細な説明が記載されています。文部科学省の要件に従って適切に記載しております。",
      "補助金申請書",
      ["補助金", "助成金", "文部科学省", "科研費"]
    );

    expect(result1).toEqual({
      complianceStatus: "compliant",
      paperStorageRequired: true,
      processingRoute: "hybrid",
      riskLevel: "high"
    });

    // 正常な場合 - 補助金非関連書類で電子処理
    const result2 = checkComplianceAndDetermineRoute(
      "一般事務手続きについての申請書類",
      "一般的な事務手続きに関する申請書類です。特に補助金等の関連はございません。",
      "一般申請書",
      ["補助金", "助成金", "文部科学省", "科研費"]
    );

    expect(result2).toEqual({
      complianceStatus: "review_required",
      paperStorageRequired: false,
      processingRoute: "electronic", 
      riskLevel: "low"
    });
  });
});