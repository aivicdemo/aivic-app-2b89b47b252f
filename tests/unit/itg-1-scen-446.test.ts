import { identifyStagnantApplications } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("期限ちょうどの案件の取扱いが適切に判定される", () => {
    // SCEN-446
    
    // 期限ちょうど（5日目）の案件
    const exactLimitApp = {
      applicationId: "APP-001",
      currentStage: "approval_pending",
      stageStartDate: new Date("2024-01-01"),
      documentType: "general",
      isSubsidyRelated: false
    };

    // 期限超過（6日目）の案件
    const exceededApp = {
      applicationId: "APP-002", 
      currentStage: "approval_pending",
      stageStartDate: new Date("2023-12-31"),
      documentType: "general",
      isSubsidyRelated: false
    };

    // 期限内（4日目）の案件
    const withinLimitApp = {
      applicationId: "APP-003",
      currentStage: "approval_pending", 
      stageStartDate: new Date("2024-01-02"),
      documentType: "general",
      isSubsidyRelated: false
    };

    const applicationStatuses = [exactLimitApp, exceededApp, withinLimitApp];
    
    const stagnationThresholds = {
      normal: 5,
      subsidyRelated: 3,
      urgent: 2
    };

    const currentDate = new Date("2024-01-06");

    const result = identifyStagnantApplications(applicationStatuses, stagnationThresholds, currentDate);

    // 期限超過の案件のみが滞留案件として判定される
    expect(result.length).toBe(1);
    expect(result[0].applicationId).toBe("APP-002");
    expect(result[0].stagnantDays).toBe(6);
    expect(result[0].thresholdExceeded).toBe(1);
    expect(result[0].urgencyLevel).toBe("low");
    expect(result[0].recommendedAction).toBe("メール通知");
  });
});