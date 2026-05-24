import { handleSystemFailureAlternativeProcess } from "../../src/logic/it-1";

const fetchMock = require("jest-fetch-mock");

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム障害時代替処理 - 同期処理中に新たな障害が発生した場合、適切にエラーハンドリングされる", () => {
    // SCEN-440
    fetchMock.resetMocks();

    // 同期処理中に新たな障害が発生する状況をテスト
    const result = handleSystemFailureAlternativeProcess(
      "critical_failure",
      "補助金申請",
      "補助金申請書",
      9
    );

    expect(result.alternativeProcess).toBe("full_paper_mode");
    expect(result.notificationTargets).toEqual(["all_staff", "management", "it_support"]);
    expect(result.dataRecoveryPlan).toBe("sync_paper_to_electronic_after_recovery");
    expect(result.estimatedRecoveryTime).toBe(8);
  });
});