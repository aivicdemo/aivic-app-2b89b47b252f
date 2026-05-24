import { setApprovalDeadline } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("標準的な申請書類の場合、適切な承認期限が設定される", () => {
    // SCEN-432
    
    const documentType = "一般申請";
    const subsidyRelated = false;
    const urgencyLevel = "標準";
    const submissionDate = new Date("2024-01-15T10:00:00Z");
    
    const result = setApprovalDeadline(documentType, subsidyRelated, urgencyLevel, submissionDate);
    
    // 一般書類は営業日で3日が基本期限
    const expectedDeadline = new Date("2024-01-18T10:00:00Z");
    
    expect(result.deadlineDate).toEqual(expectedDeadline);
    expect(result.businessDays).toBe(3);
    expect(result.notificationSchedule).toEqual(["2日前", "当日"]);
  });
});