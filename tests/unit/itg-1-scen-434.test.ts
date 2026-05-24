import { setApprovalDeadline } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("文書種別が不明な場合、デフォルト期限が適用される", () => {
    // SCEN-434
    const documentType = "不明";
    const subsidyRelated = false;
    const urgencyLevel = "標準";
    const submissionDate = new Date("2024-01-15T10:00:00Z");

    const result = setApprovalDeadline(documentType, subsidyRelated, urgencyLevel, submissionDate);

    const expectedBaseDays = 3; // 一般書類の基本期限
    const expectedDeadline = new Date(submissionDate.getTime() + expectedBaseDays * 24 * 60 * 60 * 1000);
    const expectedNotificationSchedule = ["2日前", "当日"];

    expect(result.deadlineDate).toEqual(expectedDeadline);
    expect(result.businessDays).toBe(expectedBaseDays);
    expect(result.notificationSchedule).toEqual(expectedNotificationSchedule);
  });
});