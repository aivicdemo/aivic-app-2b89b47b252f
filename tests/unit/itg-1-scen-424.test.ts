import { classifyDocumentTypeAndRoute } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("非補助金関連文書の場合、電子のみ処理ルートが設定される", () => {
    // SCEN-424
    const result = classifyDocumentTypeAndRoute(
      "人事システム利用申請書",
      "新入職員向けの人事システムのアクセス権限申請を行います。勤怠管理機能の利用開始を希望します。",
      "総務部"
    );
    
    expect(result.documentType).toBe("一般申請");
    expect(result.processingRoute).toBe("electronic");
    expect(result.subsidyRelated).toBe(false);
    expect(result.paperStorageRequired).toBe(false);
  });
});