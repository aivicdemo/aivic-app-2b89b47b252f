import { validateApplicationBeforeSubmission } from '../../src/logic/it-1-br-1779263788059-2-1-1';

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("補助金関連書類で処理ルートが電子のみに設定されている場合、整合性エラーが表示される", () => {
    // SCEN-431
    
    // 補助金関連書類で処理ルートが電子のみに設定された不整合ケース
    const result = expect(() => 
      validateApplicationBeforeSubmission(
        "科研費申請書", // 補助金関連のタイトル
        "科学研究費助成事業による研究費の申請書です。新しい研究テーマについて予算を申請いたします。", // 補助金関連の内容
        "subsidy", // 補助金文書種別
        "electronic", // 電子のみ処理ルート（不整合）
        ["承認者1", "承認者2"],
        {
          "申請金額": "1000000",
          "研究期間": "2024-04-01から2025-03-31"
        }
      )
    ).toThrow("補助金関連書類は紙保管が必要なため、ハイブリッド処理を選択してください");

    // 正常なハイブリッド処理ルートでの成功ケース
    const validResult = validateApplicationBeforeSubmission(
      "科研費申請書",
      "科学研究費助成事業による研究費の申請書です。新しい研究テーマについて予算を申請いたします。",
      "subsidy",
      "hybrid", // 正しいハイブリッド処理ルート
      ["承認者1", "承認者2"],
      {
        "申請金額": "1000000",
        "研究期間": "2024-04-01から2025-03-31"
      }
    );

    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toEqual([]);
  });
});