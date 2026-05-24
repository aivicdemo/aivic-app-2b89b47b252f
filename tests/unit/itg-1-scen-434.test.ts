import { setApprovalDeadline } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("文書種別が不明な場合、デフォルト期限が適用される", () => {
    // SCEN-434
    const documentType = "未分類";
    const subsidyRelated = false;
    const urgencyLevel = "標準";
    const submissionDate = new Date("2023-01-15T10:00:00Z");

    const result = setApprovalDeadline(
      documentType,
      subsidyRelated,
      urgencyLevel,
      submissionDate
    );

    const expectedDeadlineDate = new Date("2023-01-18T10:00:00Z");
    const expectedBusinessDays = 3;
    const expectedNotificationSchedule = ["2日前", "当日"];

    expect(result.deadlineDate).toEqual(expectedDeadlineDate);
    expect(result.businessDays).toBe(expectedBusinessDays);
    expect(result.notificationSchedule).toEqual(expectedNotificationSchedule);
  });
});