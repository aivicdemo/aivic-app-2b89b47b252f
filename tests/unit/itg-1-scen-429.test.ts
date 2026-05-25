import { validateApplicationBeforeSubmission } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("すべての検証項目を満たす場合、申請が正常に提出される", () => {
    // SCEN-429
    const documentTitle = "科学研究費助成事業の設備購入申請について";
    const documentContent = "本申請は文部科学省の科学研究費助成事業における研究設備の購入に関するものです。購入予定の研究機器は分析装置であり、研究の推進に必要不可欠な設備です。";
    const documentType = "補助金申請書";
    const processingRoute = "hybrid";
    const approvalRoute = ["課長", "部長", "事務局長"];
    const requiredFields = {
      "申請者名": "田中太郎",
      "所属部署": "理学部",
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

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });
});