import { checkMoeComplianceRequirements } from '../../src/logic/it-1-br-2-1-1';

describe('申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能', () => {
  test('文書種別自動判定 - 申請書類の内容から文書種別が正しく判定される', () => {
    // SCEN-471
    
    // 補助金関連書類のテストケース
    const subsidyDocumentTitle = '文部科学省科学研究費助成事業申請書';
    const subsidyDocumentContent = '研究課題名：AIを活用した教育システムの開発 研究期間：3年 申請金額：5,000,000円 本研究は文部科学省の重点施策である教育のデジタル化推進に寄与する';
    const subsidyDocumentType = '補助金申請書';
    const moeRequirements = ['補助金申請書', '実績報告書', '収支決算書'];

    const subsidyResult = checkMoeComplianceRequirements(
      subsidyDocumentTitle,
      subsidyDocumentContent,
      subsidyDocumentType,
      moeRequirements
    );

    expect(subsidyResult.complianceStatus).toBe('compliant');
    expect(subsidyResult.paperStorageRequired).toBe(true);
    expect(subsidyResult.processingRoute).toBe('hybrid');
    expect(subsidyResult.riskLevel).toBe('high');

    // 一般申請書類のテストケース
    const generalDocumentTitle = '研修会参加申請書';
    const generalDocumentContent = '研修名：情報セキュリティ研修 開催日：2024年3月15日 参加費：10,000円 業務上の必要性：最新のセキュリティ知識を習得するため';
    const generalDocumentType = '研修申請書';

    const generalResult = checkMoeComplianceRequirements(
      generalDocumentTitle,
      generalDocumentContent,
      generalDocumentType,
      moeRequirements
    );

    expect(generalResult.complianceStatus).toBe('review_required');
    expect(generalResult.paperStorageRequired).toBe(false);
    expect(generalResult.processingRoute).toBe('electronic');
    expect(generalResult.riskLevel).toBe('low');

    // 境界値テスト：キーワード一致度60%のケース
    const borderlineTitle = '科研費に関する設備購入申請';
    const borderlineContent = '設備名：研究用コンピュータ 購入目的：データ解析業務の効率化';
    const borderlineType = '設備購入申請書';

    const borderlineResult = checkMoeComplianceRequirements(
      borderlineTitle,
      borderlineContent,
      borderlineType,
      moeRequirements
    );

    expect(borderlineResult.complianceStatus).toBe('review_required');
    expect(borderlineResult.paperStorageRequired).toBe(false);
    expect(borderlineResult.processingRoute).toBe('electronic');
    expect(borderlineResult.riskLevel).toBe('medium');

    // エラーケース：タイトルが空
    expect(() => {
      checkMoeComplianceRequirements('', 'test content', 'test type', moeRequirements);
    }).toThrow('申請書類のタイトルが入力されていません。法令要件の判定ができません。');

    // エラーケース：内容が不十分
    expect(() => {
      checkMoeComplianceRequirements('test title', 'short', 'test type', moeRequirements);
    }).toThrow('申請書類の内容は50文字以上で入力してください');

    // エラーケース：文書種別未分類
    expect(() => {
      checkMoeComplianceRequirements('test title', 'sufficient content for testing purposes and validation', '', moeRequirements);
    }).toThrow('書類種別の分類が完了していません。先に文書種別の確認を行ってください。');
  });
});