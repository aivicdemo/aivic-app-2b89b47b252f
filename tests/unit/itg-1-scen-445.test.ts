import { identifyStagnantApplications } from '../../src/logic/it-1-br-1-2-1';

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("SCEN-445: 滞留案件抽出 - 期限内の案件は滞留案件として抽出されない", () => {
    // 現在日時を固定
    const currentDate = new Date("2024-01-15T10:00:00Z");
    
    // 滞留判定基準（日数）
    const stagnationThresholds = {
      normal: 3,
      subsidyRelated: 5,
      urgent: 1
    };
    
    // 申請案件の承認状況データ（すべて期限内）
    const applicationStatuses = [
      {
        applicationId: "APP001",
        currentStage: "部長承認",
        stageStartDate: new Date("2024-01-13T09:00:00Z"), // 2日前（期限内）
        documentType: "一般申請",
        isSubsidyRelated: false
      },
      {
        applicationId: "APP002", 
        currentStage: "課長承認",
        stageStartDate: new Date("2024-01-11T14:00:00Z"), // 4日前だが補助金関連なので期限内
        documentType: "補助金申請",
        isSubsidyRelated: true
      },
      {
        applicationId: "APP003",
        currentStage: "事務局長承認", 
        stageStartDate: new Date("2024-01-14T16:00:00Z"), // 1日前（期限内）
        documentType: "緊急申請",
        isSubsidyRelated: false
      }
    ];
    
    const result = identifyStagnantApplications(applicationStatuses, stagnationThresholds, currentDate);
    
    // 期待結果: すべて期限内のため滞留案件として抽出されない
    expect(result).toEqual([]);
  });
});