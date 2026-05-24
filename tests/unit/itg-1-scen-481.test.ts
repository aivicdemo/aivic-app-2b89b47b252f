import { determineNextApprover } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("差戻し時に適切な差戻し先が特定される", () => {
    // SCEN-481
    
    // 補助金関連書類を課長が差戻しする場合
    const result1 = determineNextApprover(
      "科研費申請に関する設備導入計画書",
      "本申請は令和6年度科研費基盤研究による設備整備費補助金を活用した研究機器導入計画について記載したものです。",
      "課長",
      "差戻し"
    );
    
    expect(result1.nextApprover).toBe(null);
    expect(result1.processingRoute).toBe("hybrid");
    expect(result1.isSubsidyRelated).toBe(true);
    expect(result1.requiresPaperStorage).toBe(true);
    
    // 一般書類を部長が差戻しする場合
    const result2 = determineNextApprover(
      "会議室予約申請書",
      "学内会議開催のための会議室使用申請を行います。",
      "部長", 
      "差戻し"
    );
    
    expect(result2.nextApprover).toBe(null);
    expect(result2.processingRoute).toBe("electronic");
    expect(result2.isSubsidyRelated).toBe(false);
    expect(result2.requiresPaperStorage).toBe(false);
    
    // 運営費交付金関連書類を理事が差戻しする場合
    const result3 = determineNextApprover(
      "令和6年度運営費交付金による教育研究設備整備計画",
      "文部科学省運営費交付金を財源とする教育研究基盤設備の整備に関する実施計画書です。",
      "理事",
      "差戻し"
    );
    
    expect(result3.nextApprover).toBe(null);
    expect(result3.processingRoute).toBe("hybrid");
    expect(result3.isSubsidyRelated).toBe(true);
    expect(result3.requiresPaperStorage).toBe(true);
  });
});