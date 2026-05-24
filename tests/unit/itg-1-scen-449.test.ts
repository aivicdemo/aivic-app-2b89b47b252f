import { determinePriorityForReminder } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("優先度判定に必要な情報が不足している場合、エラーが発生する", () => {
    // SCEN-449
    
    const validApp = {
      applicationId: "APP001",
      delayDays: 5,
      approverLevel: 3,
      documentImportance: 8,
      applicantDepartment: "財務課"
    };

    const priorityWeights = {
      delayWeight: 2.0,
      levelWeight: 1.5,
      importanceWeight: 3.0
    };

    // 正常ケース - 完全な情報
    expect(() => determinePriorityForReminder([validApp], priorityWeights)).not.toThrow();

    // 滞留案件の一覧が空のとき
    expect(() => determinePriorityForReminder([], priorityWeights)).toThrow("催促対象となる滞留案件が存在しません。承認進捗を再確認してください。");

    // 優先度重み係数に負の値が含まれるとき
    const invalidWeights1 = {
      delayWeight: -1.0,
      levelWeight: 1.5,
      importanceWeight: 3.0
    };
    expect(() => determinePriorityForReminder([validApp], invalidWeights1)).toThrow("優先度計算の重み係数に無効な値が設定されています。システム管理者にお問い合わせください。");

    const invalidWeights2 = {
      delayWeight: 2.0,
      levelWeight: -0.5,
      importanceWeight: 3.0
    };
    expect(() => determinePriorityForReminder([validApp], invalidWeights2)).toThrow("優先度計算の重み係数に無効な値が設定されています。システム管理者にお問い合わせください。");

    const invalidWeights3 = {
      delayWeight: 2.0,
      levelWeight: 1.5,
      importanceWeight: -2.0
    };
    expect(() => determinePriorityForReminder([validApp], invalidWeights3)).toThrow("優先度計算の重み係数に無効な値が設定されています。システム管理者にお問い合わせください。");

    // 正常ケース - 優先度計算確認
    const apps = [
      {
        applicationId: "APP001",
        delayDays: 5,
        approverLevel: 3,
        documentImportance: 8,
        applicantDepartment: "財務課"
      },
      {
        applicationId: "APP002", 
        delayDays: 10,
        approverLevel: 2,
        documentImportance: 9,
        applicantDepartment: "総務課"
      }
    ];

    const result = determinePriorityForReminder(apps, priorityWeights);
    
    // APP001: delayScore=10, levelScore=4.5, importanceScore=24, priorityScore=38.5
    // APP002: delayScore=20, levelScore=3, importanceScore=27, priorityScore=50
    expect(result).toEqual([
      {
        applicationId: "APP002",
        priorityScore: 50,
        reminderUrgency: "medium"
      },
      {
        applicationId: "APP001", 
        priorityScore: 38.5,
        reminderUrgency: "low"
      }
    ]);
  });
});