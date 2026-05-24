import { handleApproverAbsenceSubstitution } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("承認者不在時に代理承認者に権限が移譲される", () => {
    // SCEN-459
    
    // 承認者が3営業日以上不在の場合の代理権限移譲
    const currentDate = new Date("2024-01-10T09:00:00Z");
    const lastLoginDate3Days = new Date("2024-01-05T17:00:00Z");
    
    const result3Days = handleApproverAbsenceSubstitution(
      "approver001",
      "app123",
      lastLoginDate3Days,
      currentDate
    );
    
    expect(result3Days.substitutionRequired).toBe(true);
    expect(result3Days.substituteApproverId).toBe("substitute_approver_001");
    expect(result3Days.notificationSent).toBe(true);
    expect(result3Days.reason).toBe("承認者不在のため代理承認に移行");
    
    // 承認者が3営業日未満の場合は代理権限移譲なし
    const lastLoginDate2Days = new Date("2024-01-08T17:00:00Z");
    
    const result2Days = handleApproverAbsenceSubstitution(
      "approver002",
      "app124",
      lastLoginDate2Days,
      currentDate
    );
    
    expect(result2Days.substitutionRequired).toBe(false);
    expect(result2Days.substituteApproverId).toBe(null);
    expect(result2Days.notificationSent).toBe(false);
    expect(result2Days.reason).toBe("承認者は通常通り対応可能");
    
    // 代理承認者が設定されていない場合のエラー
    const lastLoginDate5Days = new Date("2024-01-04T17:00:00Z");
    
    expect(() => {
      handleApproverAbsenceSubstitution(
        "approver_no_substitute",
        "app125",
        lastLoginDate5Days,
        currentDate
      );
    }).toThrow("代理承認者が設定されていません");
  });
});