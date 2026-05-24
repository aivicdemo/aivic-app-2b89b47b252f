import {
  validateApplicationBeforeSubmission,
  setApproverAuthorityLevel,
  determineApprovalHierarchy,
  setApprovalDeadline
} from "../../src/logic/it-1-br-1779263788059-2-1-1";

describe("申請書類の種別を自動判別し適切な処理ルートを決定する機能", () => {
  test("申請書類提出検証 - すべての検証項目を満たす場合、申請が正常に提出される", () => {
    // SCEN-429
    
    // 正常な申請書類データの準備
    const documentTitle = "令和6年度科学研究費補助金基盤研究(A)申請書";
    const documentContent = "本研究は、人工知能技術を活用した教育支援システムの開発を目的とする。従来の教育手法では対応困難な個別学習支援において、機械学習アルゴリズムを用いた学習者行動分析により、最適化された学習経路を提示するシステムを構築する。";
    const documentType = "補助金申請書";
    const processingRoute = "hybrid";
    const approvalRoute = ["課長", "部長", "事務局長"];
    const requiredFields = {
      "申請金額": 5000000,
      "研究期間": "2024年4月〜2027年3月",
      "研究代表者": "山田太郎",
      "所属部署": "工学部"
    };

    // 申請前検証（validateApplicationBeforeSubmission）
    const validationResult = validateApplicationBeforeSubmission(
      documentTitle,
      documentContent,
      documentType,
      processingRoute,
      approvalRoute,
      requiredFields
    );

    // すべての検証項目が満たされている場合の期待結果
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errors).toEqual([]);
    expect(validationResult.warnings).toEqual([]);

    // 承認者権限レベル設定（setApproverAuthorityLevel）
    const authorityResult = setApproverAuthorityLevel(
      documentType,
      true, // 補助金関連
      true, // 紙保管必要
      "工学部",
      5000000
    );

    expect(authorityResult.requiredAuthorityLevel).toBe("department_head");
    expect(authorityResult.approverRoles).toEqual(["department_head", "administrative_director"]);
    expect(authorityResult.escalationRequired).toBe(false);

    // 承認階層決定（determineApprovalHierarchy）
    const hierarchyResult = determineApprovalHierarchy(
      5000000,
      "補助金申請",
      "工学部"
    );

    expect(hierarchyResult.approvalLevel).toBe("部長承認");
    expect(hierarchyResult.estimatedDays).toBe(5);
    expect(hierarchyResult.requiresPaperApproval).toBe(true);

    // 承認期限設定（setApprovalDeadline）
    const submissionDate = new Date("2024-01-15T09:00:00Z");
    const deadlineResult = setApprovalDeadline(
      "補助金申請書",
      true, // 補助金関連
      "標準",
      submissionDate
    );

    const expectedDeadline = new Date(submissionDate.getTime() + 5 * 24 * 60 * 60 * 1000);
    expect(deadlineResult.deadlineDate).toEqual(expectedDeadline);
    expect(deadlineResult.businessDays).toBe(5);
    expect(deadlineResult.notificationSchedule).toEqual(["2日前", "当日"]);
  });
});