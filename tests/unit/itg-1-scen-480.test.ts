import { determineNextApprover } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("承認判断処理ルート決定 - 承認結果に基づいて適切な次の処理先が決定される", () => {
    // SCEN-480

    // 補助金関連文書で承認された場合
    const result1 = determineNextApprover(
      "令和6年度科学研究費補助金申請書",
      "文部科学省科学研究費補助金の基盤研究(A)に応募いたします。研究内容は運営費交付金を活用した設備整備費に関するものです。",
      "課長",
      "承認"
    );

    expect(result1).toEqual({
      nextApprover: "部長",
      processingRoute: "hybrid",
      isSubsidyRelated: true,
      requiresPaperStorage: true
    });

    // 一般事務文書で承認された場合
    const result2 = determineNextApprover(
      "会議室利用申請書",
      "来月の会議のため第一会議室の利用を申請いたします。",
      "係長",
      "承認"
    );

    expect(result2).toEqual({
      nextApprover: "課長",
      processingRoute: "electronic",
      isSubsidyRelated: false,
      requiresPaperStorage: false
    });

    // 補助金関連文書で却下された場合
    const result3 = determineNextApprover(
      "令和6年度運営費交付金申請書",
      "大学の運営費交付金として設備整備費を申請いたします。",
      "部長",
      "却下"
    );

    expect(result3).toEqual({
      nextApprover: null,
      processingRoute: "hybrid",
      isSubsidyRelated: true,
      requiresPaperStorage: true
    });

    // エラーケース: タイトルが空
    expect(() => {
      determineNextApprover("", "内容", "課長", "承認");
    }).toThrow("申請書類のタイトルが入力されていません。タイトルを入力してください。");

    // エラーケース: 承認判断が未選択
    expect(() => {
      determineNextApprover("申請書", "内容", "課長", "");
    }).toThrow("承認・差戻し・却下のいずれかを選択してください。");

    // エラーケース: 承認者役職が不明
    expect(() => {
      determineNextApprover("申請書", "内容", "", "承認");
    }).toThrow("承認者の役職情報が取得できません。システム管理者にお問い合わせください。");
  });
});