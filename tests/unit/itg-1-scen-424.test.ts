import { determineDocumentTypeAndRoute } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("非補助金関連文書の場合、電子のみ処理ルートが設定される", () => {
    // SCEN-424
    const result = determineDocumentTypeAndRoute(
      "物品購入申請書（事務用品）",
      "パソコン、プリンター、事務用品の購入を申請いたします。総額50万円の予算で必要な機器の導入を希望します。",
      "総務課"
    );

    expect(result.documentType).toBe("一般申請");
    expect(result.processingRoute).toBe("electronic");
    expect(result.subsidyRelated).toBe(false);
    expect(result.paperStorageRequired).toBe(false);
  });
});