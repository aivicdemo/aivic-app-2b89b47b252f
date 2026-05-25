import { validateApplicationInput } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  // SCEN-418
  test("申請内容入力検証 - 必須項目が未入力の場合、エラーメッセージが表示される", () => {
    // タイトルが空の場合
    expect(() => validateApplicationInput("", "申請内容が50文字以上の詳細な説明です。補助金に関する申請書類として提出いたします。", "補助金申請", "研究部", "通常")).toThrow("申請書類のタイトルは必須項目です。入力してください。");

    // 申請内容が50文字未満の場合
    expect(() => validateApplicationInput("申請書類のタイトルです", "短い内容", "補助金申請", "研究部", "通常")).toThrow("申請内容は50文字以上で詳しく記載してください。");

    // 申請種別が未選択の場合
    expect(() => validateApplicationInput("申請書類のタイトルです", "申請内容が50文字以上の詳細な説明です。補助金に関する申請書類として提出いたします。", "", "研究部", "通常")).toThrow("申請種別を選択してください。");

    // 所属部署が未入力の場合
    expect(() => validateApplicationInput("申請書類のタイトルです", "申請内容が50文字以上の詳細な説明です。補助金に関する申請書類として提出いたします。", "補助金申請", "", "通常")).toThrow("所属部署を入力してください。");

    // 有効な入力の場合（正常系）
    const result = validateApplicationInput("申請書類のタイトルです", "申請内容が50文字以上の詳細な説明です。補助金に関する申請書類として提出いたします。", "補助金申請", "研究部", "通常");
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});