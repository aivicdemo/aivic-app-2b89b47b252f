import { validateApplicationBeforeSubmission } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("すべての検証項目を満たす申請書類が正常に提出される", () => {
    // SCEN-429
    const documentTitle = "令和6年度科学研究費助成事業申請書";
    const documentContent = "本研究は、地域社会の持続可能な発展を目指し、環境保護と経済発展の両立を図る新しいアプローチを提案するものです。具体的には、地域資源を活用した循環型経済システムの構築を通じて、住民の生活の質の向上と環境負荷の軽減を同時に実現することを目的としています。";
    const documentType = "subsidy";
    const processingRoute = "hybrid";
    const approvalRoute = ["課長", "部長", "事務局長"];
    const requiredFields = {
      "申請者名": "田中太郎",
      "所属部署": "研究推進課",
      "申請金額": "5000000",
      "実施期間": "2024年4月1日～2025年3月31日"
    };

    const result = validateApplicationBeforeSubmission(
      documentTitle,
      documentContent,
      documentType,
      processingRoute,
      approvalRoute,
      requiredFields
    );

    expect(result).toEqual({
      isValid: true,
      errors: [],
      warnings: []
    });
  });
});