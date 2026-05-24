import { setApprovalDeadline } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("標準的な申請書類の場合、適切な承認期限が設定される", () => {
    // SCEN-432
    const submissionDate = new Date("2024-01-15T09:00:00Z");
    
    // 一般申請（補助金関連ではない）で標準緊急度の場合
    const result1 = setApprovalDeadline("一般申請", false, "標準", submissionDate);
    const expectedDeadline1 = new Date(submissionDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    expect(result1.deadlineDate).toEqual(expectedDeadline1);
    expect(result1.businessDays).toBe(3);
    expect(result1.notificationSchedule).toEqual(["2日前", "当日"]);
    
    // 補助金関連申請で標準緊急度の場合
    const result2 = setApprovalDeadline("補助金申請", true, "標準", submissionDate);
    const expectedDeadline2 = new Date(submissionDate.getTime() + 5 * 24 * 60 * 60 * 1000);
    
    expect(result2.deadlineDate).toEqual(expectedDeadline2);
    expect(result2.businessDays).toBe(5);
    expect(result2.notificationSchedule).toEqual(["2日前", "当日"]);
    
    // 高緊急度の場合（基本期限を半分に短縮）
    const result3 = setApprovalDeadline("一般申請", false, "high", submissionDate);
    const expectedDeadline3 = new Date(submissionDate.getTime() + 1.5 * 24 * 60 * 60 * 1000);
    
    expect(result3.deadlineDate).toEqual(expectedDeadline3);
    expect(result3.businessDays).toBe(1.5);
    expect(result3.notificationSchedule).toEqual(["2日前", "当日"]);
    
    // 低緊急度の場合（基本期限を1.5倍に延長）
    const result4 = setApprovalDeadline("一般申請", false, "low", submissionDate);
    const expectedDeadline4 = new Date(submissionDate.getTime() + 4.5 * 24 * 60 * 60 * 1000);
    
    expect(result4.deadlineDate).toEqual(expectedDeadline4);
    expect(result4.businessDays).toBe(4.5);
    expect(result4.notificationSchedule).toEqual(["2日前", "当日"]);
    
    // 制約テスト - 提出日時が未来の日付の場合
    const futureDate = new Date("2024-12-31T09:00:00Z");
    expect(() => setApprovalDeadline("一般申請", false, "標準", futureDate))
      .toThrow("提出日は現在日時以前である必要があります");
    
    // 制約テスト - 緊急度レベルが不正な場合
    expect(() => setApprovalDeadline("一般申請", false, "無効", submissionDate))
      .toThrow("緊急度は「高」「標準」「低」のいずれかを選択してください");
  });
});