import { determineNextApprover } from '../../src/logic/it-1-br-2-2-1';

describe('文書種別に応じた承認フロー自動振り分け機能', () => {
  test('承認判断処理ルート決定 - 差戻し時に適切な差戻し先が特定される', () => {
    // SCEN-481

    // 補助金関連書類で差し戻し判断の場合
    const subsidyResult = determineNextApprover(
      "科研費設備導入申請書",
      "本申請は文部科学省科学研究費補助金による研究設備の導入を目的として提出いたします。導入予定設備は高性能分析装置であり、運営費交付金との連携により効果的な研究環境の整備を図ります。",
      "部長",
      "差戻し"
    );

    expect(subsidyResult.nextApprover).toBe(null);
    expect(subsidyResult.processingRoute).toBe("hybrid");
    expect(subsidyResult.isSubsidyRelated).toBe(true);
    expect(subsidyResult.requiresPaperStorage).toBe(true);

    // 一般書類で差し戻し判断の場合
    const generalResult = determineNextApprover(
      "備品購入申請書",
      "事務用品の購入を申請いたします。パソコン関連機器の調達により業務効率化を図る予定です。",
      "課長",
      "差戻し"
    );

    expect(generalResult.nextApprover).toBe(null);
    expect(generalResult.processingRoute).toBe("electronic");
    expect(generalResult.isSubsidyRelated).toBe(false);
    expect(generalResult.requiresPaperStorage).toBe(false);

    // 承認判断の場合
    const approvalResult = determineNextApprover(
      "運営費交付金申請書",
      "文部科学省運営費交付金による教育研究活動の推進を目的とした申請書です。設備整備費として活用し、研究基盤の強化を図ります。",
      "課長",
      "承認"
    );

    expect(approvalResult.nextApprover).toBe("部長");
    expect(approvalResult.processingRoute).toBe("hybrid");
    expect(approvalResult.isSubsidyRelated).toBe(true);
    expect(approvalResult.requiresPaperStorage).toBe(true);
  });
});