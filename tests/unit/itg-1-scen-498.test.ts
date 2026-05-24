import { analyzeRegulationImpactScope } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("法令改正の影響を受ける文書種別を特定し、処理ルート変更が必要な文書種別とその変更内容を判定する", () => {
    // SCEN-498
    
    const regulationChangeContent = "補助金に関する電子保存の要件を緩和し、一部の実績報告書については電子のみでの保存を可能とする。ただし、設備導入申請書については従来通り紙保存を必須とする。";
    const affectedRegulationTypes = ["補助金関連法令", "文書保存規則"];
    const currentDocumentTypes = [
      {
        typeName: "補助金申請書",
        regulationCategory: "補助金関連法令",
        storageRequirement: "hybrid"
      },
      {
        typeName: "実績報告書", 
        regulationCategory: "補助金関連法令",
        storageRequirement: "hybrid"
      },
      {
        typeName: "設備導入申請書",
        regulationCategory: "補助金関連法令", 
        storageRequirement: "hybrid"
      },
      {
        typeName: "一般事務書類",
        regulationCategory: "一般事務規則",
        storageRequirement: "electronic"
      }
    ];

    const result = analyzeRegulationImpactScope(regulationChangeContent, affectedRegulationTypes, currentDocumentTypes);

    expect(result.affectedDocumentTypes).toEqual(["補助金申請書", "実績報告書", "設備導入申請書"]);
    expect(result.processingRouteChanges).toEqual([
      { documentType: "実績報告書", oldRoute: "hybrid", newRoute: "electronic" }
    ]);
    expect(result.impactLevel).toBe("軽微");
    expect(result.changeRequiredCount).toBe(1);
  });
});