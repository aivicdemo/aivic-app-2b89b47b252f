import { determineApprovalHierarchy } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("最高額の申請金額の場合、理事承認まで設定される", () => {
    // SCEN-428
    
    // 最高額（1億円超）の申請金額で理事承認が設定されることを検証
    const result = determineApprovalHierarchy(150000000, "物品購入", "総務部");
    
    expect(result.approvalLevel).toBe("理事承認");
    expect(result.approvers).toContain("理事");
    expect(result.estimatedDays).toBe(7);
    expect(result.requiresPaperApproval).toBe(false);
    
    // 補助金関連で高額の場合も理事承認が設定される
    const subsidyResult = determineApprovalHierarchy(50000000, "補助金申請", "研究推進課");
    
    expect(subsidyResult.approvalLevel).toBe("理事承認");
    expect(subsidyResult.approvers).toContain("理事");
    expect(subsidyResult.estimatedDays).toBe(7);
    expect(subsidyResult.requiresPaperApproval).toBe(true);
    
    // 境界値：100万円未満は課長承認
    const lowAmountResult = determineApprovalHierarchy(500000, "旅費申請", "学務課");
    
    expect(lowAmountResult.approvalLevel).toBe("課長承認");
    expect(lowAmountResult.estimatedDays).toBe(3);
    
    // 境界値：100万円以上は理事承認
    const highAmountResult = determineApprovalHierarchy(1000000, "設備購入", "経理課");
    
    expect(highAmountResult.approvalLevel).toBe("理事承認");
    expect(highAmountResult.estimatedDays).toBe(7);
    
    // エラーケース：申請金額が0円以下
    expect(() => {
      determineApprovalHierarchy(0, "物品購入", "総務部");
    }).toThrow("申請金額は1円以上で入力してください");
    
    // エラーケース：所属部署が未入力
    expect(() => {
      determineApprovalHierarchy(1000000, "物品購入", "");
    }).toThrow("承認ルート設定のため、所属部署を入力してください");
    
    // 警告ケース：高額申請（1億円超）
    const veryHighAmountResult = determineApprovalHierarchy(200000000, "設備購入", "研究推進課");
    
    expect(veryHighAmountResult.approvalLevel).toBe("理事承認");
  });
});