import { validateApplicationBeforeSubmission } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("申請書類提出検証で検証項目に不備がある場合、提出が阻止される", () => {
    // SCEN-430
    
    // 不備ケース1: 申請書類のタイトルが空
    const result1 = validateApplicationBeforeSubmission(
      "",
      "申請内容の詳細です。この内容は10文字以上になっています。",
      "subsidy",
      "hybrid", 
      ["事務局長"],
      { applicantName: "田中太郎", amount: "1000000" }
    );
    expect(result1).toEqual({
      isValid: false,
      errors: ["申請書類のタイトルを入力してください"],
      warnings: []
    });

    // 不備ケース2: 申請内容が10文字未満
    const result2 = validateApplicationBeforeSubmission(
      "補助金申請書類のタイトル",
      "短い",
      "general",
      "electronic",
      ["課長"],
      { applicantName: "佐藤花子" }
    );
    expect(result2).toEqual({
      isValid: false,
      errors: ["申請内容を10文字以上で入力してください"],
      warnings: []
    });

    // 不備ケース3: 必須項目が未入力
    const result3 = validateApplicationBeforeSubmission(
      "設備購入申請書類",
      "設備購入に関する申請内容の詳細説明です。",
      "equipment",
      "electronic",
      ["部長"],
      { applicantName: "", amount: "500000" }
    );
    expect(result3).toEqual({
      isValid: false,
      errors: ["必須項目「applicantName」を入力してください"],
      warnings: []
    });

    // 不備ケース4: 補助金関連書類で処理ルートが電子のみ
    const result4 = validateApplicationBeforeSubmission(
      "科研費申請書類",
      "科学研究費補助金の申請に関する詳細な内容です。",
      "subsidy",
      "electronic",
      ["理事"],
      { applicantName: "山田次郎", amount: "2000000" }
    );
    expect(result4).toEqual({
      isValid: false,
      errors: ["補助金関連書類はハイブリッド処理が必要です"],
      warnings: []
    });

    // 不備ケース5: 承認者が設定されていない
    const result5 = validateApplicationBeforeSubmission(
      "研究費申請書類",
      "研究費の申請に関する詳細な内容の説明です。",
      "research",
      "hybrid",
      [],
      { applicantName: "鈴木三郎", amount: "800000" }
    );
    expect(result5).toEqual({
      isValid: false,
      errors: ["承認者を設定してください"],
      warnings: []
    });

    // 複数不備ケース
    const result6 = validateApplicationBeforeSubmission(
      "",
      "短い",
      "subsidy",
      "electronic",
      [],
      { applicantName: "", amount: "1000000" }
    );
    expect(result6).toEqual({
      isValid: false,
      errors: [
        "申請書類のタイトルを入力してください",
        "申請内容を10文字以上で入力してください",
        "必須項目「applicantName」を入力してください",
        "補助金関連書類はハイブリッド処理が必要です",
        "承認者を設定してください"
      ],
      warnings: []
    });

    // 正常ケース（提出可能）
    const result7 = validateApplicationBeforeSubmission(
      "運営費交付金申請書類",
      "大学運営費交付金の申請に関する詳細な内容説明です。",
      "subsidy",
      "hybrid",
      ["事務局長", "理事"],
      { applicantName: "田中太郎", amount: "5000000", department: "総務部" }
    );
    expect(result7).toEqual({
      isValid: true,
      errors: [],
      warnings: []
    });
  });
});