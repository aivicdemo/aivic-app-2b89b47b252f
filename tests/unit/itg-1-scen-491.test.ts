import { handleDocumentClassificationException } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("文書保管方式選択 - 保管方式判定条件が不明な場合、最も安全な方式が選択される", () => {
    // SCEN-491
    const result = handleDocumentClassificationException(
      "研究費申請書",
      "新規研究プロジェクトの予算申請に関する書類",
      null,
      null,
      "hybrid"
    );

    expect(result.finalDocumentType).toBe("hybrid");
    expect(result.processingRoute).toBe("hybrid");
    expect(result.exceptionReason).toBe("システムによる自動分類が失敗し、職員からの異議もないため、最も安全なハイブリッド処理方式を適用");
    expect(result.learningData).toEqual({
      title: "研究費申請書",
      content: "新規研究プロジェクトの予算申請に関する書類",
      finalClassification: "hybrid",
      reason: "判定条件不明のため安全措置"
    });
  });
});