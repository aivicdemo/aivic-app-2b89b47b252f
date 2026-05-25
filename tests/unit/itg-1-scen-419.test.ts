import { validateApplicationInput } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  // SCEN-419: [edge] 申請内容入力検証 - 必須項目の境界値での入力時、適切に検証される
  test("必須項目の境界値での入力時、適切に検証される", () => {
    // 正常ケース: ぎりぎり有効な値
    const validInput = validateApplicationInput(
      "申請書類タイトル1234", // 10文字
      "申請内容を詳しく記載します。この内容は50文字以上で記載する必要があります。これで十分な文字数になりました。", // 50文字以上
      "補助金申請",
      "総務部",
      "通常"
    );
    
    expect(validInput.isValid).toBe(true);
    expect(validInput.errors).toEqual([]);
    expect(validInput.warnings).toEqual([]);

    // タイトル境界値テスト（9文字）
    expect(() => validateApplicationInput(
      "申請書類タイトル", // 9文字
      "申請内容を詳しく記載します。この内容は50文字以上で記載する必要があります。これで十分な文字数になりました。",
      "補助金申請",
      "総務部",
      "通常"
    )).toThrow("申請書類のタイトルは10文字以上200文字以内で入力してください");

    // タイトル境界値テスト（200文字）
    const title200 = "申".repeat(200);
    const validTitle200 = validateApplicationInput(
      title200,
      "申請内容を詳しく記載します。この内容は50文字以上で記載する必要があります。これで十分な文字数になりました。",
      "補助金申請",
      "総務部",
      "通常"
    );
    
    expect(validTitle200.isValid).toBe(true);
    expect(validTitle200.errors).toEqual([]);

    // タイトル境界値テスト（201文字）
    const title201 = "申".repeat(201);
    const invalidTitle201 = validateApplicationInput(
      title201,
      "申請内容を詳しく記載します。この内容は50文字以上で記載する必要があります。これで十分な文字数になりました。",
      "補助金申請",
      "総務部",
      "通常"
    );
    
    expect(invalidTitle201.isValid).toBe(false);
    expect(invalidTitle201.errors).toEqual(["申請書類のタイトルは10文字以上200文字以内で入力してください"]);

    // 内容境界値テスト（49文字）
    const content49 = "申".repeat(49);
    expect(() => validateApplicationInput(
      "申請書類タイトル1234",
      content49,
      "補助金申請",
      "総務部",
      "通常"
    )).toThrow("申請内容は50文字以上で詳しく記載してください");

    // 内容境界値テスト（50文字）
    const content50 = "申".repeat(50);
    const validContent50 = validateApplicationInput(
      "申請書類タイトル1234",
      content50,
      "補助金申請",
      "総務部",
      "通常"
    );
    
    expect(validContent50.isValid).toBe(true);
    expect(validContent50.errors).toEqual([]);

    // 空のタイトル
    expect(() => validateApplicationInput(
      "",
      "申請内容を詳しく記載します。この内容は50文字以上で記載する必要があります。これで十分な文字数になりました。",
      "補助金申請",
      "総務部",
      "通常"
    )).toThrow("申請書類のタイトルは必須項目です。入力してください。");

    // 空の内容
    expect(() => validateApplicationInput(
      "申請書類タイトル1234",
      "",
      "補助金申請",
      "総務部",
      "通常"
    )).toThrow("申請内容は50文字以上で詳しく記載してください。");

    // 空の申請種別
    expect(() => validateApplicationInput(
      "申請書類タイトル1234",
      "申請内容を詳しく記載します。この内容は50文字以上で記載する必要があります。これで十分な文字数になりました。",
      "",
      "総務部",
      "通常"
    )).toThrow("申請種別を選択してください。");

    // 空の所属部署
    expect(() => validateApplicationInput(
      "申請書類タイトル1234",
      "申請内容を詳しく記載します。この内容は50文字以上で記載する必要があります。これで十分な文字数になりました。",
      "補助金申請",
      "",
      "通常"
    )).toThrow("所属部署を入力してください。");
  });
});