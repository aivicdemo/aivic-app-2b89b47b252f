import { setApprovalDeadline } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("緊急案件の場合、短縮された承認期限が設定される", () => {
    // SCEN-433
    const submissionDate = new Date('2024-01-15T10:00:00Z');
    const documentType = "補助金申請";
    const subsidyRelated = true;
    const urgencyLevel = "high";
    
    const result = setApprovalDeadline(documentType, subsidyRelated, urgencyLevel, submissionDate);
    
    // 緊急案件の場合、補助金関連書類の基本期限（5日）を半分に短縮
    const expectedBusinessDays = 2.5;
    const expectedDeadlineDate = new Date('2024-01-18T10:00:00Z');
    const expectedNotificationSchedule = ["2日前", "当日"];
    
    expect(result.deadlineDate).toEqual(expectedDeadlineDate);
    expect(result.businessDays).toBe(expectedBusinessDays);
    expect(result.notificationSchedule).toEqual(expectedNotificationSchedule);
  });
});