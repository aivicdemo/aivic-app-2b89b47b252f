import { identifyStagnantApplications } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("期限ちょうどの案件が適切に滞留案件として判定される", () => {
    // SCEN-446
    const currentDate = new Date("2024-01-15T09:00:00Z");
    
    // 通常案件で5日ちょうど経過した案件
    const applicationStatuses = [
      {
        applicationId: "APP001",
        currentStage: "部長承認",
        stageStartDate: new Date("2024-01-10T09:00:00Z"),
        documentType: "一般申請",
        isSubsidyRelated: false
      },
      // 補助金関連で7日ちょうど経過した案件
      {
        applicationId: "APP002", 
        currentStage: "課長承認",
        stageStartDate: new Date("2024-01-08T09:00:00Z"),
        documentType: "補助金申請",
        isSubsidyRelated: true
      },
      // 基準未満の案件
      {
        applicationId: "APP003",
        currentStage: "事務確認", 
        stageStartDate: new Date("2024-01-12T09:00:00Z"),
        documentType: "一般申請",
        isSubsidyRelated: false
      }
    ];

    const stagnationThresholds = {
      normal: 5,
      subsidyRelated: 7,
      urgent: 3
    };

    const result = identifyStagnantApplications(applicationStatuses, stagnationThresholds, currentDate);

    // 期限ちょうどの案件は滞留案件として判定される
    expect(result).toEqual([
      {
        applicationId: "APP001",
        stagnantDays: 5,
        thresholdExceeded: 0,
        urgencyLevel: "low",
        recommendedAction: "メール通知"
      },
      {
        applicationId: "APP002", 
        stagnantDays: 7,
        thresholdExceeded: 0,
        urgencyLevel: "low", 
        recommendedAction: "メール通知"
      }
    ]);
  });
});