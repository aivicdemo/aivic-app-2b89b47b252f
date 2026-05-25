import { generateReminderMessage } from '../../src/logic/it-1-br-1-2-1';

describe('承認遅延案件を検知し担当者に自動で催促通知を送信する', () => {
  test('最高重要度案件の緊急催促メッセージが適切に生成される', () => {
    // SCEN-455
    
    // 8日以上滞留、補助金関連の案件
    const applicationId = 'APP-2024-001';
    const stagnationDays = 8;
    const documentType = '補助金申請書';
    const approverName = '田中部長';
    const applicantName = '山田太郎';

    const result = generateReminderMessage(
      applicationId,
      stagnationDays,
      documentType,
      approverName,
      applicantName
    );

    // 滞留日数が8日以上なので緊急度は「high」
    expect(result.urgencyLevel).toBe('high');
    
    // 緊急度がhighの場合は通知方法はメール
    expect(result.notificationMethod).toBe('email');
    
    // 補助金関連なので緊急度が1段階上がってhighになる
    // メッセージ内容には申請者名、書類種別、滞留日数が含まれる
    expect(result.messageContent).toContain('山田太郎');
    expect(result.messageContent).toContain('補助金申請書');
    expect(result.messageContent).toContain('8');
  });
});