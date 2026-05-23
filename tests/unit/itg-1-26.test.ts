import {
  validateApplicationInput,
  validateApplicationAmountAndPeriod,
  classifyDocumentTypeAndRoute,
  determineDocumentTypeAndRoute,
  checkMoeComplianceRequirements,
  setApprovalDeadline,
  processUrgentApplicationPriority,
  validateApplicationBeforeSubmission,
  determineProcessingRoute,
  checkComplianceAndDetermineRoute,
  handleDocumentClassificationException,
  determineDocumentStorageMethod,
  classifyDocumentType,
  evaluateSubsidyRelevance,
  determineDigitalizationEligibility
} from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  
  test("SCEN-417: 申請内容入力検証 - 必須項目が全て入力されている場合、次の処理に進むことができる", () => {
    const result = validateApplicationInput(
      "大学設備更新申請について",
      "研究設備の老朽化に伴い、新規設備導入により研究環境の向上を図る必要があります",
      "設備申請",
      "研究推進部",
      "通常"
    );
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("SCEN-418: 申請内容入力検証 - 必須項目が未入力の場合、エラーメッセージが表示される", () => {
    expect(() => validateApplicationInput(
      "",
      "申請内容の詳細です",
      "設備申請",
      "研究推進部",
      "通常"
    )).toThrow("申請書類のタイトルは必須項目です。入力してください。");
  });

  test("SCEN-419: 申請内容入力検証 - 必須項目の境界値での入力時、適切に検証される", () => {
    expect(() => validateApplicationInput(
      "123456789",
      "申請内容詳細を記載していますが文字数が足りません",
      "設備申請",
      "研究推進部",
      "通常"
    )).toThrow("申請書類のタイトルは10文字以上200文字以内で入力してください");
  });

  test("SCEN-423: 文書種別自動判別 - 補助金関連文書の場合、ハイブリッド処理ルートが設定される", () => {
    const result = classifyDocumentTypeAndRoute(
      "科研費申請に関する設備導入申請書",
      "文部科学省の科研費制度に基づく研究設備の導入申請について詳細を記載しております。運営費交付金を活用した設備整備費として申請いたします。",
      "研究推進部"
    );

    expect(result.subsidyRelated).toBe(true);
    expect(result.paperStorageRequired).toBe(true);
    expect(result.processingRoute).toBe("hybrid");
  });

  test("SCEN-424: 文書種別自動判別 - 非補助金関連文書の場合、電子のみ処理ルートが設定される", () => {
    const result = classifyDocumentTypeAndRoute(
      "職員の出張申請について",
      "学会発表のための出張申請書です。交通費と宿泊費の支給をお願いいたします。",
      "総務部"
    );

    expect(result.subsidyRelated).toBe(false);
    expect(result.paperStorageRequired).toBe(false);
    expect(result.processingRoute).toBe("electronic");
  });

  test("SCEN-425: 文書種別自動判別 - 判別困難な文書の場合、適切なデフォルトルートが設定される", () => {
    const result = classifyDocumentTypeAndRoute(
      "設備に関する申請",
      "設備の件について申請いたします。詳細は別途ご連絡いたします。",
      "総務部"
    );

    expect(result.subsidyRelated).toBe(false);
    expect(result.processingRoute).toBe("electronic");
  });

  test("SCEN-471: 文書種別自動判定 - 申請書類の内容から文書種別が正しく判定される", () => {
    const result = classifyDocumentType(
      "科研費基盤研究申請書",
      "文部科学省科学研究費助成事業における基盤研究の申請について記載いたします",
      "補助金申請"
    );

    expect(result.subsidyRelated).toBe(true);
    expect(result.documentType).toBe("補助金申請");
    expect(result.processingRoute).toBe("hybrid");
  });

  test("SCEN-472: 文書種別自動判定 - 補助金関連度と処理ルートが適切に決定される", () => {
    const result = evaluateSubsidyRelevance(
      "運営費交付金による設備整備費申請",
      "文部科学省運営費交付金制度を活用した研究設備の整備について申請いたします。設備整備費として予算を申請し、研究環境の向上を図ります。",
      "補助金申請書"
    );

    expect(result.subsidyRelevanceScore).toBeGreaterThanOrEqual(70);
    expect(result.subsidyRelated).toBe(true);
    expect(result.paperStorageRequired).toBe(true);
    expect(result.processingRoute).toBe("hybrid");
  });

  test("SCEN-473: 文書種別自動判定 - 判定困難な内容の場合、適切なデフォルト処理が実行される", () => {
    const result = handleDocumentClassificationException(
      "申請書",
      "申請内容について",
      null,
      "自動分類で判定できませんでした",
      "一般申請"
    );

    expect(result.finalDocumentType).toBe("一般申請");
    expect(result.exceptionReason).toContain("自動分類で判定できませんでした");
  });

  test("SCEN-474: 電子化可否判定 - 補助金関連文書でハイブリッド処理が選択される", () => {
    const result = determineDigitalizationEligibility(
      "科研費研究実績報告書",
      "文部科学省科学研究費補助金による研究実績の報告書を提出いたします",
      "補助金申請書",
      85
    );

    expect(result.subsidyRelated).toBe(true);
    expect(result.paperStorageRequired).toBe(true);
    expect(result.processingRoute).toBe("hybrid");
  });

  test("SCEN-475: 電子化可否判定 - 非補助金文書で電子のみ処理が選択される", () => {
    const result = determineDigitalizationEligibility(
      "職員研修参加申請書",
      "外部研修への参加申請について記載いたします",
      "一般申請",
      20
    );

    expect(result.subsidyRelated).toBe(false);
    expect(result.paperStorageRequired).toBe(false);
    expect(result.processingRoute).toBe("electronic");
  });

  test("SCEN-476: 電子化可否判定 - 判定基準が曖昧な文書の場合、安全側の処理ルートが選択される", () => {
    expect(() => determineDigitalizationEligibility(
      "",
      "申請内容です",
      "補助金申請書",
      75
    )).toThrow("申請書類のタイトルが入力されていません。タイトルを入力してください。");
  });

  test("SCEN-489: 文書保管方式選択 - 法令要件に基づいて適切な保管方式が選択される", () => {
    const result = determineDocumentStorageMethod(
      "文部科学省補助金事業報告書",
      "補助金事業の実施結果および会計報告について記載した事業報告書です",
      "事業報告書",
      ["補助金", "助成金", "文部科学省"]
    );

    expect(result.subsidyRelated).toBe(true);
    expect(result.paperStorageRequired).toBe(true);
    expect(result.processingRoute).toBe("hybrid");
  });

  test("SCEN-490: 文書保管方式選択 - ハイブリッド処理必要文書で電子＋紙保管が選択される", () => {
    const result = checkComplianceAndDetermineRoute(
      "科研費設備整備費申請書",
      "文部科学省科学研究費補助金の設備整備費として研究機器の購入申請を行います",
      "補助金申請書",
      ["科研費", "運営費交付金", "設備整備費", "補助金"]
    );

    expect(result.subsidyRelated).toBe(true);
    expect(result.paperStorageRequired).toBe(true);
    expect(result.processingRoute).toBe("hybrid");
    expect(result.complianceStatus).toBe("compliant");
  });

  test("SCEN-491: 文書保管方式選択 - 保管方式判定条件が不明な場合、最も安全な方式が選択される", () => {
    expect(() => determineDocumentStorageMethod(
      "",
      "申請書類の内容です",
      "一般申請",
      ["補助金", "助成金"]
    )).toThrow("申請書類のタイトルが入力されていません。タイトルを入力してください。");
  });

});