import { determinePriorityForApprovalNotification } from '../../src/logic/it-1-br-1-2-1';

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("高緊急度案件が即座に通知される", () => {
    // SCEN-465
    
    // 期限まで3日以内の緊急案件
    const result1 = determinePriorityForApprovalNotification(
      "緊急設備申請書",
      "設備申請",
      new Date("2024-01-01T09:00:00Z"),
      new Date("2024-01-03T17:00:00Z"), // 3日以内
      false
    );
    
    expect(result1.priority).toBe('high');
    expect(result1.notificationTiming).toBe('immediate');
    expect(result1.urgencyReason).toBe('期限まで3日以内');
    
    // 補助金関連申請（期限に関係なく高優先度）
    const result2 = determinePriorityForApprovalNotification(
      "科研費申請書",
      "補助金申請",
      new Date("2024-01-01T09:00:00Z"),
      new Date("2024-01-15T17:00:00Z"), // 期限まで2週間
      true
    );
    
    expect(result2.priority).toBe('high');
    expect(result2.notificationTiming).toBe('immediate');
    expect(result2.urgencyReason).toBe('補助金関連申請');
    
    // タイトルに緊急キーワード含有
    const result3 = determinePriorityForApprovalNotification(
      "至急対応が必要な物品購入申請",
      "物品申請",
      new Date("2024-01-01T09:00:00Z"),
      new Date("2024-01-20T17:00:00Z"), // 期限まで3週間
      false
    );
    
    expect(result3.priority).toBe('high');
    expect(result3.notificationTiming).toBe('immediate');
    expect(result3.urgencyReason).toBe('タイトルに緊急キーワード含有');
    
    // 期限まで7日以内（通常優先度）
    const result4 = determinePriorityForApprovalNotification(
      "通常の備品申請",
      "物品申請",
      new Date("2024-01-01T09:00:00Z"),
      new Date("2024-01-06T17:00:00Z"), // 6日
      false
    );
    
    expect(result4.priority).toBe('normal');
    expect(result4.notificationTiming).toBe('scheduled');
    expect(result4.urgencyReason).toBe('期限まで1週間以内');
    
    // 低優先度案件
    const result5 = determinePriorityForApprovalNotification(
      "日常業務報告書",
      "報告書",
      new Date("2024-01-01T09:00:00Z"),
      new Date("2024-01-30T17:00:00Z"), // 期限まで1か月
      false
    );
    
    expect(result5.priority).toBe('low');
    expect(result5.notificationTiming).toBe('scheduled');
    expect(result5.urgencyReason).toBe('通常の申請案件');
    
    // エラーケース：タイトルが空
    expect(() => determinePriorityForApprovalNotification(
      "",
      "物品申請",
      new Date("2024-01-01T09:00:00Z"),
      new Date("2024-01-06T17:00:00Z"),
      false
    )).toThrow("申請書類のタイトルが入力されていません。");
    
    // エラーケース：文書種別が未指定
    expect(() => determinePriorityForApprovalNotification(
      "テスト申請",
      "",
      new Date("2024-01-01T09:00:00Z"),
      new Date("2024-01-06T17:00:00Z"),
      false
    )).toThrow("申請書類の種別を選択してください。");
    
    // エラーケース：提出日時が未来
    expect(() => determinePriorityForApprovalNotification(
      "テスト申請",
      "物品申請",
      new Date("2024-12-31T09:00:00Z"),
      new Date("2024-01-06T17:00:00Z"),
      false
    )).toThrow("提出日時に未来の日付は指定できません。");
  });
});