import { checkMoeComplianceRequirements } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("非補助金関連文書の場合、電子のみ処理ルートが設定される", () => {
    // SCEN-424
    // 一般的な事務書類で補助金関連キーワードを含まない文書
    const result = checkMoeComplianceRequirements(
      "施設利用申請書",
      "会議室の利用申請を行います。利用日時は来週の金曜日午後2時から4時までです。参加者は約10名の予定です。",
      "施設利用申請",
      ["補助金", "助成金", "文部科学省", "科研費", "運営費交付金", "設備整備費"]
    );

    expect(result.complianceStatus).toBe("review_required");
    expect(result.paperStorageRequired).toBe(false);
    expect(result.processingRoute).toBe("electronic");
    expect(result.riskLevel).toBe("low");
  });
});