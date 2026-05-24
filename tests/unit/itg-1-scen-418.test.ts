import { validateApplicationInput } from '../../src/logic/it-1-br-2-1-1';

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("申請内容入力検証 - 必須項目が未入力の場合、エラーメッセージが表示される", () => {
    // SCEN-418
    
    // タイトルが空の場合
    expect(() => validateApplicationInput("", "申請書類の詳細内容を記載します。この内容は50文字以上で詳しく記載する必要があります。", "補助金申請", "総務課", "通常")).toThrow("申請書類のタイトルは必須項目です。入力してください。");
    
    // 内容が50文字未満の場合
    expect(() => validateApplicationInput("科研費申請書類", "短い内容", "補助金申請", "総務課", "通常")).toThrow("申請内容は50文字以上で詳しく記載してください。");
    
    // 申請種別が未選択の場合
    expect(() => validateApplicationInput("科研費申請書類", "申請書類の詳細内容を記載します。この内容は50文字以上で詳しく記載する必要があります。", "", "総務課", "通常")).toThrow("申請種別を選択してください。");
    
    // 所属部署が未入力の場合
    expect(() => validateApplicationInput("科研費申請書類", "申請書類の詳細内容を記載します。この内容は50文字以上で詳しく記載する必要があります。", "補助金申請", "", "通常")).toThrow("所属部署を入力してください。");
    
    // タイトルが10文字未満の場合
    expect(() => validateApplicationInput("短い", "申請書類の詳細内容を記載します。この内容は50文字以上で詳しく記載する必要があります。", "補助金申請", "総務課", "通常")).toThrow("申請書類のタイトルは10文字以上200文字以内で入力してください");
    
    // タイトルが200文字を超える場合
    const longTitle = "a".repeat(201);
    expect(() => validateApplicationInput(longTitle, "申請書類の詳細内容を記載します。この内容は50文字以上で詳しく記載する必要があります。", "補助金申請", "総務課", "通常")).toThrow("申請書類のタイトルは10文字以上200文字以内で入力してください");
    
    // 正常なケース
    const validResult = validateApplicationInput("科研費申請書類のタイトル", "申請書類の詳細内容を記載します。この内容は50文字以上で詳しく記載する必要があります。", "補助金申請", "総務課", "通常");
    expect(validResult).toEqual({ isValid: true, errors: [], warnings: [] });
  });
});