import { determinePriorityForReminder } from '../../src/logic/it-1-br-1-2-1';

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  test("催促対象優先度判定 - 優先度判定に必要な情報が不足している場合、エラーが発生する", () => {
    // SCEN-449
    
    // 情報不足のケース1: 滞留案件の一覧が空
    expect(() => {
      determinePriorityForReminder(
        [],
        { delayWeight: 10, levelWeight: 5, importanceWeight: 15 }
      );
    }).toThrow("催促対象となる滞留案件が存在しません。承認進捗を再確認してください。");

    // 情報不足のケース2: 重み係数に負の値が含まれる
    expect(() => {
      determinePriorityForReminder(
        [
          {
            applicationId: "APP-001",
            delayDays: 5,
            approverLevel: 3,
            documentImportance: 8,
            applicantDepartment: "経理課"
          }
        ],
        { delayWeight: -5, levelWeight: 5, importanceWeight: 15 }
      );
    }).toThrow("優先度計算の重み係数に無効な値が設定されています。システム管理者にお問い合わせください。");

    // 情報不足のケース3: 重み係数の重要度係数が負の値
    expect(() => {
      determinePriorityForReminder(
        [
          {
            applicationId: "APP-002",
            delayDays: 3,
            approverLevel: 2,
            documentImportance: 6,
            applicantDepartment: "総務課"
          }
        ],
        { delayWeight: 10, levelWeight: 5, importanceWeight: -10 }
      );
    }).toThrow("優先度計算の重み係数に無効な値が設定されています。システム管理者にお問い合わせください。");
  });
});