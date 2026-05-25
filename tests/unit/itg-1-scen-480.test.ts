import { determineNextApprover } from '../../src/logic/it-1-br-2-2-1';

describe("文書種別に応じた承認フロー自動振り分け機能", () => {
  test("承認判断処理ルート決定 - 承認結果に基づいて適切な次の処理先が決定される", () => {
    // SCEN-480

    // 補助金関連書類で承認の場合
    const subsidyApprovalResult = determineNextApprover(
      "科研費申請書の承認について",
      "本申請書は文部科学省科学研究費助成事業に関する申請書類であり、運営費交付金の適正な使用を目的とする。",
      "部長",
      "承認"
    );
    expect(subsidyApprovalResult.nextApprover).toBe("理事");
    expect(subsidyApprovalResult.processingRoute).toBe("hybrid");
    expect(subsidyApprovalResult.isSubsidyRelated).toBe(true);
    expect(subsidyApprovalResult.requiresPaperStorage).toBe(true);

    // 一般書類で承認の場合
    const generalApprovalResult = determineNextApprover(
      "会議室利用申請書",
      "教職員会議のため会議室の利用を申請いたします。",
      "課長",
      "承認"
    );
    expect(generalApprovalResult.nextApprover).toBe("部長");
    expect(generalApprovalResult.processingRoute).toBe("electronic");
    expect(generalApprovalResult.isSubsidyRelated).toBe(false);
    expect(generalApprovalResult.requiresPaperStorage).toBe(false);

    // 補助金関連書類で差し戻しの場合
    const subsidyRejectionResult = determineNextApprover(
      "設備整備費申請書の差し戻しについて",
      "文部科学省設備整備費補助金に関する申請書類ですが、記載内容に不備があるため差し戻しいたします。",
      "理事",
      "差し戻し"
    );
    expect(subsidyRejectionResult.nextApprover).toBe(null);
    expect(subsidyRejectionResult.processingRoute).toBe("hybrid");
    expect(subsidyRejectionResult.isSubsidyRelated).toBe(true);
    expect(subsidyRejectionResult.requiresPaperStorage).toBe(true);

    // タイトルが空の場合のエラー
    expect(() => {
      determineNextApprover(
        "",
        "申請内容",
        "部長",
        "承認"
      );
    }).toThrow("申請書類のタイトルが入力されていません。タイトルを入力してください。");

    // 承認判断が選択されていない場合のエラー
    expect(() => {
      determineNextApprover(
        "申請書類タイトル",
        "申請内容",
        "部長",
        ""
      );
    }).toThrow("承認・差戻し・却下のいずれかを選択してください。");

    // 承認者役職が不明の場合のエラー
    expect(() => {
      determineNextApprover(
        "申請書類タイトル",
        "申請内容",
        "",
        "承認"
      );
    }).toThrow("承認者の役職情報が取得できません。システム管理者にお問い合わせください。");
  });
});