import { determinePriorityForReminder } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("優先度判定に必要な情報が不足している場合、エラーが発生する", () => {
    // SCEN-449

    // 滞留案件の一覧が空の場合
    expect(() => determinePriorityForReminder([], { delayWeight: 2, levelWeight: 3, importanceWeight: 4 }))
      .toThrow("催促対象となる滞留案件が存在しません。承認進捗を再確認してください。");

    // 優先度重み係数のdelayWeightが負の値の場合
    const validItems = [
      { applicationId: "APP001", delayDays: 5, approverLevel: 2, documentImportance: 7, applicantDepartment: "総務課" }
    ];
    expect(() => determinePriorityForReminder(validItems, { delayWeight: -1, levelWeight: 3, importanceWeight: 4 }))
      .toThrow("優先度計算の重み係数に無効な値が設定されています。システム管理者にお問い合わせください。");

    // 優先度重み係数のlevelWeightが負の値の場合
    expect(() => determinePriorityForReminder(validItems, { delayWeight: 2, levelWeight: -2, importanceWeight: 4 }))
      .toThrow("優先度計算の重み係数に無効な値が設定されています。システム管理者にお問い合わせください。");

    // 優先度重み係数のimportanceWeightが負の値の場合
    expect(() => determinePriorityForReminder(validItems, { delayWeight: 2, levelWeight: 3, importanceWeight: -1 }))
      .toThrow("優先度計算の重み係数に無効な値が設定されています。システム管理者にお問い合わせください。");

    // 正常な入力での動作確認
    const result = determinePriorityForReminder(validItems, { delayWeight: 2, levelWeight: 3, importanceWeight: 4 });
    
    // 計算式に基づく期待値: delayScore(5*2) + levelScore(2*3) + importanceScore(7*4) = 10 + 6 + 28 = 44
    // priorityScore 44は50未満なので"low"
    expect(result).toEqual([{
      applicationId: "APP001",
      priorityScore: 44,
      reminderUrgency: "low"
    }]);

    // 高優先度ケース（priorityScore >= 80）
    const highPriorityItems = [
      { applicationId: "APP002", delayDays: 15, approverLevel: 5, documentImportance: 8, applicantDepartment: "財務課" }
    ];
    const highResult = determinePriorityForReminder(highPriorityItems, { delayWeight: 2, levelWeight: 3, importanceWeight: 4 });
    
    // 計算式: delayScore(15*2) + levelScore(5*3) + importanceScore(8*4) = 30 + 15 + 32 = 77
    // 77は50以上80未満なので"medium"
    expect(highResult).toEqual([{
      applicationId: "APP002",
      priorityScore: 77,
      reminderUrgency: "medium"
    }]);

    // 最高優先度ケース（priorityScore >= 80）
    const criticalItems = [
      { applicationId: "APP003", delayDays: 20, approverLevel: 6, documentImportance: 9, applicantDepartment: "研究推進課" }
    ];
    const criticalResult = determinePriorityForReminder(criticalItems, { delayWeight: 2, levelWeight: 3, importanceWeight: 4 });
    
    // 計算式: delayScore(20*2) + levelScore(6*3) + importanceScore(9*4) = 40 + 18 + 36 = 94
    // 94は80以上なので"high"
    expect(criticalResult).toEqual([{
      applicationId: "APP003",
      priorityScore: 94,
      reminderUrgency: "high"
    }]);
  });
});