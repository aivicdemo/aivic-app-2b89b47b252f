import { determineApprovalHierarchy } from '../../src/logic/it-1-br-2-2-1';

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("承認権限レベル判定 - 申請者と申請金額に基づいて適切な権限レベルが判定される", () => {
    // SCEN-477
    
    // 10万円未満の一般申請 - 課長承認
    const lowAmountResult = determineApprovalHierarchy(50000, "一般申請", "総務部");
    expect(lowAmountResult.approvalLevel).toBe("課長承認");
    expect(lowAmountResult.estimatedDays).toBe(3);
    expect(lowAmountResult.requiresPaperApproval).toBe(false);
    expect(lowAmountResult.approvers).toEqual(["課長"]);

    // 10万円以上100万円未満の一般申請 - 部長承認
    const mediumAmountResult = determineApprovalHierarchy(500000, "一般申請", "総務部");
    expect(mediumAmountResult.approvalLevel).toBe("部長承認");
    expect(mediumAmountResult.estimatedDays).toBe(5);
    expect(mediumAmountResult.requiresPaperApproval).toBe(false);
    expect(mediumAmountResult.approvers).toEqual(["部長"]);

    // 100万円以上の一般申請 - 理事承認
    const highAmountResult = determineApprovalHierarchy(2000000, "一般申請", "総務部");
    expect(highAmountResult.approvalLevel).toBe("理事承認");
    expect(highAmountResult.estimatedDays).toBe(7);
    expect(highAmountResult.requiresPaperApproval).toBe(false);
    expect(highAmountResult.approvers).toEqual(["理事"]);

    // 100万円以上の補助金申請 - 理事承認、紙承認必要
    const subsidyHighAmountResult = determineApprovalHierarchy(1500000, "補助金申請", "研究推進部");
    expect(subsidyHighAmountResult.approvalLevel).toBe("理事承認");
    expect(subsidyHighAmountResult.estimatedDays).toBe(7);
    expect(subsidyHighAmountResult.requiresPaperApproval).toBe(true);
    expect(subsidyHighAmountResult.approvers).toEqual(["理事"]);

    // 100万円未満の補助金申請 - 部長承認、紙承認必要
    const subsidyMediumAmountResult = determineApprovalHierarchy(800000, "補助金申請", "研究推進部");
    expect(subsidyMediumAmountResult.approvalLevel).toBe("部長承認");
    expect(subsidyMediumAmountResult.estimatedDays).toBe(5);
    expect(subsidyMediumAmountResult.requiresPaperApproval).toBe(true);
    expect(subsidyMediumAmountResult.approvers).toEqual(["部長"]);

    // 申請金額が0円以下の場合 - エラー
    expect(() => {
      determineApprovalHierarchy(0, "一般申請", "総務部");
    }).toThrow("申請金額は1円以上で入力してください");

    // 申請金額が1億円を超える場合 - 警告
    const veryHighAmountResult = determineApprovalHierarchy(150000000, "一般申請", "総務部");
    expect(veryHighAmountResult.approvalLevel).toBe("理事承認");
    expect(veryHighAmountResult.estimatedDays).toBe(7);

    // 所属部署が未入力の場合 - エラー
    expect(() => {
      determineApprovalHierarchy(100000, "一般申請", "");
    }).toThrow("承認ルート設定のため、所属部署を入力してください");
  });
});