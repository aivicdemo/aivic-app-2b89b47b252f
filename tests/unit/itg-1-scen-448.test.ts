import { determinePriorityForReminder } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("同一優先度の案件について適切な順序が決定される", () => {
    // SCEN-448
    const pendingApplications = [
      {
        applicationId: "app-001",
        delayDays: 5,
        approverLevel: 3,
        documentImportance: 4,
        applicantDepartment: "財務課"
      },
      {
        applicationId: "app-002", 
        delayDays: 5,
        approverLevel: 3,
        documentImportance: 4,
        applicantDepartment: "人事課"
      },
      {
        applicationId: "app-003",
        delayDays: 4,
        approverLevel: 4,
        documentImportance: 4,
        applicantDepartment: "総務課"
      }
    ];

    const priorityWeights = {
      delayWeight: 2,
      levelWeight: 3,
      importanceWeight: 1
    };

    const result = determinePriorityForReminder(pendingApplications, priorityWeights);

    const app001Score = 5 * 2 + 3 * 3 + 4 * 1; // 23
    const app002Score = 5 * 2 + 3 * 3 + 4 * 1; // 23
    const app003Score = 4 * 2 + 4 * 3 + 4 * 1; // 24

    expect(result).toEqual([
      {
        applicationId: "app-003",
        priorityScore: 24,
        reminderUrgency: "low"
      },
      {
        applicationId: "app-001",
        priorityScore: 23,
        reminderUrgency: "low"
      },
      {
        applicationId: "app-002",
        priorityScore: 23,
        reminderUrgency: "low"
      }
    ]);
  });
});