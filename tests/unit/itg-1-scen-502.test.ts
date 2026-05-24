import { approveRequirementChange } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("変更要件承認処理 - 承認却下時に適切な理由と共に差戻しが実行される", () => {
    // SCEN-502

    // 影響分析が長大で権限を超えるケース - 理事会承認が必要として却下
    const result1 = approveRequirementChange(
      "文部科学省補助金申請に伴う処理ルート変更",
      "a".repeat(1100), // 1100文字で1000文字制限を超過
      "standard",
      3
    );

    expect(result1).toEqual({
      approved: false,
      approvalComment: "理事会承認が必要",
      nextAction: "理事会への上申準備",
      urgencyLevel: "保留"
    });

    // 文部科学省関連だが権限外のケース - 理事会承認が必要として却下
    const result2 = approveRequirementChange(
      "科研費関連の処理ルート変更",
      "影響範囲の詳細分析結果",
      "limited", // 権限が標準ではない
      4
    );

    expect(result2).toEqual({
      approved: false,
      approvalComment: "理事会承認が必要", 
      nextAction: "理事会への上申準備",
      urgencyLevel: "保留"
    });

    // 法令違反リスクが高い場合 - 緊急承認される
    const result3 = approveRequirementChange(
      "補助金申請処理ルート変更",
      "文部科学省要件対応",
      "standard",
      8
    );

    expect(result3).toEqual({
      approved: true,
      approvalComment: "法令違反リスク回避のため緊急承認",
      nextAction: "即座に文書分類基準を更新", 
      urgencyLevel: "緊急"
    });

    // 権限内で文部科学省関連のケース - 通常承認される
    const result4 = approveRequirementChange(
      "文部科学省補助金対応",
      "影響範囲分析",
      "standard",
      5
    );

    expect(result4).toEqual({
      approved: true,
      approvalComment: "通常承認",
      nextAction: "文書分類基準の更新を実施",
      urgencyLevel: "通常"
    });

    // 変更要件が空の場合のエラー
    expect(() => approveRequirementChange(
      "",
      "影響分析結果",
      "standard", 
      3
    )).toThrow("変更要件の内容が不十分です。具体的な変更内容を記載してください。");

    // 影響分析が未提供の場合のエラー  
    expect(() => approveRequirementChange(
      "処理ルート変更",
      "",
      "standard",
      3
    )).toThrow("影響分析が完了していません。承認判定に必要な分析結果を確認してください。");
  });
});