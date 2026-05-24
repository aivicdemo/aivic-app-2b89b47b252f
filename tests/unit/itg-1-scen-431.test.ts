import { validateApplicationBeforeSubmission } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  // SCEN-431
  test("処理ルートの整合性に問題がある場合、エラーメッセージが表示される", () => {
    // 補助金関連書類で処理ルートが電子のみに設定されている不整合ケース
    const result = validateApplicationBeforeSubmission(
      "科研費申請書",
      "文部科学省科学研究費助成事業による研究計画書です",
      "subsidy",
      "electronic",
      ["課長", "部長"],
      {
        申請者名: "田中太郎",
        研究題目: "AI技術の教育応用",
        申請金額: "5000000"
      }
    );

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("補助金関連書類はハイブリッド処理が必要です");
    expect(result.warnings).toEqual([]);
  });
});