import { checkMoeComplianceRequirements } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("非補助金文書で電子のみ処理が選択される", () => {
    // SCEN-475
    const documentTitle = "研修会開催に関する申請書";
    const documentContent = "来年度の新入職員研修会を開催するため、会場使用料と講師謝金の予算申請を行います。";
    const applicantDepartment = "人事課";
    
    const result = checkMoeComplianceRequirements(
      documentTitle,
      documentContent,
      applicantDepartment
    );
    
    const keywordScore = 0.1;
    const departmentBonus = 0.0;
    const adjustedScore = keywordScore + departmentBonus;
    const subsidyRelated = false;
    const documentType = "人事関連";
    const paperStorageRequired = false;
    const processingRoute = "electronic";
    
    expect(result.documentType).toBe(documentType);
    expect(result.processingRoute).toBe(processingRoute);
    expect(result.subsidyRelated).toBe(subsidyRelated);
    expect(result.paperStorageRequired).toBe(paperStorageRequired);
  });
});