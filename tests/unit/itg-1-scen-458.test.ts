import { identifyNotificationRecipient } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("承認者も代理承認者も特定できない場合、エラーが発生する", () => {
    // SCEN-458
    
    // 承認権限者も代理者も特定できない状況をシミュレート
    const applicationId = "APP-001";
    const documentType = "不明な文書種別";
    const currentApprovalStage = "存在しない承認段階";
    const assignedApproverId = "";
    const approverAvailability = false;

    expect(() => 
      identifyNotificationRecipient(
        applicationId,
        documentType,
        currentApprovalStage,
        assignedApproverId,
        approverAvailability
      )
    ).toThrow("催促通知の送信先を特定できません。システム管理者にお問い合わせください。");
  });
});