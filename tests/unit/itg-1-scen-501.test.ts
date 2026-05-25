import { approveRequirementChange } from '../../src/logic/it-1-br-1779263788059-2-2-1';

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("事務局長による変更要件承認が正常に処理される", () => {
    // SCEN-501
    
    // 法令改正に伴う処理ルート変更の具体的な要件内容
    const changeRequirements = "補助金関連書類について、文部科学省の新しい要件により紙保管が必要となる文書種別を追加する";
    
    // 変更による業務への影響範囲分析結果（1000文字以内で事務局長権限内）
    const impactAnalysis = "研究費申請書と設備購入申請書について、電子のみ処理から電子＋紙ハイブリッド処理への変更が必要。影響部署は5部署、月間処理件数約200件への影響が見込まれる。";
    
    // 事務局長の標準承認権限レベル
    const directorAuthority = "standard";
    
    // 法令違反リスクレベル（10段階評価で8以上は高リスク）
    const complianceRisk = 8;
    
    const result = approveRequirementChange(
      changeRequirements,
      impactAnalysis, 
      directorAuthority,
      complianceRisk
    );
    
    // 法令違反リスクが8以上（高リスク）のため緊急承認となる
    expect(result.approved).toBe(true);
    expect(result.approvalComment).toBe("法令違反リスク回避のため緊急承認");
    expect(result.nextAction).toBe("即座に文書分類基準を更新");
    expect(result.urgencyLevel).toBe("緊急");
  });
});