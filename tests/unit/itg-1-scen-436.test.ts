import { processUrgentApplicationPriority } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("緊急案件処理 - 複数の緊急案件がある場合、適切な優先順位が決定される", () => {
    // SCEN-436
    const currentDate = new Date("2024-01-15T10:00:00Z");
    
    // 緊急フラグ設定済み + 期限切迫の複合条件
    const urgentApplication1 = {
      id: "APP001",
      title: "災害対応設備緊急購入申請",
      priority: "high",
      createdAt: new Date("2024-01-14T09:00:00Z"),
      approvalRoute: ["課長", "部長", "事務局長"]
    };
    
    const urgentDeadline1 = new Date("2024-01-17T23:59:59Z"); // 3日以内
    const currentApprovalQueue1 = [
      { id: "APP002", priority: "medium" },
      { id: "APP003", priority: "low" }
    ];
    
    const result1 = processUrgentApplicationPriority(
      urgentApplication1,
      true, // 緊急フラグ設定済み
      urgentDeadline1,
      currentApprovalQueue1
    );
    
    expect(result1.priorityLevel).toBe(1);
    expect(result1.queuePosition).toBe(0);
    expect(result1.notificationTargets).toEqual(["課長", "部長", "事務局長"]);
    expect(result1.processingDeadline).toEqual(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
    
    // 期限切迫のみ（緊急フラグなし）
    const urgentApplication2 = {
      id: "APP004",
      title: "通常申請書類",
      priority: "medium",
      createdAt: new Date("2024-01-13T14:00:00Z"),
      approvalRoute: ["課長", "部長"]
    };
    
    const urgentDeadline2 = new Date("2024-01-16T17:00:00Z"); // 2日以内
    const currentApprovalQueue2 = [
      { id: "APP005", priority: "low" }
    ];
    
    const result2 = processUrgentApplicationPriority(
      urgentApplication2,
      false, // 緊急フラグなし
      urgentDeadline2,
      currentApprovalQueue2
    );
    
    expect(result2.priorityLevel).toBe(1);
    expect(result2.queuePosition).toBe(0);
    expect(result2.notificationTargets).toEqual(["課長", "部長"]);
    expect(result2.processingDeadline).toEqual(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
    
    // 通常案件（緊急条件なし）
    const normalApplication = {
      id: "APP006",
      title: "通常業務申請",
      priority: "low",
      createdAt: new Date("2024-01-12T10:00:00Z"),
      approvalRoute: ["課長"]
    };
    
    const normalDeadline = new Date("2024-01-25T17:00:00Z"); // 10日後
    const currentApprovalQueue3 = [
      { id: "APP007", priority: "medium" },
      { id: "APP008", priority: "low" }
    ];
    
    const result3 = processUrgentApplicationPriority(
      normalApplication,
      false, // 緊急フラグなし
      normalDeadline,
      currentApprovalQueue3
    );
    
    expect(result3.priorityLevel).toBe(3);
    expect(result3.queuePosition).toBe(2);
    expect(result3.notificationTargets).toEqual("課長");
    expect(result3.processingDeadline.getTime()).toBeGreaterThan(currentDate.getTime() + 24 * 60 * 60 * 1000);
  });
});