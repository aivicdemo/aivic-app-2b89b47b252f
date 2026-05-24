import { determinePriorityForReminder } from '../../src/logic/it-1-br-1-2-1';

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("同一優先度スコアの案件が複数ある場合、処理順序で適切に並び替えられる", () => {
    // SCEN-448
    const pendingApplications = [
      {
        applicationId: "APP-001",
        delayDays: 5,
        approverLevel: 3,
        documentImportance: 7,
        applicantDepartment: "総務課"
      },
      {
        applicationId: "APP-002", 
        delayDays: 7,
        approverLevel: 2,
        documentImportance: 6,
        applicantDepartment: "財務課"
      },
      {
        applicationId: "APP-003",
        delayDays: 6,
        approverLevel: 3,
        documentImportance: 6,
        applicantDepartment: "学務課"
      }
    ];

    const priorityWeights = {
      delayWeight: 5,
      levelWeight: 10,
      importanceWeight: 8
    };

    const result = determinePriorityForReminder(pendingApplications, priorityWeights);

    expect(result).toEqual([
      {
        applicationId: "APP-001",
        priorityScore: 111,
        reminderUrgency: "high"
      },
      {
        applicationId: "APP-002",
        priorityScore: 103,
        reminderUrgency: "high"
      },
      {
        applicationId: "APP-003",
        priorityScore: 98,
        reminderUrgency: "high"
      }
    ]);
  });
});