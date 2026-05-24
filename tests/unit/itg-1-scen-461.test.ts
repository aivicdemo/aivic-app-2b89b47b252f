import { handleApproverAbsenceSubstitution } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("承認者が3営業日以上不在で代理承認者が未設定の場合、適切なエラーが発生する", () => {
    // SCEN-461
    const approverId = "approver001";
    const applicationId = "app-12345";
    const lastLoginDate = new Date("2024-01-01T09:00:00Z");
    const currentDate = new Date("2024-01-08T10:00:00Z"); // 7日経過、3営業日以上

    expect(() => {
      handleApproverAbsenceSubstitution(approverId, applicationId, lastLoginDate, currentDate);
    }).toThrow("承認者の代理設定が行われていないため、代理承認を実行できません。システム管理者にお問い合わせください。");
  });
});