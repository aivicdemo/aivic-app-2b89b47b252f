import { identifyStagnantApplications } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("設定期限を超過した案件が正しく抽出される", () => {
    // SCEN-444
    const currentDate = new Date("2024-03-15T10:00:00Z");
    
    const applicationStatuses = [
      {
        applicationId: "APP001",
        currentStage: "部長承認",
        stageStartDate: new Date("2024-03-10T09:00:00Z"),
        documentType: "一般申請",
        isSubsidyRelated: false
      },
      {
        applicationId: "APP002", 
        currentStage: "課長承認",
        stageStartDate: new Date("2024-03-08T14:00:00Z"),
        documentType: "補助金申請",
        isSubsidyRelated: true
      },
      {
        applicationId: "APP003",
        currentStage: "事務局長承認", 
        stageStartDate: new Date("2024-03-13T11:00:00Z"),
        documentType: "一般申請",
        isSubsidyRelated: false
      }
    ];

    const stagnationThresholds = {
      normal: 3,
      subsidyRelated: 5,
      urgent: 2
    };

    const result = identifyStagnantApplications(applicationStatuses, stagnationThresholds, currentDate);

    expect(result).toEqual([
      {
        applicationId: "APP001",
        stagnantDays: 5,
        thresholdExceeded: 2,
        urgencyLevel: "low",
        recommendedAction: "メール通知"
      },
      {
        applicationId: "APP002",
        stagnantDays: 7,
        thresholdExceeded: 2,
        urgencyLevel: "low", 
        recommendedAction: "メール通知"
      }
    ]);
  });
});