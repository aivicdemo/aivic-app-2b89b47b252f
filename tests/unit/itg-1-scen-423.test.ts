import { determineDocumentTypeAndRoute } from "../../src/logic/it-1-br-2-1-1";

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("補助金関連文書の場合、ハイブリッド処理ルートが設定される", () => {
    // SCEN-423
    // 補助金関連のキーワード（科研費、運営費交付金、設備整備費）を含む申請書類
    const result = determineDocumentTypeAndRoute(
      "科研費による研究設備導入申請書", // 科研費キーワード含有
      "文部科学省科研費制度に基づく研究設備の導入を申請いたします。研究プロジェクトの推進に必要な実験装置の購入費として運営費交付金からの支出を予定しております。", // 科研費、運営費交付金キーワード含有
      "総務課" // 申請者所属部署
    );

    // キーワード関連度70%以上で補助金関連と判定
    expect(result.subsidyRelated).toBe(true);
    
    // 補助金関連で文部科学省要件該当の場合、紙保管が必要
    expect(result.paperStorageRequired).toBe(true);
    
    // 紙保管が必要な場合はハイブリッド処理ルート
    expect(result.processingRoute).toBe("hybrid");
    
    // 文書種別も適切に判定される
    expect(result.documentType).toBeDefined();

    // 一般的な申請書類（補助金関連度70%未満）の場合は電子のみ処理
    const generalResult = determineDocumentTypeAndRoute(
      "会議室利用申請書",
      "来月の研究会のため第3会議室の利用を申請します。",
      "総務課"
    );

    expect(generalResult.subsidyRelated).toBe(false);
    expect(generalResult.paperStorageRequired).toBe(false);
    expect(generalResult.processingRoute).toBe("electronic");
  });
});