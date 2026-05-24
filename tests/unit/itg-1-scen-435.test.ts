import { processUrgentApplicationPriority } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("緊急案件処理 - 緊急フラグが設定された案件が最優先で処理される", () => {
    // SCEN-435
    
    // 緊急フラグが設定された案件のテスト
    const urgentApplicationData = {
      id: "app001",
      title: "災害対応設備申請",
      approvalRoute: ["課長", "部長", "理事"],
      priority: "high",
      createdAt: new Date("2024-01-01T09:00:00Z")
    };
    
    const urgentDeadlineDate = new Date("2024-01-04T17:00:00Z");
    const currentQueue = [
      { id: "app002", priority: "normal" },
      { id: "app003", priority: "medium" }
    ];
    
    const urgentResult = processUrgentApplicationPriority(
      urgentApplicationData,
      true,
      urgentDeadlineDate,
      currentQueue
    );
    
    expect(urgentResult.priorityLevel).toBe(1);
    expect(urgentResult.queuePosition).toBe(0);
    expect(urgentResult.notificationTargets).toEqual(["課長", "部長", "理事"]);
    expect(urgentResult.processingDeadline).toEqual(new Date(Date.now() + 24 * 60 * 60 * 1000));
    
    // 期限切迫案件のテスト（3日以内）
    const urgentByDeadlineData = {
      id: "app004",
      title: "法定期限申請",
      approvalRoute: ["課長", "部長"],
      priority: "medium",
      createdAt: new Date("2024-01-01T09:00:00Z")
    };
    
    const closeDeadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    
    const deadlineResult = processUrgentApplicationPriority(
      urgentByDeadlineData,
      false,
      closeDeadline,
      currentQueue
    );
    
    expect(deadlineResult.priorityLevel).toBe(1);
    expect(deadlineResult.queuePosition).toBe(0);
    expect(deadlineResult.notificationTargets).toEqual(["課長", "部長"]);
    expect(deadlineResult.processingDeadline).toEqual(new Date(Date.now() + 24 * 60 * 60 * 1000));
    
    // 通常案件のテスト
    const normalApplicationData = {
      id: "app005",
      title: "通常申請",
      approvalRoute: ["課長"],
      priority: "low",
      createdAt: new Date("2024-01-01T09:00:00Z")
    };
    
    const normalDeadline = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    
    const normalResult = processUrgentApplicationPriority(
      normalApplicationData,
      false,
      normalDeadline,
      currentQueue
    );
    
    expect(normalResult.priorityLevel).toBe(3);
    expect(normalResult.queuePosition).toBe(2);
    expect(normalResult.notificationTargets).toEqual(["課長"]);
    expect(normalResult.processingDeadline.getTime()).toBeGreaterThan(Date.now() + 24 * 60 * 60 * 1000);
  });
});