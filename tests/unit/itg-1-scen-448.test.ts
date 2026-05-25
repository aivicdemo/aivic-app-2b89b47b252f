import { determinePriorityForReminder } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("催促対象優先度判定 - 同一優先度の案件について適切な順序が決定される", () => {
    // SCEN-448
    
    // 同一優先度となる複数案件を準備
    const pendingApplications = [
      {
        applicationId: "APP-001",
        delayDays: 5,
        approverLevel: 3,
        documentImportance: 7,
        applicantDepartment: "総務部"
      },
      {
        applicationId: "APP-002", 
        delayDays: 5,
        approverLevel: 3,
        documentImportance: 7,
        applicantDepartment: "財務部"
      },
      {
        applicationId: "APP-003",
        delayDays: 6,
        approverLevel: 2,
        documentImportance: 8,
        applicantDepartment: "学務部"
      }
    ];

    const priorityWeights = {
      delayWeight: 2,
      levelWeight: 5,
      importanceWeight: 3
    };

    const result = determinePriorityForReminder(pendingApplications, priorityWeights);

    // 優先度スコア計算の検証
    // APP-001: (5*2) + (3*5) + (7*3) = 10 + 15 + 21 = 46
    // APP-002: (5*2) + (3*5) + (7*3) = 10 + 15 + 21 = 46  
    // APP-003: (6*2) + (2*5) + (8*3) = 12 + 10 + 24 = 46

    expect(result).toHaveLength(3);
    
    // 全案件が同一優先度スコア46を持つことを確認
    expect(result[0].priorityScore).toBe(46);
    expect(result[1].priorityScore).toBe(46);
    expect(result[2].priorityScore).toBe(46);

    // 優先度スコアが50未満なので全て低緊急度
    expect(result[0].reminderUrgency).toBe("low");
    expect(result[1].reminderUrgency).toBe("low");
    expect(result[2].reminderUrgency).toBe("low");

    // 結果が優先度スコアの降順でソートされていることを確認
    // （同一スコアの場合は元の順序を維持）
    expect(result[0].applicationId).toBe("APP-001");
    expect(result[1].applicationId).toBe("APP-002");
    expect(result[2].applicationId).toBe("APP-003");
  });
});