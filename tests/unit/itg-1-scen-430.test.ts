import { validateApplicationBeforeSubmission } from '../../src/logic/it-1-br-1779263788059-2-1-1';

describe("申請書類提出検証機能", () => {
  // SCEN-430
  test("検証項目に不備がある場合、提出が阻止される", () => {
    // タイトルが空の場合
    expect(() => validateApplicationBeforeSubmission(
      "",
      "申請内容を詳細に記載した内容です。",
      "一般申請",
      "electronic",
      ["承認者A"],
      { "申請金額": 100000, "実施期間": "2024年4月-6月" }
    )).toThrow("申請書類のタイトルを入力してください");

    // 内容が10文字未満の場合
    expect(() => validateApplicationBeforeSubmission(
      "設備購入申請書",
      "短い内容",
      "一般申請", 
      "electronic",
      ["承認者A"],
      { "申請金額": 100000, "実施期間": "2024年4月-6月" }
    )).toThrow("申請内容を10文字以上で入力してください");

    // 補助金関連書類で処理ルートが電子のみの場合
    expect(() => validateApplicationBeforeSubmission(
      "科研費申請書類",
      "科学研究費助成事業への申請に関する詳細な内容です。",
      "subsidy",
      "electronic",
      ["承認者A"],
      { "申請金額": 1000000, "実施期間": "2024年4月-2025年3月" }
    )).toThrow("補助金関連書類は紙保管が必要なため、ハイブリッド処理を選択してください");

    // 承認者が設定されていない場合
    expect(() => validateApplicationBeforeSubmission(
      "設備購入申請書",
      "新しい研究設備を購入するための申請です。",
      "一般申請",
      "electronic", 
      [],
      { "申請金額": 100000, "実施期間": "2024年4月-6月" }
    )).toThrow("承認者を1名以上設定してください");

    // 必須項目が不足している場合
    const resultWithMissingFields = validateApplicationBeforeSubmission(
      "設備購入申請書",
      "新しい研究設備を購入するための申請です。",
      "一般申請",
      "electronic",
      ["承認者A"],
      { "申請金額": "", "実施期間": "2024年4月-6月" }
    );

    expect(resultWithMissingFields.isValid).toBe(false);
    expect(resultWithMissingFields.errors).toContain("必須項目「申請金額」を入力してください");

    // 正常なケース - すべて適切に設定されている場合
    const validResult = validateApplicationBeforeSubmission(
      "設備購入申請書",
      "新しい研究設備を購入するための申請です。詳細な仕様と必要性について説明します。",
      "一般申請",
      "electronic",
      ["承認者A"],
      { "申請金額": 100000, "実施期間": "2024年4月-6月" }
    );

    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toEqual([]);
    expect(validResult.warnings).toEqual([]);
  });
});