import { validateApplicationInput } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("申請内容入力の必須項目境界値検証が適切に動作する", () => {
    // SCEN-419

    // 境界値テスト: タイトル10文字ちょうど（最小有効値）
    const result1 = validateApplicationInput(
      "1234567890", // 10文字ちょうど
      "申請内容が50文字以上となるように記載します。これで50文字以上の申請内容となります。",
      "補助金申請",
      "研究推進課",
      "通常"
    );
    expect(result1.isValid).toBe(true);
    expect(result1.errors).toEqual([]);
    expect(result1.warnings).toEqual([]);

    // 境界値テスト: タイトル200文字ちょうど（最大有効値）
    const title200 = "A".repeat(200);
    const result2 = validateApplicationInput(
      title200,
      "申請内容が50文字以上となるように記載します。これで50文字以上の申請内容となります。",
      "補助金申請",
      "研究推進課",
      "通常"
    );
    expect(result2.isValid).toBe(true);
    expect(result2.errors).toEqual([]);
    expect(result2.warnings).toEqual([]);

    // 境界値テスト: 申請内容50文字ちょうど（最小有効値）
    const content50 = "A".repeat(50);
    const result3 = validateApplicationInput(
      "有効なタイトル",
      content50,
      "補助金申請",
      "研究推進課",
      "通常"
    );
    expect(result3.isValid).toBe(true);
    expect(result3.errors).toEqual([]);
    expect(result3.warnings).toEqual([]);

    // エラーケース: タイトル9文字（境界値未満）
    expect(() => validateApplicationInput(
      "123456789", // 9文字
      "申請内容が50文字以上となるように記載します。これで50文字以上の申請内容となります。",
      "補助金申請",
      "研究推進課",
      "通常"
    )).toThrow("申請書類のタイトルは必須項目です。入力してください。");

    // エラーケース: タイトル201文字（境界値超過）
    const title201 = "A".repeat(201);
    const result4 = validateApplicationInput(
      title201,
      "申請内容が50文字以上となるように記載します。これで50文字以上の申請内容となります。",
      "補助金申請",
      "研究推進課",
      "通常"
    );
    expect(result4.isValid).toBe(false);
    expect(result4.errors).toEqual(["申請書類のタイトルは10文字以上200文字以内で入力してください"]);

    // エラーケース: 申請内容49文字（境界値未満）
    const content49 = "A".repeat(49);
    expect(() => validateApplicationInput(
      "有効なタイトル",
      content49,
      "補助金申請",
      "研究推進課",
      "通常"
    )).toThrow("申請内容は50文字以上で詳しく記載してください。");

    // エラーケース: 申請種別未選択
    expect(() => validateApplicationInput(
      "有効なタイトル",
      "申請内容が50文字以上となるように記載します。これで50文字以上の申請内容となります。",
      "",
      "研究推進課",
      "通常"
    )).toThrow("申請種別を選択してください。");

    // エラーケース: 所属部署未選択
    expect(() => validateApplicationInput(
      "有効なタイトル",
      "申請内容が50文字以上となるように記載します。これで50文字以上の申請内容となります。",
      "補助金申請",
      "",
      "通常"
    )).toThrow("所属部署を入力してください。");
  });
});