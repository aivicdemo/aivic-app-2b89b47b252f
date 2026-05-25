import { determineDocumentTypeAndRoute } from '../../src/logic/it-1-br-2-1-1';

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  // SCEN-473: [edge] 文書種別自動判定 - 判定困難な内容の場合、適切なデフォルト処理が実行される
  test("文書種別自動判定で判定困難な内容の場合、適切なデフォルト処理が実行される", () => {
    const documentTitle = "申請";
    const documentContent = "申請します。";
    const applicantDepartment = "総務部";

    const result = determineDocumentTypeAndRoute(
      documentTitle,
      documentContent,
      applicantDepartment
    );

    // キーワード関連度0.7未満のため補助金関連でないと判定
    expect(result.isSubsidyRelated).toBe(false);
    
    // 補助金関連でないため紙保管不要
    expect(result.paperStorageRequired).toBe(false);
    
    // 電子のみ処理ルート
    expect(result.processingRoute).toBe("electronic");
    
    // 申請者部署と補助金関連度に基づく文書種別判定結果
    expect(result.documentType).toBeDefined();
  });
});