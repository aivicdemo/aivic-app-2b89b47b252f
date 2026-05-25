import { checkApprovalDelayAndNotify } from '../../src/logic/it-1-br-1-2-1';

const fetchMock = require('jest-fetch-mock');

describe('承認遅延案件を検知し担当者に自動で催促通知を送信する', () => {
  // SCEN-444
  test('滞留案件抽出 - 設定期限を超過した案件が正しく抽出される', () => {
    fetchMock.resetMocks();

    const applicationId = "APP-2024-001";
    const currentDateTime = new Date("2024-01-15T14:30:00Z");
    const approvalDeadline = new Date("2024-01-15T12:00:00Z");
    const reminderSettings = { beforeDays: [3, 1], urgentHours: 24 };
    const approverInfo = {
      id: "approver001",
      name: "承認者太郎",
      email: "approver@university.ac.jp",
      department: "事務局"
    };

    const result = checkApprovalDelayAndNotify(
      applicationId,
      currentDateTime,
      approvalDeadline,
      reminderSettings,
      approverInfo
    );

    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("緊急催促");
    expect(result.recipients).toEqual(["approver@university.ac.jp", "applicant@university.ac.jp", "manager@university.ac.jp"]);
    expect(result.delayStatus).toBe("緊急");
    expect(result.nextReminderTime).toBeInstanceOf(Date);
  });
});