import {
  validateApplicationInput,
  validateApplicationAmountAndPeriod,
  classifyDocumentTypeAndRoute,
  determineDocumentTypeAndRoute,
  checkMoeComplianceRequirements,
  setApprovalDeadline,
  validateApplicationBeforeSubmission,
  determinePriorityForApprovalNotification,
  determineDocumentProcessingRoute,
  checkComplianceAndDetermineRoute,
  determineDocumentStorageMethod,
  classifyDocumentType,
  evaluateSubsidyRelevance,
  determineDigitalizationEligibility,
  determineProcessingRoute
} from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  
  test("申請内容入力検証 - 必須項目が全て入力されている場合、次の処理に進むことができる", () => {
    // SCEN-417
    const result = validateApplicationInput(
      "科研費基盤研究申請書について",
      "科学研究費助成事業における基盤研究の申請を行います。研究目的は新材料開発であり、5年間の研究計画を策定しています。",
      "補助金申請",
      "工学研究科",
      "通常"
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("申請内容入力検証 - 必須項目が未入力の場合、エラーメッセージが表示される", () => {
    // SCEN-418
    expect(() => {
      validateApplicationInput(
        "",
        "申請内容です",
        "補助金申請", 
        "工学研究科",
        "通常"
      );
    }).toThrow("申請書類のタイトルは必須項目です。入力してください。");
  });

  test("申請内容入力検証 - 必須項目の境界値での入力時、適切に検証される", () => {
    // SCEN-419
    const result = validateApplicationInput(
      "1234567890", // 10文字ちょうど
      "12345678901234567890123456789012345678901234567890", // 50文字ちょうど
      "補助金申請",
      "工学研究科", 
      "通常"
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("文書種別自動判別 - 補助金関連文書の場合、ハイブリッド処理ルートが設定される", () => {
    // SCEN-423
    const result = classifyDocumentTypeAndRoute(
      "科研費基盤研究申請書",
      "科学研究費助成事業の基盤研究申請です。運営費交付金を活用した研究設備整備費の申請を行います。",
      "理学部"
    );

    expect(result.subsidyRelated).toBe(true);
    expect(result.paperStorageRequired).toBe(true);
    expect(result.processingRoute).toBe("hybrid");
  });

  test("文書種別自動判別 - 非補助金関連文書の場合、電子のみ処理ルートが設定される", () => {
    // SCEN-424
    const result = classifyDocumentTypeAndRoute(
      "人事異動申請書",
      "職員の人事異動に関する申請書類です。配置転換の希望理由と今後の業務計画について記載しています。",
      "人事課"
    );

    expect(result.subsidyRelated).toBe(false);
    expect(result.paperStorageRequired).toBe(false);
    expect(result.processingRoute).toBe("electronic");
  });

  test("文書種別自動判別 - 判別困難な文書の場合、適切なデフォルトルートが設定される", () => {
    // SCEN-425
    const result = classifyDocumentTypeAndRoute(
      "研究資料申請",
      "研究に必要な資料の申請です。図書館での資料閲覧許可を求めています。",
      "図書館"
    );

    expect(result.subsidyRelated).toBe(false);
    expect(result.processingRoute).toBe("electronic");
  });

  test("文書種別自動判定 - 申請書類の内容から文書種別が正しく判定される", () => {
    // SCEN-471
    const result = classifyDocumentType(
      "科研費申請書",
      "科学研究費助成事業の申請を行います。基盤研究での研究計画書です。",
      "補助金申請"
    );

    expect(result.documentType).toBe("補助金申請");
    expect(result.subsidyRelated).toBe(true);
  });

  test("文書種別自動判定 - 補助金関連度と処理ルートが適切に決定される", () => {
    // SCEN-472
    const result = classifyDocumentType(
      "運営費交付金設備申請",
      "運営費交付金による設備整備費の申請書類です。研究用機器の購入を計画しています。",
      "設備申請"
    );

    expect(result.subsidyRelated).toBe(true);
    expect(result.paperStorageRequired).toBe(true);
    expect(result.processingRoute).toBe("hybrid");
  });

  test("文書種別自動判定 - 判定困難な内容の場合、適切なデフォルト処理が実行される", () => {
    // SCEN-473
    const result = classifyDocumentType(
      "会議資料",
      "次回の委員会で使用する資料です。",
      "一般申請"
    );

    expect(result.subsidyRelated).toBe(false);
    expect(result.processingRoute).toBe("electronic");
  });

  test("電子化可否判定 - 補助金関連文書でハイブリッド処理が選択される", () => {
    // SCEN-474
    const result = determineDigitalizationEligibility(
      "科研費実績報告書",
      "科学研究費助成事業の実績報告書です。研究成果と経費使用実績を報告します。",
      "補助金申請書",
      85
    );

    expect(result.subsidyRelated).toBe(true);
    expect(result.paperStorageRequired).toBe(true);
    expect(result.processingRoute).toBe("hybrid");
  });

  test("電子化可否判定 - 非補助金文書で電子のみ処理が選択される", () => {
    // SCEN-475
    const result = determineDigitalizationEligibility(
      "出張申請書",
      "学会発表のための出張申請書類です。旅費と宿泊費の申請を行います。",
      "旅費申請",
      15
    );

    expect(result.subsidyRelated).toBe(false);
    expect(result.paperStorageRequired).toBe(false);
    expect(result.processingRoute).toBe("electronic");
  });

  test("電子化可否判定 - 判定基準が曖昧な文書の場合、安全側の処理ルートが選択される", () => {
    // SCEN-476
    const result = determineDigitalizationEligibility(
      "研究関連申請",
      "研究活動に関連する申請書類です。詳細な内容は別途説明します。",
      "その他",
      65
    );

    expect(result.subsidyRelated).toBe(false);
    expect(result.processingRoute).toBe("electronic");
  });

  test("文書保管方式選択 - 法令要件に基づいて適切な保管方式が選択される", () => {
    // SCEN-489
    const result = determineDocumentStorageMethod(
      "補助金会計報告書",
      "文部科学省補助金の会計報告書です。収支決算と監査結果を報告します。",
      "会計報告書",
      ["補助金", "会計報告", "監査資料"]
    );

    expect(result.subsidyRelated).toBe(true);
    expect(result.paperStorageRequired).toBe(true);
    expect(result.processingRoute).toBe("hybrid");
  });

  test("文書保管方式選択 - ハイブリッド処理必要文書で電子＋紙保管が選択される", () => {
    // SCEN-490
    const result = determineDocumentStorageMethod(
      "科研費事業報告書",
      "科学研究費助成事業の最終報告書です。研究成果と経費執行状況を報告します。",
      "事業報告書",
      ["科研費", "研究費", "事業報告"]
    );

    expect(result.subsidyRelated).toBe(true);
    expect(result.paperStorageRequired).toBe(true);
    expect(result.processingRoute).toBe("hybrid");
  });

  test("文書保管方式選択 - 保管方式判定条件が不明な場合、最も安全な方式が選択される", () => {
    // SCEN-491
    expect(() => {
      determineDocumentStorageMethod(
        "",
        "内容が不明です。",
        "未分類",
        []
      );
    }).toThrow("申請書類のタイトルが入力されていません。タイトルを入力してください。");
  });
});