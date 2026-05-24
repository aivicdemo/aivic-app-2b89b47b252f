import { setApprovalDeadline } from '../../src/logic/it-1-br-1-2-1';

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("文書種別が不明な場合、デフォルト期限が適用される", () => {
    // SCEN-434

    const documentType = "不明";
    const subsidyRelated = false;
    const urgencyLevel = "標準";
    const submissionDate = new Date("2023-12-01T10:00:00Z");

    const result = setApprovalDeadline(documentType, subsidyRelated, urgencyLevel, submissionDate);

    // 補助金関連でない場合は営業日で3日を基本期限とする
    const baseDays = 3;
    const expectedDeadlineDate = new Date(submissionDate.getTime() + baseDays * 24 * 60 * 60 * 1000);
    
    expect(result.deadlineDate).toEqual(expectedDeadlineDate);
    expect(result.businessDays).toBe(baseDays);
    expect(result.notificationSchedule).toEqual(["2日前", "当日"]);
  });
});