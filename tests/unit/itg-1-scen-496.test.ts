import { validateLegalNotificationAuthenticity } from "../../src/logic/it-1-br-1779263788059-2-2-1";

const fetchMock = require("jest-fetch-mock");

describe("処理ルート変更時に関係者へ自動通知し承認フローを動的に調整する機能", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test("法令改正通知の認証プロセスにおいてデジタル署名の検証が正常に実行される", () => {
    // SCEN-496

    // 正常なデジタル署名検証が成功する場合
    const validNotificationContent = "文部科学省令第123号による補助金申請書類の電子化要件に関する改正について。令和6年4月1日より施行。";
    const validSenderInfo = {
      senderId: "mext.go.jp",
      certificateId: "MEXT2024-001",
      authDomain: "mext.go.jp"
    };
    const validDigitalSignature = "SHA256:abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567";
    const validReceivedTimestamp = "2024-03-15T09:30:00Z";

    const result1 = validateLegalNotificationAuthenticity(
      validNotificationContent,
      validSenderInfo,
      validDigitalSignature,
      validReceivedTimestamp
    );

    expect(result1).toEqual({
      isAuthentic: true,
      isValid: true,
      verificationDetails: {
        senderValid: true,
        signatureValid: true,
        contentIntact: true,
        withinValidPeriod: true
      },
      canProceed: true
    });

    // デジタル署名が存在しない場合のエラー
    expect(() => {
      validateLegalNotificationAuthenticity(
        validNotificationContent,
        validSenderInfo,
        "",
        validReceivedTimestamp
      );
    }).toThrow("デジタル署名が見つかりません。文部科学省からの正式な通知であることを確認してください。");

    // 通知内容が不正な場合のエラー
    expect(() => {
      validateLegalNotificationAuthenticity(
        "短い",
        validSenderInfo,
        validDigitalSignature,
        validReceivedTimestamp
      );
    }).toThrow("法令改正通知の内容が不正です。正しい通知内容を確認してください。");

    // 送信者情報が不正な場合のエラー
    expect(() => {
      validateLegalNotificationAuthenticity(
        validNotificationContent,
        { senderId: "", certificateId: "", authDomain: "" },
        validDigitalSignature,
        validReceivedTimestamp
      );
    }).toThrow("送信者の認証情報が不正です。文部科学省からの公式通知であることを確認してください。");

    // 無効な署名での検証失敗
    const invalidDigitalSignature = "INVALID:signature123";
    const result2 = validateLegalNotificationAuthenticity(
      validNotificationContent,
      validSenderInfo,
      invalidDigitalSignature,
      validReceivedTimestamp
    );

    expect(result2).toEqual({
      isAuthentic: false,
      isValid: false,
      verificationDetails: {
        senderValid: true,
        signatureValid: false,
        contentIntact: false,
        withinValidPeriod: true
      },
      canProceed: false
    });
  });
});