import { handleSystemFailureFallback } from "../../src/logic/it-1";

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム障害時承認継続 - 障害復旧後のデータ同期が正常に実行される", () => {
    // SCEN-463
    
    // 正常時のケース
    expect(handleSystemFailureFallback("up", "APP-001", "staff")).toEqual({
      fallbackMethod: "normal",
      emergencyContactList: [],
      paperFormUrl: "",
      syncRequired: false
    });

    // システム障害時のケース
    expect(handleSystemFailureFallback("down", "APP-002", "staff")).toEqual({
      fallbackMethod: "emergency_paper",
      emergencyContactList: ["emergency_contact@university.ac.jp"],
      paperFormUrl: "https://system.university.ac.jp/emergency/form/APP-002",
      syncRequired: true
    });

    // 制約確認: 申請書類の識別番号が存在しない場合
    expect(() => handleSystemFailureFallback("down", "", "staff")).toThrow(
      "指定された申請書類が見つかりません。正しい申請番号を入力してください。"
    );

    // 制約確認: システム障害が長時間継続している場合の警告
    console.warn = jest.fn();
    handleSystemFailureFallback("critical_failure", "APP-003", "staff");
    expect(console.warn).toHaveBeenCalledWith(
      "システム障害が長時間継続しています。緊急の場合は情報システム課まで直接お電話ください。"
    );
  });
});