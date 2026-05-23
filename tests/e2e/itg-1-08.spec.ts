import { test, expect } from '@playwright/test';

test.describe("申請書類作成画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login.html");
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'test');
    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/login.html')),
      page.click('button[type="submit"]'),
    ]);
    await page.goto("/panels/scr-1779422326698.html");
  });

  // SCEN-122
  test("必須項目入力して申請書類作成", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '研究費申請書の提出について');
    await page.selectOption('[data-testid="document-type-select"]', '研究費申請');
    await page.fill('[name="content"]', '令和5年度科学研究費助成事業への申請に関する書類を提出いたします。研究テーマは「AI技術を活用した教育支援システムの開発」です。');
    await page.fill('[name="reason"]', '新しい教育技術の研究開発により学習効果の向上を図るため申請いたします。');
    await page.fill('[data-testid="application-date-input"]', '2024-01-15');
    await page.fill('[data-testid="amount-input"]', '5000000');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('text=申請書類が正常に作成されました')).toBeVisible();
  });

  // SCEN-123
  test("全項目入力して申請書類作成", async ({ page }) => {
    await page.fill('#applicant-name', '田中太郎');
    await page.fill('#applicant-department', '情報工学部');
    await page.fill('#applicant-email', 'tanaka@university.ac.jp');
    await page.selectOption('[data-testid="document-type-select"]', '補助金申請');
    await page.fill('[data-testid="title-input"]', '設備整備費補助金申請書');
    await page.fill('[name="content"]', '研究室の実験設備更新に関する補助金申請です。老朽化した機器の更新により研究環境の改善を図ります。');
    await page.fill('[data-testid="application-date-input"]', '2024-02-01');
    await page.click('[data-testid="urgency-high"]');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('text=承認待ち')).toBeVisible();
  });

  // SCEN-124
  test("添付ファイルありで申請書類作成", async ({ page }) => {
    await page.selectOption('[data-testid="document-type-select"]', '補助金申請');
    await page.fill('[data-testid="title-input"]', '研究費申請書類一式');
    await page.fill('[name="content"]', '研究費申請に必要な書類一式を添付ファイルとして提出いたします。');
    await page.click('[data-testid="file-select-button"]');
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles('test-document.pdf');
    await page.click('[data-testid="upload-button"]');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('text=申請書類が正常に作成され、添付ファイルも含めて申請が完了')).toBeVisible();
  });

  // SCEN-125
  test("既存申請書類の編集保存", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '経費申請書の修正版');
    await page.fill('[name="content"]', '経費申請書の内容を修正いたします。申請金額を変更し、詳細説明を追加しました。');
    await page.fill('[data-testid="amount-input"]', '300000');
    await page.click('[data-testid="draft-button"]');
    await expect(page.locator('text=保存完了')).toBeVisible();
    await expect(page.locator('text=更新内容が反映されています')).toBeVisible();
  });

  // SCEN-126
  test("必須項目未入力でバリデーションエラー", async ({ page }) => {
    await page.fill('[name="content"]', '任意項目のみの入力');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('text=申請書類のタイトルは必須項目です')).toBeVisible();
    await expect(page.locator('text=文書種別を選択してください')).toBeVisible();
  });

  // SCEN-127
  test("申請書類タイトル文字数上限超過でエラー", async ({ page }) => {
    const longTitle = 'a'.repeat(201);
    await page.fill('[data-testid="title-input"]', longTitle);
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[name="content"]', '正常な内容を入力します。申請内容の詳細説明がここに記載されます。');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('text=申請書類のタイトルは10文字以上200文字以内で入力してください')).toBeVisible();
  });

  // SCEN-128
  test("申請内容詳細文字数上限超過でエラー", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '正常なタイトル');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    const longContent = 'a'.repeat(2001);
    await page.fill('[name="content"]', longContent);
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('text=申請内容詳細の文字数上限超過エラー')).toBeVisible();
  });

  // SCEN-129
  test("申請金額に負の値入力でエラー", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '経費申請書');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[name="content"]', '正常な申請内容です。詳細な説明をここに記載いたします。');
    await page.fill('[data-testid="amount-input"]', '-10000');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('text=申請金額は正の数値を入力してください')).toBeVisible();
  });

  // SCEN-130
  test("申請金額に文字入力でエラー", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '経費申請書');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[name="content"]', '正常な申請内容です。詳細な説明をここに記載いたします。');
    await page.fill('[data-testid="amount-input"]', 'abc');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('text=数値を入力してください')).toBeVisible();
  });

  // SCEN-131
  test("申請金額上限値でバリデーション", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '高額研究費申請');
    await page.selectOption('[data-testid="document-type-select"]', '研究費申請');
    await page.fill('[name="content"]', '大型研究プロジェクトに関する申請です。詳細な研究計画に基づく予算申請となります。');
    await page.fill('[data-testid="amount-input"]', '9999999');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('text=確認画面')).toBeVisible();
  });

  // SCEN-132
  test("サポート外ファイル形式アップロードでエラー", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', 'ファイル添付申請');
    await page.fill('[name="content"]', 'ファイルを添付した申請書類です。必要な書類を添付いたします。');
    await page.click('[data-testid="file-select-button"]');
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles('test.exe');
    await page.click('[data-testid="upload-button"]');
    await expect(page.locator('text=サポートされていないファイル形式です。PDF、Word、Excel、画像ファイル（JPG、PNG）のみアップロード可能です。')).toBeVisible();
  });

  // SCEN-133
  test("ファイルサイズ上限超過でエラー", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '大容量ファイル申請');
    await page.fill('[name="content"]', '大容量ファイルを添付した申請書類です。詳細な資料を添付いたします。');
    await page.click('[data-testid="file-select-button"]');
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles('large-file.pdf');
    await page.click('[data-testid="upload-button"]');
    await expect(page.locator('text=ファイルサイズ上限超過')).toBeVisible();
  });

  // SCEN-134
  test("過去日付選択でエラー", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '日付設定申請');
    await page.selectOption('[data-testid="document-type-select"]', '経費申請');
    await page.fill('[name="content"]', '日付を設定した申請書類です。適切な申請日を選択いたします。');
    await page.fill('[data-testid="application-date-input"]', '2023-12-01');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('text=過去の日付は選択できません')).toBeVisible();
  });

  // SCEN-135
  test("申請理由文字数上限でバリデーション", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '申請理由長文');
    const maxReasonText = 'a'.repeat(500);
    await page.fill('[name="reason"]', maxReasonText);
    const overLimitText = 'a'.repeat(501);
    await page.fill('[name="reason"]', overLimitText);
    await page.click('[data-testid="draft-button"]');
    await expect(page.locator('text=文字数上限超過')).toBeVisible();
  });

  // SCEN-136
  test("複数部署選択で申請書類作成", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '複数部署連携申請');
    await page.selectOption('[data-testid="document-type-select"]', '稟議書');
    await page.fill('[name="content"]', '複数部署にまたがる案件に関する申請です。総務部、人事部、経理部の連携が必要です。');
    await page.check('[data-testid="dept-finance"]');
    await page.check('[data-testid="dept-hr"]');
    await page.check('[data-testid="dept-legal"]');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('text=複数部署が選択された申請書類が正常に作成')).toBeVisible();
    await expect(page.locator('text=総務部、人事部、経理部')).toBeVisible();
  });

  // SCEN-137
  test("緊急度最高で申請書類作成", async ({ page }) => {
    await page.fill('[data-testid="title-input"]', '緊急対応申請');
    await page.fill('[name="content"]', '緊急性の高い案件に関する申請書類です。迅速な承認をお願いいたします。');
    await page.click('[data-testid="urgency-urgent"]');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('text=緊急度が最高に設定された申請書類が正常に作成')).toBeVisible();
    await expect(page.locator('text=緊急申請として通知')).toBeVisible();
  });
});