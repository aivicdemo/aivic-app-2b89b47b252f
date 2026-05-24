import { validateApplicationInput } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("申請内容の必須項目境界値入力時の検証が適切に動作する", () => {
    // SCEN-419

    // 正常ケース: すべての項目が境界値内
    const validResult = validateApplicationInput(
      "申請書類タイトル例", // 10文字以上200文字以内の境界値
      "申請書類の詳細内容について説明します。この内容は50文字以上で記載されています。", // 50文字以上の境界値
      "補助金申請",
      "総務部",
      "通常"
    );

    expect(validResult).toEqual({
      isValid: true,
      errors: [],
      warnings: []
    });

    // タイトル境界値テスト: 10文字ちょうど
    const titleMin = validateApplicationInput(
      "申請書類テスト", // ちょうど10文字
      "申請書類の詳細内容について説明します。この内容は50文字以上で記載されています。",
      "補助金申請",
      "総務部",
      "通常"
    );

    expect(titleMin).toEqual({
      isValid: true,
      errors: [],
      warnings: []
    });

    // タイトル境界値違反: 9文字
    expect(() => validateApplicationInput(
      "申請書類テ", // 9文字
      "申請書類の詳細内容について説明します。この内容は50文字以上で記載されています。",
      "補助金申請",
      "総務部",
      "通常"
    )).toThrow("申請書類のタイトルは必須項目です。入力してください。");

    // 内容境界値テスト: 50文字ちょうど
    const contentMin = validateApplicationInput(
      "申請書類タイトル例",
      "この申請内容は50文字ちょうどで記載されている内容です。", // ちょうど50文字
      "補助金申請",
      "総務部",
      "通常"
    );

    expect(contentMin).toEqual({
      isValid: true,
      errors: [],
      warnings: []
    });

    // 内容境界値違反: 49文字
    expect(() => validateApplicationInput(
      "申請書類タイトル例",
      "この申請内容は49文字で記載されている内容です。", // 49文字
      "補助金申請",
      "総務部",
      "通常"
    )).toThrow("申請内容は50文字以上で詳しく記載してください。");

    // タイトル空文字
    expect(() => validateApplicationInput(
      "",
      "申請書類の詳細内容について説明します。この内容は50文字以上で記載されています。",
      "補助金申請",
      "総務部",
      "通常"
    )).toThrow("申請書類のタイトルは必須項目です。入力してください。");

    // 申請種別未選択
    expect(() => validateApplicationInput(
      "申請書類タイトル例",
      "申請書類の詳細内容について説明します。この内容は50文字以上で記載されています。",
      "",
      "総務部",
      "通常"
    )).toThrow("申請種別を選択してください。");

    // 所属部署未入力
    expect(() => validateApplicationInput(
      "申請書類タイトル例",
      "申請書類の詳細内容について説明します。この内容は50文字以上で記載されています。",
      "補助金申請",
      "",
      "通常"
    )).toThrow("所属部署を入力してください。");
  });
});