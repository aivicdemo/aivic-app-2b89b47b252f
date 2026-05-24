import { approveRequirementChange } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("変更要件承認処理中に権限エラーが発生した場合、適切に処理される", () => {
    // SCEN-503
    
    // 権限不足のケース
    expect(() => 
      approveRequirementChange(
        "補助金申請書類の電子化処理ルートを電子＋紙ハイブリッドに変更",
        "影響範囲が非常に大規模で全学的な対応が必要。文部科学省の新しい要件により1500件以上の書類が対象となり、システム変更も必要",
        "limited", // 制限された権限レベル
        5 // 中程度のリスク
      )
    ).toThrow("理事会承認が必要");

    // 法令違反リスクが高い緊急承認ケース
    const emergencyResult = approveRequirementChange(
      "補助金関連書類の紙保管要件を即座にハイブリッド処理に変更",
      "文部科学省から緊急通知により24時間以内の対応が必要",
      "standard", // 標準権限
      9 // 高リスク
    );
    expect(emergencyResult.approved).toBe(true);
    expect(emergencyResult.approvalComment).toBe("法令違反リスク回避のため緊急承認");
    expect(emergencyResult.nextAction).toBe("即座に文書分類基準を更新");
    expect(emergencyResult.urgencyLevel).toBe("緊急");

    // 通常の承認可能ケース
    const normalResult = approveRequirementChange(
      "補助金申請書類の処理ルート変更",
      "軽微な変更で影響範囲も限定的",
      "standard", // 標準権限
      3 // 低リスク
    );
    expect(normalResult.approved).toBe(true);
    expect(normalResult.approvalComment).toBe("通常承認");
    expect(normalResult.nextAction).toBe("文書分類基準の更新を実施");
    expect(normalResult.urgencyLevel).toBe("通常");

    // 変更要件が不十分なケース
    expect(() => 
      approveRequirementChange(
        "", // 空の変更要件
        "影響分析結果",
        "standard",
        5
      )
    ).toThrow("変更要件の内容が不十分です。具体的な変更内容を記載してください。");

    // 影響分析が未完了のケース
    expect(() => 
      approveRequirementChange(
        "変更要件の内容",
        "", // 空の影響分析
        "standard",
        5
      )
    ).toThrow("影響分析が完了していません。承認判定に必要な分析結果を確認してください。");
  });
});