import { validateApplicationBeforeSubmission } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("処理ルートの整合性に問題がある場合、エラーメッセージが表示される", () => {
    // SCEN-431
    const documentTitle = "科研費による研究設備導入申請書";
    const documentContent = "文部科学省科学研究費助成事業による実験装置購入に関する申請を行います。";
    const documentType = "subsidy";
    const processingRoute = "electronic";
    const approvalRoute = ["課長", "部長"];
    const requiredFields = {
      applicantName: "田中太郎",
      department: "理学部",
      amount: "5000000"
    };

    const result = validateApplicationBeforeSubmission(
      documentTitle,
      documentContent,
      documentType,
      processingRoute,
      approvalRoute,
      requiredFields
    );

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("補助金関連書類はハイブリッド処理が必要です");
    expect(result.warnings).toEqual([]);
  });
});