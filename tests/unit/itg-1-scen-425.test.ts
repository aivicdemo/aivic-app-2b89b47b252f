import { describe, test, expect } from "@jest/globals";
import { handleDocumentClassificationException } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("判別困難な文書の場合、適切なデフォルトルートが設定される", () => {
    // SCEN-425
    
    const documentTitle = "研究プロジェクト申請";
    const documentContent = "新規研究プロジェクトの実施に関する申請書類です。詳細な研究内容と予算計画を含みます。";
    const autoClassificationResult = null; // 自動分類が失敗した場合
    const staffObjection = null;
    const managerDecision = "一般申請書";

    const result = handleDocumentClassificationException(
      documentTitle,
      documentContent,
      autoClassificationResult,
      staffObjection,
      managerDecision
    );

    expect(result.finalDocumentType).toBe("一般申請書");
    expect(result.processingRoute).toBe("electronic");
    expect(result.exceptionReason).toBe("自動分類失敗により手動判定実施");
    expect(result.learningData).toEqual({
      title: "研究プロジェクト申請",
      content: "新規研究プロジェクトの実施に関する申請書類です。詳細な研究内容と予算計画を含みます。",
      finalType: "一般申請書",
      reason: "自動分類失敗により手動判定実施"
    });
  });
});