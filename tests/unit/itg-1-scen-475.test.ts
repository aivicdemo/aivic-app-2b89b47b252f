import { checkMoeComplianceRequirements } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("非補助金文書で電子のみ処理が選択される", () => {
    // SCEN-475
    const documentTitle = "学内会議室予約システム利用申請";
    const documentContent = "教授会開催のため第一会議室の予約を申請します。開催日時は来月15日の午後2時から午後4時まで、参加予定者は20名です。プロジェクター使用予定。";
    const documentType = "一般事務申請";
    const moeRequirements = ["研究費申請", "補助金申請書", "科研費申請書"];

    const result = checkMoeComplianceRequirements(documentTitle, documentContent, documentType, moeRequirements);

    expect(result).toEqual({
      complianceStatus: "review_required",
      paperStorageRequired: false,
      processingRoute: "electronic",
      riskLevel: "low"
    });
  });
});