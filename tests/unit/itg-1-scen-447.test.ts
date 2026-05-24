import { determinePriorityForReminder } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("滞留期間、承認者レベル、重要度に基づく催促優先度判定", () => {
    // SCEN-447

    const priorityWeights = { delayWeight: 10, levelWeight: 5, importanceWeight: 15 };

    // 高優先度ケース: 滞留10日、レベル3、重要度5
    const highPriorityApplication = [
      {
        applicationId: "APP001",
        delayDays: 10,
        approverLevel: 3,
        documentImportance: 5,
        applicantDepartment: "研究推進課"
      }
    ];

    const highResult = determinePriorityForReminder(highPriorityApplication, priorityWeights);
    const expectedHighScore = 10 * 10 + 3 * 5 + 5 * 15;
    expect(highResult).toEqual([{
      applicationId: "APP001",
      priorityScore: expectedHighScore,
      reminderUrgency: "high"
    }]);

    // 中優先度ケース: 滞留5日、レベル2、重要度3
    const mediumPriorityApplication = [
      {
        applicationId: "APP002",
        delayDays: 5,
        approverLevel: 2,
        documentImportance: 3,
        applicantDepartment: "総務課"
      }
    ];

    const mediumResult = determinePriorityForReminder(mediumPriorityApplication, priorityWeights);
    const expectedMediumScore = 5 * 10 + 2 * 5 + 3 * 15;
    expect(mediumResult).toEqual([{
      applicationId: "APP002",
      priorityScore: expectedMediumScore,
      reminderUrgency: "medium"
    }]);

    // 低優先度ケース: 滞留2日、レベル1、重要度1
    const lowPriorityApplication = [
      {
        applicationId: "APP003",
        delayDays: 2,
        approverLevel: 1,
        documentImportance: 1,
        applicantDepartment: "会計課"
      }
    ];

    const lowResult = determinePriorityForReminder(lowPriorityApplication, priorityWeights);
    const expectedLowScore = 2 * 10 + 1 * 5 + 1 * 15;
    expect(lowResult).toEqual([{
      applicationId: "APP003",
      priorityScore: expectedLowScore,
      reminderUrgency: "low"
    }]);

    // 複数案件の優先度順ソート
    const multipleApplications = [
      {
        applicationId: "APP004",
        delayDays: 3,
        approverLevel: 2,
        documentImportance: 2,
        applicantDepartment: "教務課"
      },
      {
        applicationId: "APP005",
        delayDays: 8,
        approverLevel: 4,
        documentImportance: 6,
        applicantDepartment: "研究推進課"
      }
    ];

    const multipleResult = determinePriorityForReminder(multipleApplications, priorityWeights);
    const score4 = 3 * 10 + 2 * 5 + 2 * 15;
    const score5 = 8 * 10 + 4 * 5 + 6 * 15;
    
    expect(multipleResult).toEqual([
      {
        applicationId: "APP005",
        priorityScore: score5,
        reminderUrgency: "high"
      },
      {
        applicationId: "APP004",
        priorityScore: score4,
        reminderUrgency: "medium"
      }
    ]);

    // エラーケース
    expect(() => determinePriorityForReminder([], priorityWeights))
      .toThrow("催促対象となる滞留案件が存在しません。承認進捗を再確認してください。");

    const invalidWeights = { delayWeight: -5, levelWeight: 10, importanceWeight: 15 };
    expect(() => determinePriorityForReminder(highPriorityApplication, invalidWeights))
      .toThrow("優先度計算の重み係数に無効な値が設定されています。システム管理者にお問い合わせください。");
  });
});