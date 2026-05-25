import { analyzeRegulationImpactScope } from '../../src/logic/it-1-br-1779263788059-2-1-1';

const fetchMock = require("jest-fetch-mock");

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test("法令改正影響範囲分析 - 改正内容の影響を受ける文書種別が正しく特定される", () => {
    // SCEN-498
    
    const regulationChangeContent = "補助金申請書類の電子保管について文部科学省令第45条を改正し、研究費申請書および設備申請書において紙保管を必須とする。";
    const affectedRegulationTypes = ["文部科学省令", "補助金関連規則"];
    const currentDocumentTypes = [
      {
        typeName: "研究費申請書",
        regulationCategory: "文部科学省令",
        storageRequirement: "electronic"
      },
      {
        typeName: "設備申請書", 
        regulationCategory: "文部科学省令",
        storageRequirement: "electronic"
      },
      {
        typeName: "人事申請書",
        regulationCategory: "学内規則",
        storageRequirement: "electronic"
      },
      {
        typeName: "旅費申請書",
        regulationCategory: "会計規則",
        storageRequirement: "electronic"
      }
    ];

    const result = analyzeRegulationImpactScope(
      regulationChangeContent,
      affectedRegulationTypes,
      currentDocumentTypes
    );

    expect(result.affectedDocumentTypes).toEqual(["研究費申請書", "設備申請書"]);
    expect(result.processingRouteChanges).toEqual([
      {
        documentType: "研究費申請書",
        oldRoute: "electronic",
        newRoute: "hybrid"
      },
      {
        documentType: "設備申請書", 
        oldRoute: "electronic",
        newRoute: "hybrid"
      }
    ]);
    expect(result.impactLevel).toBe("中程度");
    expect(result.changeRequiredCount).toBe(2);
  });
});