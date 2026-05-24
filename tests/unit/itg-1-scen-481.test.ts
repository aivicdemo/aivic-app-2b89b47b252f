import { determineNextApprover } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("差戻し時に適切な差戻し先が特定される", () => {
    // SCEN-481

    // 補助金関連書類で差戻し判断の場合
    const result1 = determineNextApprover(
      "令和5年度科学研究費補助金申請書",
      "文部科学省科学研究費補助金の申請に関する資料一式です。研究計画書、予算書、業績リストを添付いたします。",
      "部長",
      "差し戻し"
    );

    expect(result1.nextApprover).toBe("課長");
    expect(result1.processingRoute).toBe("hybrid");
    expect(result1.isSubsidyRelated).toBe(true);
    expect(result1.requiresPaperStorage).toBe(true);

    // 一般申請で差戻し判断の場合
    const result2 = determineNextApprover(
      "事務用品購入申請書",
      "プリンター用紙およびファイル等の事務用品を購入したく申請いたします。",
      "課長",
      "差し戻し"
    );

    expect(result2.nextApprover).toBe("係長");
    expect(result2.processingRoute).toBe("electronic");
    expect(result2.isSubsidyRelated).toBe(false);
    expect(result2.requiresPaperStorage).toBe(false);

    // 理事レベルから差戻しの場合
    const result3 = determineNextApprover(
      "運営費交付金設備整備計画書",
      "文部科学省運営費交付金による設備整備に関する計画書です。予算規模は5000万円を予定しています。",
      "理事",
      "差し戻し"
    );

    expect(result3.nextApprover).toBe("部長");
    expect(result3.processingRoute).toBe("hybrid");
    expect(result3.isSubsidyRelated).toBe(true);
    expect(result3.requiresPaperStorage).toBe(true);

    // 承認の場合（差戻しではない）
    const result4 = determineNextApprover(
      "研究費申請書",
      "学内研究費の申請を行います。研究期間は2年間を予定しております。",
      "部長",
      "承認"
    );

    expect(result4.nextApprover).toBe("理事");
    expect(result4.processingRoute).toBe("electronic");
    expect(result4.isSubsidyRelated).toBe(false);
    expect(result4.requiresPaperStorage).toBe(false);

    // エラーケース：タイトルが空
    expect(() => {
      determineNextApprover(
        "",
        "申請内容です",
        "部長",
        "差し戻し"
      );
    }).toThrow("申請書類のタイトルが入力されていません。タイトルを入力してください。");

    // エラーケース：承認判断が未選択
    expect(() => {
      determineNextApprover(
        "申請書類タイトル",
        "申請内容です",
        "部長",
        ""
      );
    }).toThrow("承認・差戻し・却下のいずれかを選択してください。");

    // エラーケース：承認者の役職が不明
    expect(() => {
      determineNextApprover(
        "申請書類タイトル",
        "申請内容です",
        "",
        "差し戻し"
      );
    }).toThrow("承認者の役職情報が取得できません。システム管理者にお問い合わせください。");
  });
});