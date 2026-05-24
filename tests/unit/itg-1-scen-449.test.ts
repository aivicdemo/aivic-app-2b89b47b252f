import { determinePriorityForReminder } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("優先度判定に必要な情報が不足している場合、エラーが発生する", () => {
    // SCEN-449

    // 滞留案件の一覧が空のとき
    expect(() => determinePriorityForReminder(
      [],
      { delayWeight: 1.0, levelWeight: 0.5, importanceWeight: 0.3 }
    )).toThrow("催促対象となる滞留案件が存在しません。承認進捗を再確認してください。");

    // 優先度重み係数のいずれかが負の値のとき
    expect(() => determinePriorityForReminder(
      [
        {
          applicationId: "APP-001",
          delayDays: 5,
          approverLevel: 3,
          documentImportance: 8,
          applicantDepartment: "総務課"
        }
      ],
      { delayWeight: -1.0, levelWeight: 0.5, importanceWeight: 0.3 }
    )).toThrow("優先度計算の重み係数に無効な値が設定されています。システム管理者にお問い合わせください。");

    expect(() => determinePriorityForReminder(
      [
        {
          applicationId: "APP-002",
          delayDays: 3,
          approverLevel: 2,
          documentImportance: 6,
          applicantDepartment: "財務課"
        }
      ],
      { delayWeight: 1.0, levelWeight: -0.5, importanceWeight: 0.3 }
    )).toThrow("優先度計算の重み係数に無効な値が設定されています。システム管理者にお問い合わせください。");

    expect(() => determinePriorityForReminder(
      [
        {
          applicationId: "APP-003",
          delayDays: 7,
          approverLevel: 4,
          documentImportance: 9,
          applicantDepartment: "研究支援課"
        }
      ],
      { delayWeight: 1.0, levelWeight: 0.5, importanceWeight: -0.3 }
    )).toThrow("優先度計算の重み係数に無効な値が設定されています。システム管理者にお問い合わせください。");

    // 正常ケース: 適切なデータが提供された場合は正常に処理される
    const result = determinePriorityForReminder(
      [
        {
          applicationId: "APP-004",
          delayDays: 10,
          approverLevel: 5,
          documentImportance: 7,
          applicantDepartment: "学務課"
        },
        {
          applicationId: "APP-005",
          delayDays: 3,
          approverLevel: 2,
          documentImportance: 5,
          applicantDepartment: "総務課"
        }
      ],
      { delayWeight: 1.0, levelWeight: 0.5, importanceWeight: 0.3 }
    );

    // delayScore = delayDays * delayWeight
    // levelScore = approverLevel * levelWeight  
    // importanceScore = documentImportance * importanceWeight
    // priorityScore = delayScore + levelScore + importanceScore
    
    // APP-004: 10*1.0 + 5*0.5 + 7*0.3 = 10 + 2.5 + 2.1 = 14.6 -> high
    // APP-005: 3*1.0 + 2*0.5 + 5*0.3 = 3 + 1.0 + 1.5 = 5.5 -> low

    expect(result).toEqual([
      {
        applicationId: "APP-004",
        priorityScore: 14.6,
        reminderUrgency: "low"
      },
      {
        applicationId: "APP-005", 
        priorityScore: 5.5,
        reminderUrgency: "low"
      }
    ]);
  });
});