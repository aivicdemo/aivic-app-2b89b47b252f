import { generateReminderMessage } from '../../src/logic/it-1-br-1-2-1';

describe('承認遅延案件を検知し担当者に自動で催促通知を送信する', () => {
  test('催促メッセージ生成 - 滞留期間と重要度に応じた適切な催促メッセージが生成される', () => {
    // SCEN-453
    
    // 通常案件（滞留3日、一般申請）
    const normalResult = generateReminderMessage(
      'APP-001',
      3,
      '一般申請',
      '田中課長',
      '山田太郎'
    );
    
    expect(normalResult.messageContent).toContain('山田太郎');
    expect(normalResult.messageContent).toContain('一般申請');
    expect(normalResult.messageContent).toContain('3日');
    expect(normalResult.urgencyLevel).toBe('low');
    expect(normalResult.notificationMethod).toBe('system');
    
    // 中程度の緊急度（滞留5日、一般申請）
    const mediumResult = generateReminderMessage(
      'APP-002',
      5,
      '一般申請',
      '佐藤部長',
      '鈴木花子'
    );
    
    expect(mediumResult.urgencyLevel).toBe('medium');
    expect(mediumResult.notificationMethod).toBe('both');
    
    // 高緊急度（滞留8日、一般申請）
    const highResult = generateReminderMessage(
      'APP-003',
      8,
      '一般申請',
      '高橋理事',
      '伊藤次郎'
    );
    
    expect(highResult.urgencyLevel).toBe('high');
    expect(highResult.notificationMethod).toBe('email');
    
    // 補助金関連で緊急度上昇（滞留3日、補助金申請）
    const subsidyResult = generateReminderMessage(
      'APP-004',
      3,
      '補助金申請',
      '中村課長',
      '加藤三郎'
    );
    
    expect(subsidyResult.urgencyLevel).toBe('medium');
    expect(subsidyResult.notificationMethod).toBe('both');
    
    // 補助金関連で最高緊急度（滞留5日、補助金申請）
    const urgentSubsidyResult = generateReminderMessage(
      'APP-005',
      5,
      '補助金申請',
      '小林部長',
      '松本四郎'
    );
    
    expect(urgentSubsidyResult.urgencyLevel).toBe('high');
    expect(urgentSubsidyResult.notificationMethod).toBe('email');
    
    // エラー処理：滞留日数が負の値
    expect(() => {
      generateReminderMessage('APP-006', -1, '一般申請', '承認者', '申請者');
    }).toThrow('滞留日数は0以上である必要があります');
    
    // エラー処理：承認者名が空
    expect(() => {
      generateReminderMessage('APP-007', 3, '一般申請', '', '申請者');
    }).toThrow('催促対象の承認者が特定できません');
    
    // エラー処理：申請者名が空
    expect(() => {
      generateReminderMessage('APP-008', 3, '一般申請', '承認者', '');
    }).toThrow('申請者情報が不正です');
  });
});