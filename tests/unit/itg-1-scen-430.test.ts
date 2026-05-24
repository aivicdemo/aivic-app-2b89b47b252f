import { validateApplicationBeforeSubmission } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("SCEN-430: 申請書類提出検証 - 検証項目に不備がある場合、提出が阻止される", () => {
    // ケース1: 申請書類のタイトルが空の場合
    const requiredFields1 = { applicantName: "田中太郎", department: "総務課" };
    expect(() => validateApplicationBeforeSubmission(
      "",
      "申請内容の詳細説明文",
      "補助金申請",
      "hybrid",
      ["事務局長"],
      requiredFields1
    )).toThrow("申請書類のタイトルを入力してください");

    // ケース2: 申請内容が10文字未満の場合
    const requiredFields2 = { applicantName: "田中太郎", department: "総務課" };
    expect(() => validateApplicationBeforeSubmission(
      "設備購入申請書",
      "短い内容",
      "設備申請",
      "electronic",
      ["課長"],
      requiredFields2
    )).toThrow("申請内容を10文字以上で入力してください");

    // ケース3: 必須項目が入力されていない場合
    const requiredFields3 = { applicantName: "", department: "総務課" };
    const result1 = validateApplicationBeforeSubmission(
      "研究費申請書",
      "研究費の申請に関する詳細な内容説明",
      "研究費申請",
      "hybrid",
      ["部長"],
      requiredFields3
    );
    expect(result1.isValid).toBe(false);
    expect(result1.errors).toEqual(["必須項目「applicantName」を入力してください"]);

    // ケース4: 補助金関連書類で処理ルートが電子のみに設定されている場合
    const requiredFields4 = { applicantName: "田中太郎", department: "総務課" };
    expect(() => validateApplicationBeforeSubmission(
      "科研費申請書",
      "科学研究費助成事業への申請書類です",
      "subsidy",
      "electronic",
      ["事務局長"],
      requiredFields4
    )).toThrow("補助金関連書類はハイブリッド処理が必要です");

    // ケース5: 承認者が設定されていない場合
    const requiredFields5 = { applicantName: "田中太郎", department: "総務課" };
    expect(() => validateApplicationBeforeSubmission(
      "物品購入申請書",
      "事務用品の購入に関する申請です",
      "物品購入",
      "electronic",
      [],
      requiredFields5
    )).toThrow("承認者を1名以上設定してください");

    // ケース6: 正常なケース（すべての項目が適切に入力されている）
    const requiredFields6 = { applicantName: "田中太郎", department: "総務課" };
    const result2 = validateApplicationBeforeSubmission(
      "設備購入申請書",
      "研究用設備の購入に関する詳細な申請内容です",
      "設備申請",
      "electronic",
      ["課長", "部長"],
      requiredFields6
    );
    expect(result2.isValid).toBe(true);
    expect(result2.errors).toEqual([]);
    expect(result2.warnings).toEqual([]);
  });
});