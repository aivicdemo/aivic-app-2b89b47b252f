import { updateProcessingRoutesByRegulationChange } from "../../src/logic/it-1-br-1779263788059-2-2-1";

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  test("法令改正通知に基づいて処理ルートが正しく更新される", () => {
    // SCEN-492

    // 法令改正通知の内容
    const regulationChangeNotice = `
      文部科学省補助金交付要綱の改正について
      
      第15条 文書保管要件の変更
      - 設備購入申請書は電子保管のみ可能とする
      - 研究費申請書は引き続き紙保管を必須とする
      - 会計報告書は新たに紙保管を必須とする
    `;

    // 現在のシステム設定
    const currentDocumentClassification = [
      {
        documentType: "設備購入申請書",
        processingRoute: "hybrid",
        paperStorageRequired: true
      },
      {
        documentType: "研究費申請書", 
        processingRoute: "hybrid",
        paperStorageRequired: true
      },
      {
        documentType: "会計報告書",
        processingRoute: "electronic",
        paperStorageRequired: false
      },
      {
        documentType: "一般申請書",
        processingRoute: "electronic", 
        paperStorageRequired: false
      }
    ];

    // 影響を受ける可能性のある文書種別
    const affectedDocumentTypes = ["設備購入申請書", "研究費申請書", "会計報告書"];

    const result = updateProcessingRoutesByRegulationChange(
      regulationChangeNotice,
      currentDocumentClassification,
      affectedDocumentTypes
    );

    // 期待結果の計算
    // 設備購入申請書: hybrid → electronic (紙保管不要に変更)
    // 研究費申請書: hybrid → hybrid (変更なし)
    // 会計報告書: electronic → hybrid (紙保管必須に変更)
    const expectedUpdatedRoutes = [
      {
        documentType: "設備購入申請書",
        oldRoute: "hybrid",
        newRoute: "electronic"
      },
      {
        documentType: "会計報告書", 
        oldRoute: "electronic",
        newRoute: "hybrid"
      }
    ];

    // 関係者の連絡先（設備担当、会計担当、システム管理者）
    const expectedNotificationTargets = [
      "equipment@university.ac.jp",
      "accounting@university.ac.jp", 
      "system-admin@university.ac.jp"
    ];

    // 変更履歴
    const expectedChangeLog = {
      timestamp: expect.any(Date),
      changedRoutes: expectedUpdatedRoutes,
      regulationSource: "文部科学省補助金交付要綱",
      appliedDate: expect.any(Date)
    };

    expect(result.updatedRoutes).toEqual(expectedUpdatedRoutes);
    expect(result.notificationTargets).toEqual(expectedNotificationTargets);
    expect(result.changeLog).toEqual(expectedChangeLog);
  });
});