import { approveRequirementChange } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("事務局長による変更要件承認が正常に処理される", () => {
    // SCEN-501

    // 法令違反リスクが高い場合の緊急承認
    const highRiskResult = approveRequirementChange(
      "補助金申請書類の処理ルートを電子＋紙ハイブリッドに変更",
      "全学の補助金関連業務に影響、月間500件の処理が対象",
      "standard",
      9
    );

    expect(highRiskResult.approved).toBe(true);
    expect(highRiskResult.approvalComment).toBe("法令違反リスク回避のため緊急承認");
    expect(highRiskResult.nextAction).toBe("即座に文書分類基準を更新");
    expect(高RiskResult.urgencyLevel).toBe("緊急");

    // 通常承認（文部科学省関連で権限内）
    const normalResult = approveRequirementChange(
      "文部科学省の補助金申請書類の保管要件変更に対応",
      "研究推進部と財務部の業務に影響、処理件数は月100件程度",
      "standard",
      5
    );

    expect(normalResult.approved).toBe(true);
    expect(normalResult.approvalComment).toBe("通常承認");
    expect(normalResult.nextAction).toBe("文書分類基準の更新を実施");
    expect(normalResult.urgencyLevel).toBe("通常");

    // 権限超過による却下
    const rejectionResult = approveRequirementChange(
      "全学システムの文書分類基準を大幅変更、全部署の業務フローを変更する大規模な改修を実施する予定であり、システム全体の処理性能に重大な影響を与える可能性がある変更内容となっている",
      "全部署に影響する大規模変更で、システム全体の再構築が必要",
      "standard",
      3
    );

    expect(rejectionResult.approved).toBe(false);
    expect(rejectionResult.approvalComment).toBe("理事会承認が必要");
    expect(rejectionResult.nextAction).toBe("理事会への上申準備");
    expect(rejectionResult.urgencyLevel).toBe("保留");

    // エラー条件のテスト
    expect(() => {
      approveRequirementChange(
        "短い",
        "影響分析結果",
        "standard",
        7
      );
    }).toThrow("変更要件の内容が不十分です。具体的な変更内容を記載してください。");

    expect(() => {
      approveRequirementChange(
        "適切な長さの変更要件内容です",
        "",
        "standard",
        6
      );
    }).toThrow("影響分析が完了していません。承認判定に必要な分析結果を確認してください。");
  });
});