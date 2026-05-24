import { approveRequirementChange } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("変更要件承認処理 - 承認却下時に適切な理由と共に差戻しが実行される", () => {
    // SCEN-502

    // 承認却下（理事会承認が必要なケース）
    const result1 = approveRequirementChange(
      "補助金申請書類の電子化処理ルートから紙保管必須ルートへの変更要求。影響範囲は全学的で、設備申請、研究費申請、人事申請等の主要業務に波及する。システム改修工数は2ヶ月以上を要し、関連部署は10以上。",
      "影響範囲: 全学的（事務局、総務部、財務部、学務部、研究推進部、図書館、情報システム課など10以上の部署）\n対象文書: 補助金申請書、実績報告書、収支決算書、設備購入申請書\nシステム変更: データベーススキーマ変更、API仕様変更、UI大幅改修\n予想工数: 約320時間（2ヶ月）",
      "standard",
      3
    );

    expect(result1).toEqual({
      approved: false,
      approvalComment: "理事会承認が必要",
      nextAction: "理事会への上申準備",
      urgencyLevel: "保留"
    });

    // 承認可能（法令違反リスク回避による緊急承認）
    const result2 = approveRequirementChange(
      "文部科学省からの緊急通達により、補助金関連書類の紙保管要件が新たに追加。期限は2週間以内で、対応遅延は法令違反となる可能性が高い。",
      "文部科学省通達対応: 緊急性有り\n対象書類: 科研費申請書、設備整備費申請書\n影響部署: 研究推進部、財務部\n変更内容: 電子保管から電子+紙ハイブリッド保管への変更",
      "standard",
      9
    );

    expect(result2).toEqual({
      approved: true,
      approvalComment: "法令違反リスク回避のため緊急承認",
      nextAction: "即座に文書分類基準を更新",
      urgencyLevel: "緊急"
    });

    // 通常承認（文部科学省関連で権限内）
    const result3 = approveRequirementChange(
      "補助金申請書類の処理ルート効率化。文部科学省要件に準拠した電子化推進により、処理時間短縮とコスト削減を実現。",
      "対象: 文部科学省関連補助金\n効果: 処理時間30%短縮、コスト20%削減\n影響範囲: 限定的（研究推進部、財務部のみ）\n実装工数: 約40時間",
      "standard",
      4
    );

    expect(result3).toEqual({
      approved: true,
      approvalComment: "通常承認",
      nextAction: "文書分類基準の更新を実施",
      urgencyLevel: "通常"
    });
  });
});