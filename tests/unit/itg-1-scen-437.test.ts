import { handleSystemFailureAlternativeProcess } from "../../src/logic/it-1-br-1779263788059-2-2-1";

const fetchMock = require("jest-fetch-mock");

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test("システム障害時緊急案件代替処理実行", () => {
    // SCEN-437

    // 重大障害時の緊急案件
    const result1 = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "disaster_response",
      "補助金申請書",
      10
    );
    expect(result1.alternativeProcess).toBe("full_paper_mode");
    expect(result1.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(result1.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(result1.estimatedRecoveryTime).toBeGreaterThan(0);

    // 部分障害時の緊急案件
    const result2 = handleSystemFailureAlternativeProcess(
      "partial_failure", 
      "法定期限間近",
      "研究費申請書",
      9
    );
    expect(result2.alternativeProcess).toBe("manual_hybrid_mode");
    expect(result2.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(result2.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(result2.estimatedRecoveryTime).toBeGreaterThan(0);

    // 軽微障害時の通常案件
    const result3 = handleSystemFailureAlternativeProcess(
      "minor_issue",
      "通常申請",
      "事務申請書",
      5
    );
    expect(result3.alternativeProcess).toBe("temporary_workaround");
    expect(result3.notificationTargets).toEqual(["relevant_staff", "it_support"]);
    expect(result3.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(result3.estimatedRecoveryTime).toBeGreaterThan(0);

    // システム状況不明エラー
    expect(() => {
      handleSystemFailureAlternativeProcess(
        "unknown",
        "災害対応",
        "申請書",
        8
      );
    }).toThrow("システム状況を確認できません。情報システム課に連絡してください。");

    // 緊急度範囲外警告
    expect(() => {
      handleSystemFailureAlternativeProcess(
        "critical_failure",
        "緊急案件", 
        "申請書",
        15
      );
    }).toThrow("緊急度は1から10の範囲で指定してください。");

    // 障害種別未指定警告（代替処理は継続）
    const result4 = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "",
      "申請書",
      7
    );
    expect(result4.alternativeProcess).toBe("full_paper_mode");
    expect(result4.notificationTargets).toEqual(["relevant_staff", "it_support"]);
  });
});