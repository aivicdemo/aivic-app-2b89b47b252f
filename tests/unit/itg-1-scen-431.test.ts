import { validateApplicationBeforeSubmission } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("処理ルートの整合性に問題がある場合、エラーメッセージが表示される", () => {
    // SCEN-431

    // 補助金関連書類で処理ルートが電子のみに設定されている場合（整合性エラー）
    expect(() => 
      validateApplicationBeforeSubmission(
        "科研費研究計画書提出申請",
        "文部科学省科学研究費助成事業における基盤研究（C）の研究計画書を提出いたします。",
        "subsidy",
        "electronic",
        ["課長", "部長"],
        { applicantName: "山田太郎", researchTitle: "人工知能研究" }
      )
    ).toThrow("補助金関連書類は紙保管が必要なため、ハイブリッド処理を選択してください");

    // 申請書類のタイトルが空の場合（必須項目エラー）
    expect(() =>
      validateApplicationBeforeSubmission(
        "",
        "申請内容の詳細説明が含まれています。",
        "general",
        "electronic",
        ["課長"],
        { applicantName: "佐藤花子" }
      )
    ).toThrow("申請書類のタイトルを入力してください");

    // 申請内容が10文字未満の場合（最小文字数エラー）
    expect(() =>
      validateApplicationBeforeSubmission(
        "設備購入申請",
        "短い内容",
        "equipment",
        "electronic", 
        ["課長"],
        { applicantName: "田中次郎" }
      )
    ).toThrow("申請内容を10文字以上で入力してください");

    // 承認者が設定されていない場合（必須項目エラー）
    expect(() =>
      validateApplicationBeforeSubmission(
        "研究設備導入申請書",
        "研究活動に必要な設備の導入を申請いたします。詳細な仕様と予算を添付いたします。",
        "research",
        "electronic",
        [],
        { applicantName: "鈴木三郎", equipment: "高性能コンピュータ" }
      )
    ).toThrow("承認者を1名以上設定してください");

    // 正常ケース：補助金関連書類でハイブリッド処理が適切に設定されている場合
    const validResult = validateApplicationBeforeSubmission(
      "文部科学省補助金事業実施報告書",
      "令和5年度における補助金事業の実施状況について報告いたします。",
      "subsidy",
      "hybrid",
      ["課長", "部長", "事務局長"],
      { applicantName: "高橋四郎", projectName: "教育改善プロジェクト", budget: 5000000 }
    );

    expect(validResult).toEqual({
      isValid: true,
      errors: [],
      warnings: []
    });

    // 正常ケース：一般申請書類で電子処理が適切に設定されている場合
    const validGeneralResult = validateApplicationBeforeSubmission(
      "会議室予約申請書",
      "学術セミナー開催のため会議室の予約を申請いたします。",
      "facility",
      "electronic",
      ["課長"],
      { applicantName: "伊藤五郎", eventDate: "2024-03-15", participants: 30 }
    );

    expect(validGeneralResult).toEqual({
      isValid: true,
      errors: [],
      warnings: []
    });
  });
});