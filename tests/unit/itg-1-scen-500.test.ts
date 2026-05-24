import { analyzeRegulationImpactScope } from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("法令改正影響範囲分析で予期しないデータ形式が検出された場合エラーが発生する", () => {
    // SCEN-500
    
    // 正常な入力データでの動作確認
    const validRegulationChange = "補助金交付要綱の改正により、研究費申請書の保管期間が5年から7年に延長される";
    const validAffectedTypes = ["補助金申請書", "研究費申請書"];
    const validDocumentTypes = [
      { typeName: "補助金申請書", regulationCategory: "補助金関連", storageRequirement: "electronic" },
      { typeName: "研究費申請書", regulationCategory: "補助金関連", storageRequirement: "electronic" }
    ];

    const result = analyzeRegulationImpactScope(
      validRegulationChange,
      validAffectedTypes,
      validDocumentTypes
    );

    expect(result.affectedDocumentTypes).toEqual(["補助金申請書", "研究費申請書"]);
    expect(result.processingRouteChanges).toHaveLength(2);
    expect(result.impactLevel).toBe("中程度");
    expect(result.changeRequiredCount).toBe(2);

    // 空の法令改正内容でエラーが発生することを確認
    expect(() => analyzeRegulationImpactScope(
      "",
      validAffectedTypes,
      validDocumentTypes
    )).toThrow("法令改正の変更内容が正しく取得できていません。改正通知の受信処理を確認してください。");

    // 文字数不足の法令改正内容でエラーが発生することを確認
    expect(() => analyzeRegulationImpactScope(
      "改正",
      validAffectedTypes,
      validDocumentTypes
    )).toThrow("法令改正の変更内容が正しく取得できていません。改正通知の受信処理を確認してください。");

    // 現在の文書種別一覧が取得できない場合のエラー確認
    expect(() => analyzeRegulationImpactScope(
      validRegulationChange,
      validAffectedTypes,
      []
    )).toThrow("システムに登録されている文書種別の情報を取得できません。データベース接続を確認してください。");

    // 影響文書種別が100件を超える場合の警告確認
    const manyDocumentTypes = Array.from({ length: 101 }, (_, i) => ({
      typeName: `文書種別${i}`,
      regulationCategory: "補助金関連",
      storageRequirement: "electronic"
    }));
    
    console.warn = jest.fn();
    const resultMany = analyzeRegulationImpactScope(
      validRegulationChange,
      Array.from({ length: 101 }, (_, i) => `文書種別${i}`),
      manyDocumentTypes
    );
    
    expect(console.warn).toHaveBeenCalledWith("影響範囲が非常に広範囲です。段階的な対応計画の策定を推奨します。");
  });
});