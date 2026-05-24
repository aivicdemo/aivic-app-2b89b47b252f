import { validateApplicationInput } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("申請内容入力検証 - 必須項目が全て入力されている場合、次の処理に進むことができる", () => {
    // SCEN-417
    
    // 正常なケース: 全ての必須項目が適切に入力されている
    const result = validateApplicationInput(
      "科学研究費補助金による研究設備導入申請書", // 10文字以上のタイトル
      "本申請は、文部科学省の科学研究費補助金を活用して、最新の研究設備を導入することにより、研究活動の質的向上を図るものです。導入予定の設備は電子顕微鏡であり、材料科学分野の基礎研究に活用予定です。", // 50文字以上の内容
      "補助金申請", // 申請種別
      "工学部", // 申請者部署
      "通常" // 緊急度
    );
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    
    // 境界値テスト: タイトル10文字ちょうど
    const boundaryResult = validateApplicationInput(
      "1234567890", // ちょうど10文字
      "これは申請書類の内容です。50文字以上の詳細な内容を記載しています。申請の目的と概要について説明します。", // 50文字以上
      "設備申請",
      "理学部",
      "急ぎ"
    );
    
    expect(boundaryResult.isValid).toBe(true);
    expect(boundaryResult.errors).toEqual([]);
    expect(boundaryResult.warnings).toEqual([]);
    
    // エラーケース1: タイトルが空
    expect(() => {
      validateApplicationInput(
        "",
        "十分な文字数の申請内容です。50文字以上で詳しく記載してください。",
        "人事申請",
        "事務局",
        "至急"
      );
    }).toThrow("申請書類のタイトルは必須項目です。入力してください。");
    
    // エラーケース2: 申請内容が50文字未満
    expect(() => {
      validateApplicationInput(
        "有効なタイトル申請書",
        "短い内容",
        "予算申請",
        "総務課",
        "通常"
      );
    }).toThrow("申請内容は50文字以上で詳しく記載してください。");
    
    // エラーケース3: 申請種別が未選択
    expect(() => {
      validateApplicationInput(
        "適切なタイトル申請書類",
        "これは十分な文字数の申請内容です。50文字以上で詳しく記載されています。",
        "",
        "財務課",
        "通常"
      );
    }).toThrow("申請種別を選択してください。");
    
    // エラーケース4: 所属部署が未入力
    expect(() => {
      validateApplicationInput(
        "正しいタイトル申請書",
        "これは十分な文字数の申請内容です。50文字以上で詳しく記載されています。",
        "旅費申請",
        "",
        "通常"
      );
    }).toThrow("所属部署を入力してください。");
  });
});