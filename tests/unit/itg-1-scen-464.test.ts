import {
  handleSystemFailureAlternativeProcess,
  validateApplicationBeforeSubmission
} from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム障害時承認継続 - 同期処理でデータ整合性エラーが検出された場合、適切に処理される", () => {
    // SCEN-464
    
    // システム障害時の代替処理テスト
    const systemStatus = "partial_failure";
    const failureType = "data_inconsistency";
    const documentType = "subsidy";
    const urgencyLevel = 9;
    
    const result = handleSystemFailureAlternativeProcess(
      systemStatus,
      failureType,
      documentType,
      urgencyLevel
    );
    
    expect(result.alternativeProcess).toBe("manual_hybrid_mode");
    expect(result.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(result.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(result.estimatedRecoveryTime).toBeGreaterThan(0);
    
    // 同期処理でのデータ整合性チェック
    const documentTitle = "科研費申請書";
    const documentContent = "研究費申請に関する詳細な内容を記載した文書です";
    const processedDocumentType = "補助金申請書";
    const processingRoute = "hybrid";
    const approvalRoute = ["承認者1", "承認者2"];
    const requiredFields = {
      "申請者氏名": "田中太郎",
      "研究期間": "2024年4月〜2025年3月",
      "申請金額": "500万円"
    };
    
    const validationResult = validateApplicationBeforeSubmission(
      documentTitle,
      documentContent,
      processedDocumentType,
      processingRoute,
      approvalRoute,
      requiredFields
    );
    
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errors).toEqual([]);
    expect(validationResult.warnings).toEqual([]);
    
    // データ整合性エラーケース
    const inconsistentProcessingRoute = "electronic";
    
    const errorValidationResult = validateApplicationBeforeSubmission(
      documentTitle,
      documentContent,
      processedDocumentType,
      inconsistentProcessingRoute,
      approvalRoute,
      requiredFields
    );
    
    expect(errorValidationResult.isValid).toBe(false);
    expect(errorValidationResult.errors).toContain("補助金関連書類はハイブリッド処理が必要です");
    
    // 必須項目不備による整合性エラー
    const incompleteFields = {
      "申請者氏名": "",
      "研究期間": "2024年4月〜2025年3月",
      "申請金額": ""
    };
    
    const incompleteValidationResult = validateApplicationBeforeSubmission(
      documentTitle,
      documentContent,
      processedDocumentType,
      processingRoute,
      approvalRoute,
      incompleteFields
    );
    
    expect(incompleteValidationResult.isValid).toBe(false);
    expect(incompleteValidationResult.errors).toContain("必須項目「申請者氏名」を入力してください");
    expect(incompleteValidationResult.errors).toContain("必須項目「申請金額」を入力してください");
  });
});