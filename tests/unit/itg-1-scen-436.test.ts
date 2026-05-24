import { processUrgentApplicationPriority } from '../../src/logic/it-1-br-1779263788059-2-2-1';

const fetchMock = require('jest-fetch-mock');

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("緊急案件処理 - 複数の緊急案件がある場合、適切な優先順位が決定される", () => {
    // SCEN-436
    fetchMock.resetMocks();
    
    const currentDate = new Date('2024-01-15T10:00:00Z');
    const applicationData = {
      id: "APP-001",
      title: "災害対応設備申請",
      priority: "high",
      createdAt: new Date('2024-01-13T10:00:00Z'),
      approvalRoute: ["課長", "部長", "事務局長"]
    };
    
    const urgencyFlag = true;
    const deadlineDate = new Date('2024-01-16T17:00:00Z');
    const currentApprovalQueue = [
      { id: "APP-002", priority: "medium" },
      { id: "APP-003", priority: "low" }
    ];

    const result = processUrgentApplicationPriority(
      applicationData,
      urgencyFlag,
      deadlineDate,
      currentApprovalQueue
    );

    expect(result.priorityLevel).toBe(1);
    expect(result.queuePosition).toBe(0);
    expect(result.notificationTargets).toEqual(["課長", "部長", "事務局長"]);
    expect(result.processingDeadline).toEqual(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
  });
});