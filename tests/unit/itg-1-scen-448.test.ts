import { determinePriorityForReminder } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("同一優先度の案件について適切な順序が決定される", () => {
    // SCEN-448
    const pendingApplications = [
      {
        applicationId: "APP001",
        delayDays: 3,
        approverLevel: 2,
        documentImportance: 5,
        applicantDepartment: "総務課"
      },
      {
        applicationId: "APP002", 
        delayDays: 3,
        approverLevel: 2,
        documentImportance: 6,
        applicantDepartment: "経理課"
      },
      {
        applicationId: "APP003",
        delayDays: 4,
        approverLevel: 1,
        documentImportance: 4,
        applicantDepartment: "人事課"
      },
      {
        applicationId: "APP004",
        delayDays: 2,
        approverLevel: 3,
        documentImportance: 7,
        applicantDepartment: "学務課"
      }
    ];

    const priorityWeights = {
      delayWeight: 10,
      levelWeight: 5,
      importanceWeight: 3
    };

    const result = determinePriorityForReminder(pendingApplications, priorityWeights);

    expect(result).toEqual([
      {
        applicationId: "APP003",
        priorityScore: 45,
        reminderUrgency: "medium"
      },
      {
        applicationId: "APP002",
        priorityScore: 43,
        reminderUrgency: "medium"
      },
      {
        applicationId: "APP001",
        priorityScore: 40,
        reminderUrgency: "low"
      },
      {
        applicationId: "APP004",
        priorityScore: 36,
        reminderUrgency: "low"
      }
    ]);
  });
});