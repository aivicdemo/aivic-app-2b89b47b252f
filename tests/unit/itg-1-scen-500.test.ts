import { analyzeRegulationImpactScope } from '../../src/logic/it-1-br-1779263788059-2-1-1';

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("法令改正影響範囲分析で予期しないデータ形式が検出された場合、エラーが発生する", () => {
    // SCEN-500
    
    // 不正なデータ形式のテスト
    const invalidRegulationContent = "";
    const validAffectedTypes = ["補助金申請書"];
    const validCurrentDocTypes = [
      { typeName: "補助金申請書", regulationCategory: "文部科学省", storageRequirement: "paper" }
    ];

    expect(() => {
      analyzeRegulationImpactScope(invalidRegulationContent, validAffectedTypes, validCurrentDocTypes);
    }).toThrow("法令改正の変更内容が正しく取得できていません。改正通知の受信処理を確認してください。");

    // 現在の文書種別一覧が不正な場合
    const validRegulationContent = "補助金申請書類の保管要件を電子化対応に変更";
    const validAffectedTypes2 = ["補助金申請書"];
    const invalidCurrentDocTypes = null;

    expect(() => {
      analyzeRegulationImpactScope(validRegulationContent, validAffectedTypes2, invalidCurrentDocTypes);
    }).toThrow("システムに登録されている文書種別の情報を取得できません。データベース接続を確認してください。");

    // 影響を受ける文書種別が100件を超える場合の警告
    const validRegulationContent2 = "全申請書類の処理ルート変更";
    const validAffectedTypes3 = ["補助金申請書"];
    const manyCurrentDocTypes = Array.from({ length: 101 }, (_, i) => ({
      typeName: `文書種別${i}`,
      regulationCategory: "文部科学省",
      storageRequirement: "paper"
    }));

    const result = analyzeRegulationImpactScope(validRegulationContent2, validAffectedTypes3, manyCurrentDocTypes);
    
    // 正常なケース（参考として）
    expect(result.affectedDocumentTypes.length).toBeGreaterThan(0);
    expect(result.impactLevel).toBe("重大");
    expect(result.changeRequiredCount).toBeGreaterThan(0);
  });
});