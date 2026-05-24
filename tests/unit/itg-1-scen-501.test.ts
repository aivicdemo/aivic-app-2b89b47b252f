import { approveRequirementChange } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("事務局長による変更要件承認が正常に処理される - SCEN-501", () => {
    // 通常承認: 文部科学省関連で影響分析が軽微、標準権限内
    const changeRequirements = "文部科学省の補助金申請書類に関する電子保管要件の変更により、研究費申請書類の処理ルートをハイブリッド方式に変更する。";
    const impactAnalysis = "変更による業務への影響は軽微で、研究推進部と財務課の2部署が対象。システム改修は不要で、運用手順の変更のみで対応可能。";
    const directorAuthority = "standard";
    const complianceRisk = 5;

    const result = approveRequirementChange(changeRequirements, impactAnalysis, directorAuthority, complianceRisk);

    expect(result).toEqual({
      approved: true,
      approvalComment: "通常承認",
      nextAction: "文書分類基準の更新を実施",
      urgencyLevel: "通常"
    });

    // 緊急承認: 法令違反リスクが高い場合
    const urgentChangeRequirements = "文部科学省通知により補助金関連書類の紙保管義務が即日発効。";
    const urgentImpactAnalysis = "法令違反リスクが高く、即座の対応が必要。";
    const urgentComplianceRisk = 9;

    const urgentResult = approveRequirementChange(urgentChangeRequirements, urgentImpactAnalysis, directorAuthority, urgentComplianceRisk);

    expect(urgentResult).toEqual({
      approved: true,
      approvalComment: "法令違反リスク回避のため緊急承認",
      nextAction: "即座に文書分類基準を更新",
      urgencyLevel: "緊急"
    });

    // 理事会承認が必要: 権限を超える重大変更
    const majorChangeRequirements = "全学システムの根本的な処理ルート変更が必要。" + "a".repeat(970);
    const majorImpactAnalysis = "全学規模での処理手順変更が必要で、システム改修と組織変更を伴う大規模な変更となる。" + "b".repeat(850);

    const majorResult = approveRequirementChange(majorChangeRequirements, majorImpactAnalysis, directorAuthority, complianceRisk);

    expect(majorResult).toEqual({
      approved: false,
      approvalComment: "理事会承認が必要",
      nextAction: "理事会への上申準備",
      urgencyLevel: "保留"
    });

    // エラーケース: 変更要件が不十分
    expect(() => {
      approveRequirementChange("短い", impactAnalysis, directorAuthority, complianceRisk);
    }).toThrow("変更要件の内容が不十分です。具体的な変更内容を記載してください。");

    // エラーケース: 影響分析が未提供
    expect(() => {
      approveRequirementChange(changeRequirements, "", directorAuthority, complianceRisk);
    }).toThrow("影響分析が完了していません。承認判定に必要な分析結果を確認してください。");
  });
});