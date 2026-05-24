import { determineNextApprover } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("差戻し時に適切な差戻し先が特定される", () => {
    // SCEN-481
    
    // 補助金関連書類で差戻し判断が下された場合
    const result1 = determineNextApprover(
      "科研費申請書",
      "本申請は文部科学省科学研究費助成事業における基盤研究(C)の申請であり、研究期間3年間で総額300万円の予算を要求するものです。",
      "部長",
      "差戻し"
    );
    
    expect(result1).toEqual({
      nextApprover: null,
      processingRoute: "hybrid",
      isSubsidyRelated: true,
      requiresPaperStorage: true
    });

    // 一般書類で差戻し判断が下された場合
    const result2 = determineNextApprover(
      "設備購入申請書",
      "研究室のパソコン更新のため、デスクトップPC5台の購入を申請します。",
      "課長",
      "差戻し"
    );
    
    expect(result2).toEqual({
      nextApprover: null,
      processingRoute: "electronic",
      isSubsidyRelated: false,
      requiresPaperStorage: false
    });

    // 承認判断の場合は次の承認者が設定される
    const result3 = determineNextApprover(
      "運営費交付金申請書",
      "大学の運営費交付金による設備整備費の申請を行います。文部科学省の定める要件に従い適切に処理してください。",
      "課長",
      "承認"
    );
    
    expect(result3).toEqual({
      nextApprover: "部長",
      processingRoute: "hybrid", 
      isSubsidyRelated: true,
      requiresPaperStorage: true
    });
  });
});