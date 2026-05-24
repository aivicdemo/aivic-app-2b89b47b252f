import { determinePriorityForReminder } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("重要度と滞留期間に基づいて催促対象の優先度が正しく決定される", () => {
    // SCEN-447
    const pendingApplications = [
      {
        applicationId: "app001",
        delayDays: 10,
        approverLevel: 3,
        documentImportance: 9,
        applicantDepartment: "研究推進課"
      },
      {
        applicationId: "app002", 
        delayDays: 5,
        approverLevel: 2,
        documentImportance: 5,
        applicantDepartment: "総務課"
      },
      {
        applicationId: "app003",
        delayDays: 15,
        approverLevel: 4,
        documentImportance: 7,
        applicantDepartment: "財務課"
      }
    ];

    const priorityWeights = {
      delayWeight: 2.0,
      levelWeight: 1.5,
      importanceWeight: 3.0
    };

    const result = determinePriorityForReminder(pendingApplications, priorityWeights);

    // app001の優先度スコア計算: 10*2.0 + 3*1.5 + 9*3.0 = 20 + 4.5 + 27 = 51.5
    // app002の優先度スコア計算: 5*2.0 + 2*1.5 + 5*3.0 = 10 + 3 + 15 = 28
    // app003の優先度スコア計算: 15*2.0 + 4*1.5 + 7*3.0 = 30 + 6 + 21 = 57
    
    expect(result).toEqual([
      {
        applicationId: "app003",
        priorityScore: 57,
        reminderUrgency: "medium"
      },
      {
        applicationId: "app001", 
        priorityScore: 51.5,
        reminderUrgency: "medium"
      },
      {
        applicationId: "app002",
        priorityScore: 28,
        reminderUrgency: "low"
      }
    ]);
  });
});