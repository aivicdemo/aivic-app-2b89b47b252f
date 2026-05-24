import { determineNextApprover } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("承認判断の結果に基づいて適切な次の承認者および処理ルートを自動決定する", () => {
    // SCEN-480

    // 補助金関連で紙保管必要な申請書類の承認判断の場合
    const result1 = determineNextApprover(
      "科研費申請に関する設備整備費補助金申請書",
      "本申請は文部科学省が定める科研費における設備整備費の補助金申請に関するものです。運営費交付金との連携により、研究設備の充実を図ることを目的としています。",
      "課長",
      "承認"
    );
    
    const keywordScore1 = 0.85; // 科研費、補助金、文部科学省、運営費交付金のキーワード含有率
    expect(result1).toEqual({
      nextApprover: "部長",
      processingRoute: "hybrid",
      isSubsidyRelated: true,
      requiresPaperStorage: true
    });

    // 一般事務書類の承認判断の場合
    const result2 = determineNextApprover(
      "職員の出張申請書",
      "来月開催される学会への出張に関する申請書類です。交通費と宿泊費の支給を申請いたします。",
      "係長",
      "承認"
    );
    
    const keywordScore2 = 0.2; // 補助金関連キーワードの含有率が低い
    expect(result2).toEqual({
      nextApprover: "課長",
      processingRoute: "electronic",
      isSubsidyRelated: false,
      requiresPaperStorage: false
    });

    // 補助金関連だが紙保管不要な申請書類の承認判断の場合
    const result3 = determineNextApprover(
      "研究活動報告書の提出について",
      "科研費による研究活動の中間報告書を提出いたします。研究進捗状況と今後の計画について記載しています。",
      "課長",
      "差戻し"
    );
    
    const keywordScore3 = 0.75; // 科研費キーワードあり
    expect(result3).toEqual({
      nextApprover: null,
      processingRoute: "electronic",
      isSubsidyRelated: true,
      requiresPaperStorage: false
    });

    // エラーケース: 申請書類のタイトルが空の場合
    expect(() => {
      determineNextApprover(
        "",
        "申請内容が記載されています",
        "課長",
        "承認"
      );
    }).toThrow("申請書類のタイトルが入力されていません。タイトルを入力してください。");

    // エラーケース: 承認判断が選択されていない場合
    expect(() => {
      determineNextApprover(
        "設備購入申請書",
        "研究用設備の購入に関する申請です",
        "課長",
        ""
      );
    }).toThrow("承認・差戻し・却下のいずれかを選択してください。");

    // エラーケース: 現在の承認者の役職が不明な場合
    expect(() => {
      determineNextApprover(
        "設備購入申請書",
        "研究用設備の購入に関する申請です",
        "",
        "承認"
      );
    }).toThrow("承認者の役職情報が取得できません。システム管理者にお問い合わせください。");
  });
});