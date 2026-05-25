import { determineLegalChangeProcessingPriority } from '../../src/logic/it-1-br-1779263788059-2-2-1';

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正優先度決定 - 最高優先度案件に対して適切な対応スケジュールが設定される", () => {
    // SCEN-511
    
    // 最高優先度の条件: 即日対応 + 全学影響 + 補助金申請書含有 + 処理負荷80%超
    const urgencyLevel = "即日対応";
    const impactScope = "全学";
    const affectedDocumentTypes = ["補助金申請書", "研究費申請書"];
    const currentProcessingLoad = 85; // 80%超
    
    const result = determineLegalChangeProcessingPriority(
      urgencyLevel,
      impactScope, 
      affectedDocumentTypes,
      currentProcessingLoad
    );
    
    // structured.formulaPseudoCode に基づく期待値計算:
    // basePriority = 4 (即日対応)
    // + 1 (全学影響) 
    // + 1 (補助金申請書含有)
    // = 6
    // scheduleDays = 1 (basePriority >= 4)
    // processingOrder = 5 - 6 = -1
    // notificationLevel = "緊急" (basePriority >= 4)
    
    expect(result.priority).toBe("最優先");
    expect(result.scheduleDays).toBe(1);
    expect(result.processingOrder).toBe(-1);
    expect(result.notificationLevel).toBe("緊急");
  });
});