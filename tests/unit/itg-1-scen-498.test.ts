import { analyzeRegulationImpactScope } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("法令改正の影響範囲分析において改正内容の影響を受ける文書種別が正しく特定される", () => {
    // SCEN-498

    const regulationChangeContent = "文部科学省の補助金申請書および実績報告書の電子化に関する法令改正により、科学研究費補助金申請書類の保管要件が変更されます。";
    const affectedRegulationTypes = ["補助金法", "文部科学省令"];
    const currentDocumentTypes = [
      { typeName: "科研費申請書", regulationCategory: "補助金法", storageRequirement: "electronic" },
      { typeName: "実績報告書", regulationCategory: "補助金法", storageRequirement: "electronic" },
      { typeName: "人事申請書", regulationCategory: "労働法", storageRequirement: "electronic" },
      { typeName: "設備申請書", regulationCategory: "会計法", storageRequirement: "hybrid" }
    ];

    const result = analyzeRegulationImpactScope(
      regulationChangeContent,
      affectedRegulationTypes,
      currentDocumentTypes
    );

    expect(result.affectedDocumentTypes).toEqual(["科研費申請書", "実績報告書"]);
    expect(result.processingRouteChanges).toEqual([
      { documentType: "科研費申請書", oldRoute: "electronic", newRoute: "hybrid" },
      { documentType: "実績報告書", oldRoute: "electronic", newRoute: "hybrid" }
    ]);
    expect(result.impactLevel).toBe("中程度");
    expect(result.changeRequiredCount).toBe(2);
  });
});