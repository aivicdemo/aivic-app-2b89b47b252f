import { validateApplicationBeforeSubmission } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("すべての検証項目を満たす申請書類が正常に提出される", () => {
    // SCEN-429
    
    // 正常な申請書類データ
    const documentTitle = "令和5年度科学研究費助成事業申請書";
    const documentContent = "本申請は文部科学省の科学研究費助成事業に基づく研究計画書として提出します。研究目的は量子コンピューティングの実用化に向けた基盤技術の開発であり、3年間の計画で実施予定です。";
    const documentType = "補助金申請書";
    const processingRoute = "hybrid";
    const approvalRoute = ["課長", "部長", "理事"];
    const requiredFields = {
      "申請者名": "田中太郎",
      "研究期間": "2023-04-01から2026-03-31",
      "申請金額": "5000000円",
      "所属部署": "工学部"
    };

    const result = validateApplicationBeforeSubmission(
      documentTitle,
      documentContent,
      documentType,
      processingRoute,
      approvalRoute,
      requiredFields
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });
});