import { handleApproverAbsenceSubstitution } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("代理承認実行時に関係者に適切な通知が送信される", () => {
    // SCEN-460: 承認者不在時の代理承認権限移譲とその通知処理をテスト

    const currentDate = new Date("2024-01-15T10:00:00Z");
    
    // 営業日で3日以上不在の承認者の場合（代理承認が必要）
    const lastLoginDate = new Date("2024-01-10T17:00:00Z"); // 3営業日以上前
    const result = handleApproverAbsenceSubstitution(
      "A001",
      "APP2024001", 
      lastLoginDate,
      currentDate
    );

    expect(result.substitutionRequired).toBe(true);
    expect(result.substituteApproverId).toBe("A002");
    expect(result.notificationSent).toBe(true);
    expect(result.reason).toBe("承認者不在のため代理承認に移行");

    // 営業日で3日未満の場合（代理承認が不要）
    const recentLoginDate = new Date("2024-01-12T15:00:00Z"); // 2営業日前
    const result2 = handleApproverAbsenceSubstitution(
      "A001",
      "APP2024002",
      recentLoginDate, 
      currentDate
    );

    expect(result2.substitutionRequired).toBe(false);
    expect(result2.substituteApproverId).toBe(null);
    expect(result2.notificationSent).toBe(false);
    expect(result2.reason).toBe("承認者は通常通り対応可能");

    // 代理承認者が設定されていない場合のエラー
    expect(() => {
      handleApproverAbsenceSubstitution(
        "A999", // 代理承認者が設定されていない承認者
        "APP2024003",
        new Date("2024-01-08T10:00:00Z"), // 4営業日前
        currentDate
      );
    }).toThrow("代理承認者が設定されていないため、代理承認を実行できません。システム管理者にお問い合わせください。");
  });
});