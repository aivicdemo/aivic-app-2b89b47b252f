import { determinePriorityForReminder } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("重要度と滞留期間に基づいて適切な優先度が決定される", () => {
    // SCEN-447
    const pendingApplications = [
      {
        applicationId: "APP001",
        delayDays: 8,
        approverLevel: 3,
        documentImportance: 7,
        applicantDepartment: "研究推進課"
      },
      {
        applicationId: "APP002", 
        delayDays: 5,
        approverLevel: 2,
        documentImportance: 6,
        applicantDepartment: "総務課"
      },
      {
        applicationId: "APP003",
        delayDays: 3,
        approverLevel: 4,
        documentImportance: 5,
        applicantDepartment: "財務課"
      }
    ];

    const priorityWeights = {
      delayWeight: 5,
      levelWeight: 2,
      importanceWeight: 3
    };

    const result = determinePriorityForReminder(pendingApplications, priorityWeights);

    expect(result).toEqual([
      {
        applicationId: "APP001",
        priorityScore: 61,
        reminderUrgency: "medium"
      },
      {
        applicationId: "APP002",
        priorityScore: 47,
        reminderUrgency: "low"
      },
      {
        applicationId: "APP003",
        priorityScore: 38,
        reminderUrgency: "low"
      }
    ]);
  });
});