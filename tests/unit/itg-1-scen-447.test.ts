import { determinePriorityForReminder } from '../../src/logic/it-1-br-1-2-1';

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("SCEN-447: 催促対象優先度判定 - 重要度と滞留期間に基づいて適切な優先度が決定される", () => {
    // 境界値・成功・エラーケースを含む包括テスト
    
    // 高優先度ケース（滞留10日、レベル8、重要度9）
    const highPriorityApps = [{
      applicationId: "APP-001",
      delayDays: 10,
      approverLevel: 8,
      documentImportance: 9,
      applicantDepartment: "財務課"
    }];
    const priorityWeights = {
      delayWeight: 2,
      levelWeight: 3,
      importanceWeight: 4
    };
    
    const highResult = determinePriorityForReminder(highPriorityApps, priorityWeights);
    
    expect(highResult).toEqual([{
      applicationId: "APP-001",
      priorityScore: 80, // 10*2 + 8*3 + 9*4 = 20 + 24 + 36 = 80
      reminderUrgency: "high"
    }]);
    
    // 中優先度ケース（滞留5日、レベル6、重要度7）
    const mediumPriorityApps = [{
      applicationId: "APP-002",
      delayDays: 5,
      approverLevel: 6,
      documentImportance: 7,
      applicantDepartment: "総務課"
    }];
    
    const mediumResult = determinePriorityForReminder(mediumPriorityApps, priorityWeights);
    
    expect(mediumResult).toEqual([{
      applicationId: "APP-002",
      priorityScore: 64, // 5*2 + 6*3 + 7*4 = 10 + 18 + 28 = 64
      reminderUrgency: "medium"
    }]);
    
    // 低優先度ケース（滞留2日、レベル3、重要度4）
    const lowPriorityApps = [{
      applicationId: "APP-003",
      delayDays: 2,
      approverLevel: 3,
      documentImportance: 4,
      applicantDepartment: "学務課"
    }];
    
    const lowResult = determinePriorityForReminder(lowPriorityApps, priorityWeights);
    
    expect(lowResult).toEqual([{
      applicationId: "APP-003",
      priorityScore: 30, // 2*2 + 3*3 + 4*4 = 4 + 9 + 16 = 30
      reminderUrgency: "low"
    }]);
    
    // 複数案件の優先順位ソートケース
    const multipleApps = [
      {
        applicationId: "APP-004",
        delayDays: 3,
        approverLevel: 4,
        documentImportance: 5,
        applicantDepartment: "研究支援課"
      },
      {
        applicationId: "APP-005",
        delayDays: 8,
        approverLevel: 7,
        documentImportance: 8,
        applicantDepartment: "国際課"
      }
    ];
    
    const sortedResult = determinePriorityForReminder(multipleApps, priorityWeights);
    
    expect(sortedResult).toEqual([
      {
        applicationId: "APP-005",
        priorityScore: 69, // 8*2 + 7*3 + 8*4 = 16 + 21 + 32 = 69
        reminderUrgency: "medium"
      },
      {
        applicationId: "APP-004",
        priorityScore: 38, // 3*2 + 4*3 + 5*4 = 6 + 12 + 20 = 38
        reminderUrgency: "low"
      }
    ]);
    
    // エラーケース: 空の滞留案件リスト
    expect(() => {
      determinePriorityForReminder([], priorityWeights);
    }).toThrow("催促対象となる滞留案件が存在しません。承認進捗を再確認してください。");
    
    // エラーケース: 負の重み係数
    const invalidWeights = {
      delayWeight: -1,
      levelWeight: 3,
      importanceWeight: 4
    };
    
    expect(() => {
      determinePriorityForReminder(highPriorityApps, invalidWeights);
    }).toThrow("優先度計算の重み係数に無効な値が設定されています。システム管理者にお問い合わせください。");
  });
});