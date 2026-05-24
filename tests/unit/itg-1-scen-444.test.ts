import { identifyStagnantApplications } from '../../src/logic/it-1-br-1-2-1';

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("設定期限を超過した滞留案件が正しく抽出される", () => {
    // SCEN-444
    const applicationStatuses = [
      {
        applicationId: "APP001",
        currentStage: "部長承認",
        stageStartDate: new Date("2024-01-01"),
        documentType: "一般申請",
        isSubsidyRelated: false
      },
      {
        applicationId: "APP002", 
        currentStage: "課長承認",
        stageStartDate: new Date("2024-01-15"),
        documentType: "補助金申請",
        isSubsidyRelated: true
      },
      {
        applicationId: "APP003",
        currentStage: "事務承認", 
        stageStartDate: new Date("2024-01-20"),
        documentType: "一般申請",
        isSubsidyRelated: false
      }
    ];

    const stagnationThresholds = {
      normal: 5,
      subsidyRelated: 3,
      urgent: 1
    };

    const currentDate = new Date("2024-01-25");

    const result = identifyStagnantApplications(applicationStatuses, stagnationThresholds, currentDate);

    // APP001: 24日滞留、一般案件（基準5日）→ 19日超過、high緊急度、上司エスカレーション
    // APP002: 10日滞留、補助金関連（基準3日）→ 7日超過、high緊急度、上司エスカレーション  
    // APP003: 5日滞留、一般案件（基準5日）→ 基準内のため抽出されない
    expect(result).toEqual([
      {
        applicationId: "APP001",
        stagnantDays: 24,
        thresholdExceeded: 19,
        urgencyLevel: "high",
        recommendedAction: "上司エスカレーション"
      },
      {
        applicationId: "APP002", 
        stagnantDays: 10,
        thresholdExceeded: 7,
        urgencyLevel: "high",
        recommendedAction: "上司エスカレーション"
      }
    ]);
  });
});