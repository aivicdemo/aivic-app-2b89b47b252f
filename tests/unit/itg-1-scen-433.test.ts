import { setApprovalDeadline } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("緊急案件の場合、短縮された承認期限が設定される", () => {
    // SCEN-433
    const documentType = "補助金申請書";
    const subsidyRelated = true;
    const urgencyLevel = "high";
    const submissionDate = new Date("2023-10-01T09:00:00Z");

    const result = setApprovalDeadline(documentType, subsidyRelated, urgencyLevel, submissionDate);

    const baseDays = subsidyRelated ? 5 : 3;
    const adjustedDays = baseDays / 2; // 緊急度が高い場合は基本期限を半分に短縮
    const expectedDeadline = new Date(submissionDate.getTime() + adjustedDays * 24 * 60 * 60 * 1000);

    expect(result.deadlineDate).toEqual(expectedDeadline);
    expect(result.businessDays).toBe(adjustedDays);
    expect(result.notificationSchedule).toEqual(["2日前", "当日"]);
  });
});