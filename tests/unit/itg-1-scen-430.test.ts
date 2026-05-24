import { validateApplicationBeforeSubmission } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("申請書類提出検証 - 検証項目に不備がある場合、提出が阻止される", () => {
    // SCEN-430
    
    // 必須項目が不足している場合
    const result1 = validateApplicationBeforeSubmission(
      "",
      "申請内容です",
      "general",
      "electronic",
      ["承認者1"],
      { 申請者名: "田中太郎", 申請金額: "" }
    );
    
    expect(result1).toEqual({
      isValid: false,
      errors: ["申請書類のタイトルを入力してください", "必須項目「申請金額」を入力してください"],
      warnings: []
    });
    
    // 申請内容が短すぎる場合
    const result2 = validateApplicationBeforeSubmission(
      "申請書タイトル",
      "短い",
      "general",
      "electronic", 
      ["承認者1"],
      { 申請者名: "田中太郎" }
    );
    
    expect(result2).toEqual({
      isValid: false,
      errors: ["申請内容を10文字以上で入力してください"],
      warnings: []
    });
    
    // 補助金関連書類で処理ルートが電子のみの場合
    const result3 = validateApplicationBeforeSubmission(
      "補助金申請書",
      "補助金申請に関する詳細な内容です",
      "subsidy",
      "electronic",
      ["承認者1"],
      { 申請者名: "田中太郎", 申請金額: "1000000" }
    );
    
    expect(result3).toEqual({
      isValid: false,
      errors: ["補助金関連書類はハイブリッド処理が必要です"],
      warnings: []
    });
    
    // 承認者が設定されていない場合
    const result4 = validateApplicationBeforeSubmission(
      "一般申請書",
      "申請内容の詳細説明です",
      "general",
      "electronic",
      [],
      { 申請者名: "田中太郎", 申請金額: "500000" }
    );
    
    expect(result4).toEqual({
      isValid: false,
      errors: ["承認者を設定してください"],
      warnings: []
    });
    
    // すべての検証をクリアした場合
    const result5 = validateApplicationBeforeSubmission(
      "一般申請書類",
      "適切な申請内容の詳細説明です",
      "general",
      "electronic",
      ["承認者1", "承認者2"],
      { 申請者名: "田中太郎", 申請金額: "500000", 申請部署: "総務課" }
    );
    
    expect(result5).toEqual({
      isValid: true,
      errors: [],
      warnings: []
    });
  });
});