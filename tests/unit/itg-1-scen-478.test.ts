import { determineApprovalAuthority } from '../../src/logic/it-1-br-2-2-1';

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("承認権限レベル判定 - 権限不足の承認者の場合、上位承認者に振り分けられる", () => {
    // SCEN-478
    
    // 課長が1000万円の補助金申請を承認しようとする（権限不足）
    const approverPosition = "課長";
    const applicationAmount = 10000000;
    const applicationType = "補助金申請";
    const approvalAction = "approve";
    
    const result = determineApprovalAuthority(approverPosition, applicationAmount, applicationType, approvalAction);
    
    // 権限不足なので上位承認者にエスカレーション
    expect(result.hasAuthority).toBe(false);
    expect(result.requiredPosition).toBe("理事");
    expect(result.nextApprover).toBe("理事");
    expect(result.processingRoute).toBe("escalate");
  });
});