import { setApprovalDeadline } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("標準的な申請書類の場合、適切な承認期限が設定される", () => {
    // SCEN-432
    
    // 補助金関連書類のテスト
    const subsidyResult = setApprovalDeadline(
      "補助金申請書",
      true,
      "標準",
      new Date("2024-01-01T09:00:00.000Z")
    );
    
    const expectedSubsidyDeadline = new Date("2024-01-06T09:00:00.000Z");
    expect(subsidyResult.deadlineDate).toEqual(expectedSubsidyDeadline);
    expect(subsidyResult.businessDays).toBe(5);
    expect(subsidyResult.notificationSchedule).toEqual(["2日前", "当日"]);
    
    // 一般書類のテスト
    const generalResult = setApprovalDeadline(
      "一般申請書",
      false,
      "標準",
      new Date("2024-01-01T09:00:00.000Z")
    );
    
    const expectedGeneralDeadline = new Date("2024-01-04T09:00:00.000Z");
    expect(generalResult.deadlineDate).toEqual(expectedGeneralDeadline);
    expect(generalResult.businessDays).toBe(3);
    expect(generalResult.notificationSchedule).toEqual(["2日前", "当日"]);
    
    // 緊急度が高い場合のテスト
    const urgentResult = setApprovalDeladline(
      "一般申請書",
      false,
      "high",
      new Date("2024-01-01T09:00:00.000Z")
    );
    
    const expectedUrgentDeadline = new Date("2024-01-02T21:00:00.000Z");
    expect(urgentResult.deadlineDate).toEqual(expectedUrgentDeadline);
    expect(urgentResult.businessDays).toBe(1.5);
    expect(urgentResult.notificationSchedule).toEqual(["2日前", "当日"]);
    
    // 緊急度が低い場合のテスト
    const lowUrgencyResult = setApprovalDeadline(
      "補助金申請書",
      true,
      "low",
      new Date("2024-01-01T09:00:00.000Z")
    );
    
    const expectedLowUrgencyDeadline = new Date("2024-01-08T13:30:00.000Z");
    expect(lowUrgencyResult.deadlineDate).toEqual(expectedLowUrgencyDeadline);
    expect(lowUrgencyResult.businessDays).toBe(7.5);
    expect(lowUrgencyResult.notificationSchedule).toEqual(["2日前", "当日"]);
    
    // 制約条件のテスト
    expect(() => {
      setApprovalDeadline(
        "申請書",
        false,
        "標準",
        new Date("2024-12-31T09:00:00.000Z")
      );
    }).toThrow("提出日は現在日時以前である必要があります");
    
    expect(() => {
      setApprovalDeadline(
        "申請書",
        false,
        "超高",
        new Date("2024-01-01T09:00:00.000Z")
      );
    }).toThrow("緊急度は「高」「標準」「低」のいずれかを選択してください");
  });
});