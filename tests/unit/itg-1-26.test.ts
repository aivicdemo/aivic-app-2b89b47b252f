import { 
  validateApplicationInput,
  validateApplicationAmountAndPeriod,
  classifyDocumentTypeAndRoute,
  determineDocumentTypeAndRoute,
  checkMoeComplianceRequirements,
  determineDigitalizationEligibility,
  determineProcessingRoute,
  handleDocumentClassificationException,
  determineDocumentStorageMethod
} from "../../src/logic/it-1-br-2-1-1";

const fetchMock = require("jest-fetch-mock");

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-417: [normal] 申請内容入力検証 - 必須項目が全て入力されている場合、次の処理に進むことができる
  test("必須項目が全て適切に入力されている場合、有効と判定される", () => {
    const result = validateApplicationInput(
      "新しい研究設備導入に関する補助金申請について",
      "本申請は、研究室の実験装置を更新するための補助金申請です。新設備により研究効率が大幅に向上することが期待されます。",
      "補助金申請",
      "理学部事務課",
      "通常"
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // SCEN-418: [error] 申請内容入力検証 - 必須項目が未入力の場合、エラーメッセージが表示される
  test("申請書類のタイトルが空の場合、エラーが発生する", () => {
    expect(() => {
      validateApplicationInput(
        "",
        "申請内容の詳細説明です。必要な設備の導入により業務効率が向上します。",
        "設備申請",
        "工学部事務課",
        "通常"
      );
    }).toThrow("申請書類のタイトルは必須項目です。入力してください。");
  });

  // SCEN-419: [edge] 申請内容入力検証 - 必須項目の境界値での入力時、適切に検証される
  test("申請内容が50文字未満の場合、エラーが発生する", () => {
    expect(() => {
      validateApplicationInput(
        "設備導入申請書",
        "短い内容です",
        "設備申請",
        "理学部事務課",
        "通常"
      );
    }).toThrow("申請内容は50文字以上で詳しく記載してください。");
  });

  // SCEN-423: [normal] 文書種別自動判別 - 補助金関連文書の場合、ハイブリッド処理ルートが設定される
  test("補助金関連キーワードを含む文書はハイブリッド処理ルートに分類される", () => {
    const result = classifyDocumentTypeAndRoute(
      "科研費による研究設備購入申請",
      "文部科学省の科学研究費補助金を活用した研究機器の購入申請です。運営費交付金との併用により効率的な研究環境整備を目指します。",
      "研究推進課"
    );

    expect(result.subsidyRelated).toBe(true);
    expect(result.processingRoute).toBe("hybrid");
    expect(result.paperStorageRequired).toBe(true);
  });

  // SCEN-424: [normal] 文書種別自動判別 - 非補助金関連文書の場合、電子のみ処理ルートが設定される
  test("一般的な業務申請は電子のみ処理ルートに分類される", () => {
    const result = classifyDocumentTypeAndRoute(
      "教室使用許可申請",
      "学会開催のための教室使用許可を申請します。参加者数は約50名を予定しており、プロジェクター等の設備使用も希望します。",
      "総務課"
    );

    expect(result.subsidyRelated).toBe(false);
    expect(result.processingRoute).toBe("electronic");
    expect(result.paperStorageRequired).toBe(false);
  });

  // SCEN-425: [edge] 文書種別自動判別 - 判別困難な文書の場合、適切なデフォルトルートが設定される
  test("判別困難な文書はデフォルトで電子処理ルートに設定される", () => {
    const result = classifyDocumentTypeAndRoute(
      "資料請求",
      "会議資料を準備します",
      "事務局"
    );

    expect(result.subsidyRelated).toBe(false);
    expect(result.processingRoute).toBe("electronic");
    expect(result.paperStorageRequired).toBe(false);
  });

  // SCEN-471: [normal] 文書種別自動判定 - 申請書類の内容から文書種別が正しく判定される
  test("申請書類の内容から適切な文書種別が判定される", () => {
    const result = determineDocumentTypeAndRoute(
      "運営費交付金による設備整備申請書",
      "大学運営費交付金を財源とした研究設備の整備申請です。文部科学省の基準に従い適切な手続きを行います。",
      "財務課"
    );

    expect(result.isSubsidyRelated).toBe(true);
    expect(result.documentType).toBe("補助金申請");
    expect(result.processingRoute).toBe("hybrid");
  });

  // SCEN-472: [normal] 文書種別自動判定 - 補助金関連度と処理ルートが適切に決定される
  test("補助金関連度70%以上の文書はハイブリッド処理が選択される", () => {
    const result = determineDocumentTypeAndRoute(
      "文部科学省補助金実績報告書",
      "科学研究費補助金の実績報告書です。研究成果と予算執行状況について詳細に記載し、運営費交付金との関連も含めて報告いたします。",
      "研究推進課"
    );

    expect(result.isSubsidyRelated).toBe(true);
    expect(result.processingRoute).toBe("hybrid");
    expect(result.requiresPaperStorage).toBe(true);
  });

  // SCEN-473: [edge] 文書種別自動判定 - 判定困難な内容の場合、適切なデフォルト処理が実行される
  test("判定困難な内容の場合は電子処理がデフォルト選択される", () => {
    const result = determineDocumentTypeAndRoute(
      "会議資料",
      "定期会議用資料",
      "総務課"
    );

    expect(result.isSubsidyRelated).toBe(false);
    expect(result.processingRoute).toBe("electronic");
    expect(result.requiresPaperStorage).toBe(false);
  });

  // SCEN-474: [normal] 電子化可否判定 - 補助金関連文書でハイブリッド処理が選択される
  test("補助金関連度70%以上の文書でハイブリッド処理が判定される", () => {
    const result = determineDigitalizationEligibility(
      "科研費申請書",
      "科学研究費補助金の新規申請書です。研究計画と予算計画を詳細に記載し文部科学省の審査基準に適合させています。",
      "補助金申請書",
      0.85
    );

    expect(result.subsidyRelated).toBe(true);
    expect(result.processingRoute).toBe("hybrid");
    expect(result.paperStorageRequired).toBe(true);
  });

  // SCEN-475: [normal] 電子化可否判定 - 非補助金文書で電子のみ処理が選択される
  test("補助金関連度が低い文書で電子のみ処理が判定される", () => {
    const result = determineDigitalizationEligibility(
      "教室予約申請",
      "学内行事のための教室予約申請書です。使用目的と必要設備について記載しています。",
      "施設利用申請書",
      0.2
    );

    expect(result.subsidyRelated).toBe(false);
    expect(result.processingRoute).toBe("electronic");
    expect(result.paperStorageRequired).toBe(false);
  });

  // SCEN-476: [edge] 電子化可否判定 - 判定基準が曖昧な文書の場合、安全側の処理ルートが選択される
  test("判定基準が曖昧な文書の場合、安全側の電子処理が選択される", () => {
    const result = determineDigitalizationEligibility(
      "不明な申請",
      "詳細不明",
      "その他",
      0.3
    );

    expect(result.subsidyRelated).toBe(false);
    expect(result.processingRoute).toBe("electronic");
    expect(result.paperStorageRequired).toBe(false);
  });

  // SCEN-489: [normal] 文書保管方式選択 - 法令要件に基づいて適切な保管方式が選択される
  test("法令要件に基づいて適切な保管方式が選択される", () => {
    const result = determineDocumentStorageMethod(
      "文部科学省補助金申請書",
      "科学研究費補助金の申請に関する書類です。文部科学省の定める基準に従い研究計画と予算を記載しています。",
      "補助金申請書",
      ["研究費", "科研費", "文部科学省", "補助金"]
    );

    expect(result.subsidyRelated).toBe(true);
    expect(result.processingRoute).toBe("hybrid");
    expect(result.paperStorageRequired).toBe(true);
  });

  // SCEN-490: [normal] 文書保管方式選択 - ハイブリッド処理必要文書で電子＋紙保管が選択される
  test("ハイブリッド処理必要文書で電子＋紙保管が選択される", () => {
    const result = determineDocumentStorageMethod(
      "運営費交付金事業報告書",
      "大学運営費交付金による事業の実績報告書です。文部科学省への提出が必要で適切な保管が求められています。",
      "事業報告書",
      ["運営費交付金", "文部科学省", "事業報告"]
    );

    expect(result.subsidyRelated).toBe(true);
    expect(result.processingRoute).toBe("hybrid");
    expect(result.paperStorageRequired).toBe(true);
  });

  // SCEN-491: [edge] 文書保管方式選択 - 保管方式判定条件が不明な場合、最も安全な方式が選択される
  test("保管方式判定条件が不明な場合、電子処理が選択される", () => {
    const result = determineDocumentStorageMethod(
      "一般申請書",
      "通常業務申請",
      "一般申請",
      []
    );

    expect(result.subsidyRelated).toBe(false);
    expect(result.processingRoute).toBe("electronic");
    expect(result.paperStorageRequired).toBe(false);
  });
});