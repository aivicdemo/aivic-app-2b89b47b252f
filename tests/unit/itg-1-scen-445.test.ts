import { identifyStagnantApplications } from '../../src/logic/it-1-br-1-2-1';

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("期限内の案件は滞留案件として抽出されない", () => {
    // SCEN-445
    const currentDate = new Date('2024-01-15T10:00:00Z');
    
    // 期限内の案件（1日経過、閾値は3日）
    const applicationStatuses = [
      {
        applicationId: 'APP-001',
        currentStage: '部長承認',
        stageStartDate: new Date('2024-01-14T10:00:00Z'), // 1日前
        documentType: '一般申請',
        isSubsidyRelated: false
      },
      {
        applicationId: 'APP-002', 
        currentStage: '課長承認',
        stageStartDate: new Date('2024-01-13T10:00:00Z'), // 2日前
        documentType: '補助金申請',
        isSubsidyRelated: true
      }
    ];
    
    const stagnationThresholds = {
      normal: 3,
      subsidyRelated: 5,
      urgent: 1
    };
    
    const result = identifyStagnantApplications(
      applicationStatuses,
      stagnationThresholds,
      currentDate
    );
    
    // 期限内のため滞留案件として抽出されない
    expect(result).toEqual([]);
  });
});