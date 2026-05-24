import { approveRequirementChange } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("SCEN-501: 変更要件承認処理 - 事務局長による変更要件承認が正常に処理される", () => {
    // 法令違反リスク高（8以上）の緊急承認ケース
    const result1 = approveRequirementChange(
      "文部科学省の補助金申請に関する紙保管要件の変更",
      "全学的な申請業務に影響するシステム変更が必要",
      "standard",
      9
    );
    expect(result1).toEqual({
      approved: true,
      approvalComment: "法令違反リスク回避のため緊急承認",
      nextAction: "即座に文書分類基準を更新",
      urgencyLevel: "緊急"
    });

    // 通常承認ケース（権限内かつ補助金関連）
    const result2 = approveRequirementChange(
      "文部科学省の補助金書類保管方法の変更について",
      "影響範囲は限定的で通常の承認プロセスで対応可能な変更",
      "standard",
      5
    );
    expect(result2).toEqual({
      approved: true,
      approvalComment: "通常承認",
      nextAction: "文書分類基準の更新を実施",
      urgencyLevel: "通常"
    });

    // 理事会承認が必要なケース（権限外の大規模変更）
    const result3 = approveRequirementChange(
      "全学システムの根本的な変更を伴う法令改正対応",
      "この変更は1000文字を超える大規模な影響分析が必要で、事務局長の権限を超える内容を含んでいます。全学的なシステム変更とガバナンス体制の見直しが必要となり、理事会レベルでの意思決定が求められます。",
      "standard",
      3
    );
    expect(result3).toEqual({
      approved: false,
      approvalComment: "理事会承認が必要",
      nextAction: "理事会への上申準備",
      urgencyLevel: "保留"
    });

    // 変更要件が空の場合のエラーテスト
    expect(() => {
      approveRequirementChange("", "影響分析結果", "standard", 5);
    }).toThrow("変更要件の内容が不十分です。具体的な変更内容を記載してください。");

    // 影響分析結果が提供されていない場合のエラーテスト
    expect(() => {
      approveRequirementChange("変更要件内容", "", "standard", 5);
    }).toThrow("影響分析が完了していません。承認判定に必要な分析結果を確認してください。");
  });
});