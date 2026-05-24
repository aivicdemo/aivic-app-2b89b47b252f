import { determineNotificationTargets } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("承認結果通知 - 却下時に理由と共に申請者に通知される", () => {
    // SCEN-484
    
    // 却下時の通知対象者特定
    const rejectionResult = determineNotificationTargets(
      "却下",
      {
        applicant_id: "APP001",
        applicant_name: "田中太郎", 
        applicant_department: "総務課",
        document_type: "補助金申請",
        urgency_level: "中"
      },
      {
        id: "APPROVER001",
        name: "承認者A",
        department: "総務課",
        position: "課長"
      },
      {
        subsidyRelated: true,
        moeRequirement: true,
        paperStorageRequired: true
      }
    );

    // 却下時は申請者、直属上司、および事務担当者を主要通知対象とする
    expect(rejectionResult.primaryTargets).toEqual(["APP001", "SUP001", "ADMIN001"]);
    
    // 補助金関連書類の場合は財務課と監査担当部署を副次通知対象に追加
    expect(rejectionResult.secondaryTargets).toEqual(["finance_dept", "audit_dept"]);
    
    // 紙保管が必要な場合は追加で紙文書での通知も行う
    expect(rejectionResult.notificationMethod).toBe("hybrid");
    
    // 監査証跡として通知履歴の保管が必要
    expect(rejectionResult.auditTrailRequired).toBe(true);

    // 通常案件での却下通知対象者特定
    const normalRejectionResult = determineNotificationTargets(
      "却下",
      {
        applicant_id: "APP002",
        applicant_name: "佐藤花子",
        applicant_department: "人事課", 
        document_type: "一般申請",
        urgency_level: "低"
      },
      {
        id: "APPROVER002",
        name: "承認者B",
        department: "人事課",
        position: "部長"
      },
      {
        subsidyRelated: false,
        moeRequirement: false,
        paperStorageRequired: false
      }
    );

    // 非補助金関連の却下時は申請者、直属上司、事務担当者のみ
    expect(normalRejectionResult.primaryTargets).toEqual(["APP002", "SUP002", "ADMIN002"]);
    
    // 補助金関連でないため副次通知対象は空
    expect(normalRejectionResult.secondaryTargets).toEqual([]);
    
    // 電子のみ処理の場合はシステム内通知とメール
    expect(normalRejectionResult.notificationMethod).toBe("electronic");
    
    // 監査証跡保管は不要
    expect(normalRejectionResult.auditTrailRequired).toBe(false);

    // 承認時の通知対象者特定
    const approvalResult = determineNotificationTargets(
      "承認",
      {
        applicant_id: "APP003",
        applicant_name: "鈴木一郎",
        applicant_department: "研究推進課",
        document_type: "補助金申請", 
        urgency_level: "高"
      },
      {
        id: "APPROVER003",
        name: "承認者C",
        department: "研究推進課",
        position: "理事"
      },
      {
        subsidyRelated: true,
        moeRequirement: true,
        paperStorageRequired: true
      }
    );

    // 承認時は申請者と申請者の直属上司を主要通知対象とする
    expect(approvalResult.primaryTargets).toEqual(["APP003", "SUP003"]);
    
    // 緊急度が高い場合は関係部署の部長クラスも副次通知対象に追加
    expect(approvalResult.secondaryTargets).toContain("MGR_研究推進課");
    
    // 補助金関連で緊急度が高い場合も財務課と監査担当部署を通知対象とする
    expect(approvalResult.secondaryTargets).toContain("finance_dept");
    expect(approvalResult.secondaryTargets).toContain("audit_dept");
  });
});