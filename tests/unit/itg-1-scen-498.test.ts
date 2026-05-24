import { analyzeRegulationImpactScope } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("法令改正の影響を受ける文書種別と処理ルート変更が正しく特定される", () => {
    // SCEN-498
    const regulationChangeContent = "補助金申請書および実績報告書の保管期間を5年から7年に延長し、電子保管に加えて紙媒体での保管を必須とする";
    const affectedRegulationTypes = ["補助金関連法令", "文書保管規則"];
    const currentDocumentTypes = [
      { typeName: "補助金申請書", regulationCategory: "補助金関連法令", storageRequirement: "electronic" },
      { typeName: "実績報告書", regulationCategory: "補助金関連法令", storageRequirement: "electronic" },
      { typeName: "一般申請書", regulationCategory: "一般事務規則", storageRequirement: "electronic" },
      { typeName: "人事関連書類", regulationCategory: "人事規則", storageRequirement: "hybrid" }
    ];

    const result = analyzeRegulationImpactScope(regulationChangeContent, affectedRegulationTypes, currentDocumentTypes);

    expect(result.affectedDocumentTypes).toEqual(["補助金申請書", "実績報告書"]);
    expect(result.processingRouteChanges).toEqual([
      { documentType: "補助金申請書", oldRoute: "electronic", newRoute: "hybrid" },
      { documentType: "実績報告書", oldRoute: "electronic", newRoute: "hybrid" }
    ]);
    expect(result.impactLevel).toBe("中程度");
    expect(result.changeRequiredCount).toBe(2);
  });
});