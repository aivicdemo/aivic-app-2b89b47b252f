import { identifyStagnantApplications } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  // SCEN-445
  test("滞留案件抽出 - 期限内の案件は滞留案件として抽出されない", () => {
    const currentDate = new Date("2024-03-15T10:00:00Z");
    
    const applicationStatuses = [
      {
        applicationId: "APP-001",
        currentStage: "承認待ち",
        stageStartDate: new Date("2024-03-13T09:00:00Z"),
        documentType: "一般申請",
        isSubsidyRelated: false
      },
      {
        applicationId: "APP-002", 
        currentStage: "承認待ち",
        stageStartDate: new Date("2024-03-14T14:00:00Z"),
        documentType: "補助金申請",
        isSubsidyRelated: true
      },
      {
        applicationId: "APP-003",
        currentStage: "承認待ち", 
        stageStartDate: new Date("2024-03-12T08:00:00Z"),
        documentType: "一般申請",
        isSubsidyRelated: false
      }
    ];

    const stagnationThresholds = {
      normal: 3,
      subsidyRelated: 2,
      urgent: 1
    };

    const result = identifyStagnantApplications(applicationStatuses, stagnationThresholds, currentDate);

    // APP-001: 2日経過、閾値3日 → 滞留なし
    // APP-002: 1日経過、閾値2日 → 滞留なし  
    // APP-003: 3日経過、閾値3日 → 滞留なし（閾値ちょうどは滞留判定外）
    expect(result).toEqual([]);
  });
});