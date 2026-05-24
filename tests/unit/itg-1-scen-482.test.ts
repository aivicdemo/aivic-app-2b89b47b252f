import {
  determineApprovalDecision,
  handleSystemFailureAlternativeProcess,
  determineNextApprover
} from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("承認判断処理ルート決定 - 処理ルート決定に失敗した場合、エラー処理が実行される", () => {
    // SCEN-482

    // システム障害により承認判断処理ルートの決定に失敗するケース
    const systemStatus = "critical_failure";
    const failureType = "approval_route_determination_error";
    const documentType = "補助金申請書";
    const urgencyLevel = 9;

    const result = handleSystemFailureAlternativeProcess(
      systemStatus,
      failureType,
      documentType,
      urgencyLevel
    );

    expect(result.alternativeProcess).toBe("full_paper_mode");
    expect(result.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(result.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");

    // 承認判断でエラーが発生するケース - 申請書類の内容が空
    expect(() => {
      determineApprovalDecision(
        "",
        ["重大な不備"],
        true,
        5
      );
    }).toThrow("申請書類の内容が入力されていません。承認判定を行うことができません。");

    // 次の承認者決定でエラーが発生するケース - タイトルが空
    expect(() => {
      determineNextApprover(
        "",
        "申請内容の詳細",
        "課長",
        "承認"
      );
    }).toThrow("申請書類のタイトルが入力されていません。タイトルを入力してください。");

    // 承認判断決定処理が正常に動作するケース
    const normalResult = determineApprovalDecision(
      "補助金申請の詳細内容について記載しています。設備購入費用として500万円を申請いたします。",
      ["軽微な記載不備"],
      true,
      4
    );

    expect(normalResult.decision).toBe("conditional");
    expect(normalResult.reason).toBe("軽微な不備があるが緊急性を考慮");
    expect(normalResult.nextAction).toBe("fulfill_conditions");

    // 次の承認者決定が正常に動作するケース
    const nextApproverResult = determineNextApprover(
      "科研費申請書",
      "研究費申請の内容について詳細に記載しています。",
      "課長",
      "承認"
    );

    expect(nextApproverResult.isSubsidyRelated).toBe(true);
    expect(nextApproverResult.requiresPaperStorage).toBe(true);
    expect(nextApproverResult.processingRoute).toBe("hybrid");
  });
});