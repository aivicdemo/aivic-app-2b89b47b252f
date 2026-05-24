import { analyzeRegulationImpactScope } from '../../src/logic/it-1-br-1779263788059-2-2-1';

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正処理ルート更新において影響を受ける文書種別が正しく特定される", () => {
    // SCEN-493
    
    // 文部科学省からの法令改正通知（補助金関連の紙保管要件変更）
    const regulationChangeContent = "文部科学省告示第123号 補助金等に係る予算の執行の適正化に関する法律施行令の一部改正について 研究費申請書類および設備導入申請書類については電子保存のみで可とする";
    
    // 改正対象となる法令種類
    const affectedRegulationTypes = ["補助金適正化法", "研究費交付規則"];
    
    // 現在システムで管理している全文書種別
    const currentDocumentTypes = [
      {
        typeName: "研究費申請書",
        regulationCategory: "補助金適正化法",
        storageRequirement: "hybrid"
      },
      {
        typeName: "設備導入申請書",
        regulationCategory: "補助金適正化法", 
        storageRequirement: "hybrid"
      },
      {
        typeName: "人事申請書",
        regulationCategory: "労働基準法",
        storageRequirement: "electronic"
      },
      {
        typeName: "会計報告書",
        regulationCategory: "補助金適正化法",
        storageRequirement: "hybrid"
      },
      {
        typeName: "一般事務申請書",
        regulationCategory: "大学規則",
        storageRequirement: "electronic"
      }
    ];

    const result = analyzeRegulationImpactScope(
      regulationChangeContent,
      affectedRegulationTypes,
      currentDocumentTypes
    );

    // 補助金適正化法に該当する文書種別が影響対象として特定される
    expect(result.affectedDocumentTypes).toEqual([
      "研究費申請書",
      "設備導入申請書", 
      "会計報告書"
    ]);

    // 処理ルート変更が必要な文書種別が正しく特定される
    expect(result.processingRouteChanges).toEqual([
      {
        documentType: "研究費申請書",
        oldRoute: "hybrid",
        newRoute: "electronic"
      },
      {
        documentType: "設備導入申請書", 
        oldRoute: "hybrid",
        newRoute: "electronic"
      }
    ]);

    // 影響レベルが正しく判定される（変更が必要な文書種別が2件なので中程度）
    expect(result.impactLevel).toBe("中程度");

    // 処理ルート変更が必要な文書種別数が正しく計算される
    expect(result.changeRequiredCount).toBe(2);
  });
});