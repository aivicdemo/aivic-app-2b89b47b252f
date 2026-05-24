import { setApprovalDeadline } from "../../src/logic/it-1-br-1-2-1";

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("緊急案件の場合、短縮された承認期限が設定される", () => {
    // SCEN-433
    
    // 緊急案件の場合（緊急キーワードあり）
    const submissionDate1 = new Date("2024-01-15T09:00:00");
    const result1 = setApprovalDeadline(
      "補助金申請書",
      true,
      "high",
      submissionDate1
    );
    
    // 補助金関連で緊急度高の場合、基本営業日5日の半分で2.5日
    const expectedDeadline1 = new Date("2024-01-17T09:00:00"); // 2.5営業日後
    expect(result1.deadlineDate).toEqual(expectedDeadline1);
    expect(result1.businessDays).toBe(2.5);
    expect(result1.notificationSchedule).toEqual(["2日前", "当日"]);
    
    // 一般書類で緊急度高の場合
    const submissionDate2 = new Date("2024-01-15T09:00:00");
    const result2 = setApprovalDeadline(
      "一般申請書",
      false,
      "high",
      submissionDate2
    );
    
    // 一般書類で緊急度高の場合、基本営業日3日の半分で1.5日
    const expectedDeadline2 = new Date("2024-01-16T21:00:00"); // 1.5営業日後
    expect(result2.deadlineDate).toEqual(expectedDeadline2);
    expect(result2.businessDays).toBe(1.5);
    expect(result2.notificationSchedule).toEqual(["2日前", "当日"]);
    
    // 通常優先度との比較（補助金関連）
    const result3 = setApprovalDeadline(
      "補助金申請書",
      true,
      "standard",
      submissionDate1
    );
    
    // 通常優先度の場合は短縮されない（5営業日）
    const expectedDeadline3 = new Date("2024-01-20T09:00:00"); // 5営業日後
    expect(result3.deadlineDate).toEqual(expectedDeadline3);
    expect(result3.businessDays).toBe(5);
    expect(result3.notificationSchedule).toEqual(["2日前", "当日"]);
    
    // 低優先度の場合（延長される）
    const result4 = setApprovalDeadline(
      "補助金申請書",
      true,
      "low",
      submissionDate1
    );
    
    // 低優先度の場合は1.5倍に延長される（7.5営業日）
    const expectedDeadline4 = new Date("2024-01-23T21:00:00"); // 7.5営業日後
    expect(result4.deadlineDate).toEqual(expectedDeadline4);
    expect(result4.businessDays).toBe(7.5);
    expect(result4.notificationSchedule).toEqual(["2日前", "当日"]);
    
    // エラーケース：提出日時が未来の日付
    expect(() => {
      const futureDate = new Date("2025-12-31T10:00:00");
      setApprovalDeadline("補助金申請書", true, "high", futureDate);
    }).toThrow("提出日は現在日時以前である必要があります");
    
    // エラーケース：緊急度レベルが不正
    expect(() => {
      setApprovalDeadline("補助金申請書", true, "invalid", submissionDate1);
    }).toThrow("緊急度は「高」「標準」「低」のいずれかを選択してください");
  });
});