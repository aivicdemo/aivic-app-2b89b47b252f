import { analyzeRegulationImpactScope } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("法令改正影響範囲分析で予期しないデータ形式が検出された場合にエラーが発生する", () => {
    // SCEN-500
    const regulationChangeContent = "補助金要件変更: 研究費申請の電子化義務付け";
    const affectedRegulationTypes = ["補助金法", "研究費規則"];
    
    // 正常なデータ形式での動作確認
    const validDocumentTypes = [
      { typeName: "補助金申請書", regulationCategory: "補助金法", storageRequirement: "electronic" },
      { typeName: "研究費申請書", regulationCategory: "研究費規則", storageRequirement: "paper" }
    ];
    
    const validResult = analyzeRegulationImpactScope(
      regulationChangeContent,
      affectedRegulationTypes,
      validDocumentTypes
    );
    
    expect(validResult.affectedDocumentTypes).toEqual(["補助金申請書", "研究費申請書"]);
    expect(validResult.processingRouteChanges).toEqual([
      { documentType: "研究費申請書", oldRoute: "paper", newRoute: "hybrid" }
    ]);
    expect(validResult.impactLevel).toBe("中程度");
    expect(validResult.changeRequiredCount).toBe(1);

    // 予期しないデータ形式: typeNameが存在しない
    const invalidDocumentTypes1 = [
      { name: "補助金申請書", regulationCategory: "補助金法", storageRequirement: "electronic" }
    ];
    
    expect(() => analyzeRegulationImpactScope(
      regulationChangeContent,
      affectedRegulationTypes,
      invalidDocumentTypes1 as any
    )).toThrow("現在システムで管理している全文書種別の一覧");

    // 予期しないデータ形式: storageRequirementが不正な値
    const invalidDocumentTypes2 = [
      { typeName: "補助金申請書", regulationCategory: "補助金法", storageRequirement: "invalid_format" }
    ];
    
    expect(() => analyzeRegulationImpactScope(
      regulationChangeContent,
      affectedRegulationTypes,
      invalidDocumentTypes2
    )).toThrow("現在システムで管理している全文書種別の一覧");

    // 予期しないデータ形式: 配列ではない
    expect(() => analyzeRegulationImpactScope(
      regulationChangeContent,
      affectedRegulationTypes,
      {} as any
    )).toThrow("現在システムで管理している全文書種別の一覧");

    // 予期しないデータ形式: null/undefined
    expect(() => analyzeRegulationImpactScope(
      regulationChangeContent,
      affectedRegulationTypes,
      null as any
    )).toThrow("現在システムで管理している全文書種別の一覧");
  });
});