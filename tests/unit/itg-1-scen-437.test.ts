import {
  updateProcessingRoutesByRegulationChange,
  handleSystemFailureAlternativeProcess,
  processUrgentApplicationPriority
} from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("緊急案件処理 - システム障害時に緊急案件が発生した場合、代替処理が実行される", () => {
    // SCEN-437

    // システム障害時の緊急案件処理をテスト
    const systemStatus = "critical_failure";
    const failureType = "database_connection_error";
    const documentType = "補助金申請書";
    const urgencyLevel = 9;

    // システム障害時の代替処理を実行
    const failureResult = handleSystemFailureAlternativeProcess(
      systemStatus,
      failureType,
      documentType,
      urgencyLevel
    );

    // 緊急案件の優先度処理を実行
    const applicationData = {
      title: "災害復旧緊急申請",
      approvalRoute: ["部長", "事務局長", "理事"],
      createdAt: new Date("2024-01-15T09:00:00Z")
    };
    const urgentPriorityResult = processUrgentApplicationPriority(
      applicationData,
      true, // 緊急フラグ設定
      new Date("2024-01-17T17:00:00Z"), // 2日後が期限
      [
        { id: "app1", priority: "medium" },
        { id: "app2", priority: "low" }
      ]
    );

    // 法令改正による処理ルート更新（関連する緊急対応）
    const regulationNotice = "文部科学省令第123号により補助金申請書の紙保管要件が緊急変更されました";
    const currentClassification = [
      { documentType: "補助金申請書", processingRoute: "electronic" },
      { documentType: "実績報告書", processingRoute: "hybrid" }
    ];
    const affectedTypes = ["補助金申請書", "実績報告書"];

    const routeUpdateResult = updateProcessingRoutesByRegulationChange(
      regulationNotice,
      currentClassification,
      affectedTypes
    );

    // システム障害時の代替処理結果を検証
    expect(failureResult.alternativeProcess).toBe("full_paper_mode");
    expect(failureResult.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(failureResult.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(failureResult.estimatedRecoveryTime).toBe(240); // 4時間

    // 緊急案件優先度処理結果を検証
    expect(urgentPriorityResult.priorityLevel).toBe(1);
    expect(urgentPriorityResult.queuePosition).toBe(0);
    expect(urgentPriorityResult.notificationTargets).toEqual(["部長", "事務局長", "理事"]);
    expect(urgentPriorityResult.processingDeadline).toEqual(new Date("2024-01-16T09:00:00Z"));

    // 処理ルート更新結果を検証
    expect(routeUpdateResult.updatedRoutes).toEqual([
      { documentType: "補助金申請書", oldRoute: "electronic", newRoute: "hybrid" },
      { documentType: "実績報告書", oldRoute: "hybrid", newRoute: "hybrid" }
    ]);
    expect(routeUpdateResult.notificationTargets).toEqual([
      "広報課", "事務局", "情報システム課"
    ]);
    expect(routeUpdateResult.changeLog).toEqual({
      changeDate: new Date("2024-01-15T11:00:00Z"),
      affectedCount: 2,
      changeReason: "法令改正対応"
    });
  });
});