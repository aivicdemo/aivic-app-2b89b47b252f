import { analyzeRegulationImpactScope } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正処理ルート更新 - 影響を受ける文書種別が正しく特定される", () => {
    // SCEN-493
    
    const regulationChangeContent = "文部科学省補助金交付要綱改正により、科学研究費助成事業および設備整備費補助金の管理における文書保管要件を変更する。研究費申請書および設備導入計画書については電子媒体での保管を認め、従来の紙媒体保管義務を撤廃する。";
    
    const affectedRegulationTypes = ["補助金交付要綱", "研究費管理規則", "設備整備要綱"];
    
    const currentDocumentTypes = [
      { typeName: "研究費申請書", regulationCategory: "補助金交付要綱", storageRequirement: "hybrid" },
      { typeName: "設備導入計画書", regulationCategory: "設備整備要綱", storageRequirement: "hybrid" },
      { typeName: "人事異動申請書", regulationCategory: "人事管理規則", storageRequirement: "electronic" },
      { typeName: "旅費申請書", regulationCategory: "会計処理規則", storageRequirement: "electronic" },
      { typeName: "科研費実績報告書", regulationCategory: "補助金交付要綱", storageRequirement: "hybrid" },
      { typeName: "設備保守契約書", regulationCategory: "設備整備要綱", storageRequirement: "paper" }
    ];

    const result = analyzeRegulationImpactScope(regulationChangeContent, affectedRegulationTypes, currentDocumentTypes);

    expect(result.affectedDocumentTypes).toEqual([
      "研究費申請書",
      "設備導入計画書", 
      "科研費実績報告書",
      "設備保守契約書"
    ]);

    expect(result.processingRouteChanges).toEqual([
      { documentType: "研究費申請書", oldRoute: "hybrid", newRoute: "electronic" },
      { documentType: "設備導入計画書", oldRoute: "hybrid", newRoute: "electronic" },
      { documentType: "科研費実績報告書", oldRoute: "hybrid", newRoute: "electronic" },
      { documentType: "設備保守契約書", oldRoute: "paper", newRoute: "electronic" }
    ]);

    expect(result.impactLevel).toBe("重大");
    expect(result.changeRequiredCount).toBe(4);
  });
});