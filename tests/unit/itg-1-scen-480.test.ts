import { determineNextApprover } from "../../src/logic/it-1-br-2-2-1";

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("承認判断処理ルート決定 - 承認結果に基づいて適切な次の処理先が決定される", () => {
    // SCEN-480

    // 補助金関連申請書類で承認の場合
    const subsidyApproval = determineNextApprover(
      "令和6年度科研費基盤研究(A)申請書",
      "文部科学省科学研究費助成事業による基盤研究(A)の申請を行います。研究テーマは「持続可能な環境技術の開発」です。",
      "課長",
      "承認"
    );
    expect(subsidyApproval.nextApprover).toBe("部長");
    expect(subsidyApproval.processingRoute).toBe("hybrid");
    expect(subsidyApproval.isSubsidyRelated).toBe(true);
    expect(subsidyApproval.requiresPaperStorage).toBe(true);

    // 一般申請書類で承認の場合
    const generalApproval = determineNextApprover(
      "会議室使用申請書",
      "来月の研究会議のため会議室A101の使用を申請します。",
      "係長",
      "承認"
    );
    expect(generalApproval.nextApprover).toBe("課長");
    expect(generalApproval.processingRoute).toBe("electronic");
    expect(generalApproval.isSubsidyRelated).toBe(false);
    expect(generalApproval.requiresPaperStorage).toBe(false);

    // 補助金関連申請書類で却下の場合
    const subsidyRejection = determineNextApprover(
      "運営費交付金特別経費申請書",
      "大学の運営費交付金による特別経費の申請を行います。",
      "部長",
      "却下"
    );
    expect(subsidyRejection.nextApprover).toBe(null);
    expect(subsidyRejection.processingRoute).toBe("hybrid");
    expect(subsidyRejection.isSubsidyRelated).toBe(true);
    expect(subsidyRejection.requiresPaperStorage).toBe(true);

    // 制約テスト: 申請書類のタイトルが空のとき
    expect(() => 
      determineNextApprover("", "申請内容", "課長", "承認")
    ).toThrow("申請書類のタイトルが入力されていません。タイトルを入力してください。");

    // 制約テスト: 承認判断が選択されていないとき  
    expect(() =>
      determineNextApprover("申請書", "申請内容", "課長", "")
    ).toThrow("承認・差戻し・却下のいずれかを選択してください。");

    // 制約テスト: 現在の承認者の役職が不明なとき
    expect(() =>
      determineNextApprover("申請書", "申請内容", "", "承認")
    ).toThrow("承認者の役職情報が取得できません。システム管理者にお問い合わせください。");
  });
});