import { handleApproverAbsenceSubstitution } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("代理承認権限移譲 - 代理承認実行時に関係者に適切な通知が送信される", () => {
    // SCEN-460
    
    // 承認者が3営業日以上不在の場合
    const lastLoginDate = new Date("2024-01-10T09:00:00Z");
    const currentDate = new Date("2024-01-16T09:00:00Z"); // 6営業日後
    
    const result = handleApproverAbsenceSubstitution(
      "EMP001",
      "APP001", 
      lastLoginDate,
      currentDate
    );

    // 営業日数が3日以上なので代理承認が必要
    expect(result.substitutionRequired).toBe(true);
    expect(result.substituteApproverId).toBe("SUB001");
    expect(result.notificationSent).toBe(true);
    expect(result.reason).toBe("承認者不在のため代理承認に移行");

    // 営業日数が3日未満の場合
    const recentLoginDate = new Date("2024-01-15T09:00:00Z");
    const currentDate2 = new Date("2024-01-16T09:00:00Z"); // 1営業日後

    const result2 = handleApproverAbsenceSubstitution(
      "EMP002",
      "APP002",
      recentLoginDate, 
      currentDate2
    );

    // 営業日数が3日未満なので代理承認は不要
    expect(result2.substitutionRequired).toBe(false);
    expect(result2.substituteApproverId).toBe(null);
    expect(result2.notificationSent).toBe(false);
    expect(result2.reason).toBe("承認者は通常通り対応可能");

    // 代理承認者が設定されていない場合のエラーテスト
    expect(() => {
      handleApproverAbsenceSubstitution(
        "EMP_NO_SUB",
        "APP003",
        new Date("2024-01-10T09:00:00Z"),
        new Date("2024-01-16T09:00:00Z")
      );
    }).toThrow("代理承認者が設定されていないため、代理承認を実行できません。システム管理者にお問い合わせください。");
  });
});