import { determineNotificationTargets } from '../../src/logic/it-1-br-1779263788059-2-2-1';

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("SCEN-484: 承認結果通知 - 却下時に理由と共に申請者に通知される", () => {
    // 却下された申請の承認結果データ
    const approvalResult = "却下";
    
    // 申請書類の基本情報（申請者、内容、文書種別、緊急度など）
    const applicationData = {
      applicant_id: "user001",
      applicant_name: "田中太郎", 
      department_id: "dept_finance",
      document_type: "補助金申請書",
      urgency_level: "high",
      content: "科研費申請に関する書類",
      amount: 5000000
    };
    
    // 承認者の情報（所属部署、役職、承認権限レベル）
    const approverInfo = {
      approver_id: "mgr001",
      department: "総務部",
      position: "部長", 
      authority_level: "department_head"
    };
    
    // 文書分類情報（補助金関連かどうか、紙保管要否、処理ルート）
    const documentClassification = {
      subsidyRelated: true,
      paperStorageRequired: true,
      processingRoute: "hybrid",
      moeRequirement: true
    };

    // 通知対象決定処理を実行
    const result = determineNotificationTargets(
      approvalResult,
      applicationData,
      approverInfo,
      documentClassification
    );

    // 却下時は申請者、直属上司、事務担当者を主要通知対象とする
    expect(result.primaryTargets).toEqual([
      "user001", // 申請者
      "supervisor_user001", // 申請者の直属上司  
      "admin_dept_finance" // 事務担当者
    ]);

    // 補助金関連書類のため財務課と監査担当部署を副次通知対象に追加
    expect(result.secondaryTargets).toEqual([
      "finance_dept",
      "audit_dept"
    ]);

    // 文部科学省補助金関連で監査証跡保管が必要
    expect(result.auditTrailRequired).toBe(true);

    // 紙保管必要なためハイブリッド通知方法を適用
    expect(result.notificationMethod).toBe("hybrid");
  });
});