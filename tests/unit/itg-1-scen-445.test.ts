import { identifyStagnantApplications } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("期限内の案件は滞留案件として抽出されない", () => {
    // SCEN-445
    const applicationStatuses = [
      {
        applicationId: "APP001",
        currentStage: "承認待ち",
        stageStartDate: new Date("2024-01-10T09:00:00Z"),
        documentType: "一般申請",
        isSubsidyRelated: false
      },
      {
        applicationId: "APP002", 
        currentStage: "承認待ち",
        stageStartDate: new Date("2024-01-12T09:00:00Z"),
        documentType: "補助金申請",
        isSubsidyRelated: true
      },
      {
        applicationId: "APP003",
        currentStage: "承認待ち", 
        stageStartDate: new Date("2024-01-13T09:00:00Z"),
        documentType: "一般申請",
        isSubsidyRelated: false
      }
    ];

    const stagnationThresholds = {
      normal: 5,
      subsidyRelated: 3,
      urgent: 1
    };

    const currentDate = new Date("2024-01-14T09:00:00Z");

    const result = identifyStagnantApplications(applicationStatuses, stagnationThresholds, currentDate);

    expect(result).toEqual([]);
  });
});