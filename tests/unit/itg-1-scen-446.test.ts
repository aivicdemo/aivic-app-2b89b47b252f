import { identifyStagnantApplications } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("期限ちょうどの案件の取扱いが適切に判定される", () => {
    // SCEN-446
    const currentDate = new Date("2024-01-15T00:00:00Z");
    
    // 通常案件は3日が基準、補助金関連は5日が基準
    const stagnationThresholds = {
      normal: 3,
      subsidyRelated: 5,
      urgent: 1
    };

    // 期限ちょうど（3日）の通常案件
    const exactThresholdNormalApp = {
      applicationId: "APP-001",
      currentStage: "部長承認",
      stageStartDate: new Date("2024-01-12T00:00:00Z"), // 3日前
      documentType: "一般申請",
      isSubsidyRelated: false
    };

    // 期限ちょうど（5日）の補助金関連案件
    const exactThresholdSubsidyApp = {
      applicationId: "APP-002", 
      currentStage: "理事承認",
      stageStartDate: new Date("2024-01-10T00:00:00Z"), // 5日前
      documentType: "補助金申請",
      isSubsidyRelated: true
    };

    // 期限を1日超過した案件
    const exceededApp = {
      applicationId: "APP-003",
      currentStage: "課長承認", 
      stageStartDate: new Date("2024-01-11T00:00:00Z"), // 4日前
      documentType: "一般申請",
      isSubsidyRelated: false
    };

    // 期限内の案件
    const withinThresholdApp = {
      applicationId: "APP-004",
      currentStage: "部長承認",
      stageStartDate: new Date("2024-01-13T00:00:00Z"), // 2日前
      documentType: "一般申請", 
      isSubsidyRelated: false
    };

    const applicationStatuses = [
      exactThresholdNormalApp,
      exactThresholdSubsidyApp,
      exceededApp,
      withinThresholdApp
    ];

    const result = identifyStagnantApplications(
      applicationStatuses,
      stagnationThresholds,
      currentDate
    );

    // 期限ちょうどは滞留とは判定されない（閾値以下）
    // 期限を超過した案件のみが滞留として抽出される
    expect(result).toEqual([
      {
        applicationId: "APP-003",
        stagnantDays: 4,
        thresholdExceeded: 1,
        urgencyLevel: "low",
        recommendedAction: "メール通知"
      }
    ]);
  });
});