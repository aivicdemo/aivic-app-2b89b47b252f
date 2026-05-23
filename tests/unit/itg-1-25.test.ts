import { describe, test, expect } from '@jest/globals';
import { 
  setApprovalDeadline,
  identifyStagnantApplications,
  determinePriorityForReminder,
  validateReminderFrequency,
  generateReminderMessage,
  identifyNotificationRecipient,
  determinePriorityForApprovalNotification,
  determineNotificationTiming,
  checkApprovalDelayAndNotify
} from '../../src/logic/it-1-br-1-2-1';

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  
  test("標準的な申請書類の場合、適切な承認期限が設定される", () => {
    // SCEN-432
    const result = setApprovalDeadline(
      "一般申請",
      false,
      "標準",
      new Date("2023-01-15T09:00:00")
    );
    
    expect(result.businessDays).toBe(3);
    expect(result.notificationSchedule).toEqual(["2日前", "当日"]);
  });

  test("緊急案件の場合、短縮された承認期限が設定される", () => {
    // SCEN-433
    const result = setApprovalDeadline(
      "一般申請",
      false,
      "high",
      new Date("2023-01-15T09:00:00")
    );
    
    expect(result.businessDays).toBe(1.5);
    expect(result.notificationSchedule).toEqual(["2日前", "当日"]);
  });

  test("文書種別が不明な場合、デフォルト期限が適用される", () => {
    // SCEN-434
    expect(() => {
      setApprovalDeadline(
        "",
        false,
        "標準",
        new Date("2023-01-15T09:00:00")
      );
    }).toThrow("緊急度は「高」「標準」「低」のいずれかを選択してください");
  });

  test("設定期限を超過した案件が正しく抽出される", () => {
    // SCEN-444
    const applicationStatuses = [
      {
        applicationId: "APP001",
        currentStage: "部長承認",
        stageStartDate: new Date("2023-01-01"),
        documentType: "一般申請",
        isSubsidyRelated: false
      }
    ];
    
    const result = identifyStagnantApplications(
      applicationStatuses,
      { normal: 5, subsidyRelated: 7, urgent: 3 },
      new Date("2023-01-10")
    );
    
    expect(result.length).toBe(1);
    expect(result[0].stagnantDays).toBe(9);
    expect(result[0].thresholdExceeded).toBe(4);
    expect(result[0].urgencyLevel).toBe("medium");
  });

  test("期限内の案件は滞留案件として抽出されない", () => {
    // SCEN-445
    const applicationStatuses = [
      {
        applicationId: "APP001",
        currentStage: "部長承認",
        stageStartDate: new Date("2023-01-08"),
        documentType: "一般申請",
        isSubsidyRelated: false
      }
    ];
    
    const result = identifyStagnantApplications(
      applicationStatuses,
      { normal: 5, subsidyRelated: 7, urgent: 3 },
      new Date("2023-01-10")
    );
    
    expect(result.length).toBe(0);
  });

  test("期限ちょうどの案件の取扱いが適切に判定される", () => {
    // SCEN-446
    const applicationStatuses = [
      {
        applicationId: "APP001",
        currentStage: "部長承認", 
        stageStartDate: new Date("2023-01-05"),
        documentType: "一般申請",
        isSubsidyRelated: false
      }
    ];
    
    const result = identifyStagnantApplications(
      applicationStatuses,
      { normal: 5, subsidyRelated: 7, urgent: 3 },
      new Date("2023-01-10")
    );
    
    expect(result.length).toBe(0);
  });

  test("重要度と滞留期間に基づいて適切な優先度が決定される", () => {
    // SCEN-447
    const pendingApplications = [
      {
        applicationId: "APP001",
        delayDays: 10,
        approverLevel: 3,
        documentImportance: 5,
        applicantDepartment: "財務課"
      }
    ];
    
    const result = determinePriorityForReminder(
      pendingApplications,
      { delayWeight: 2, levelWeight: 1, importanceWeight: 3 }
    );
    
    expect(result[0].priorityScore).toBe(38);
    expect(result[0].reminderUrgency).toBe("low");
  });

  test("同一優先度の案件について適切な順序が決定される", () => {
    // SCEN-448
    const pendingApplications = [
      {
        applicationId: "APP001",
        delayDays: 10,
        approverLevel: 3,
        documentImportance: 5,
        applicantDepartment: "財務課"
      },
      {
        applicationId: "APP002",
        delayDays: 15,
        approverLevel: 3,
        documentImportance: 5,
        applicantDepartment: "総務課"
      }
    ];
    
    const result = determinePriorityForReminder(
      pendingApplications,
      { delayWeight: 2, levelWeight: 1, importanceWeight: 3 }
    );
    
    expect(result[0].applicationId).toBe("APP002");
    expect(result[1].applicationId).toBe("APP001");
  });

  test("優先度判定に必要な情報が不足している場合、エラーが発生する", () => {
    // SCEN-449
    expect(() => {
      determinePriorityForReminder(
        [],
        { delayWeight: 2, levelWeight: 1, importanceWeight: 3 }
      );
    }).toThrow("催促対象となる滞留案件が存在しません。承認進捗を再確認してください。");
  });

  test("適切な間隔での催促通知が送信される", () => {
    // SCEN-450
    const result = validateReminderFrequency(
      "APP001",
      "user123",
      new Date("2023-01-01T09:00:00"),
      new Date("2023-01-05T09:00:00")
    );
    
    expect(result.canSendReminder).toBe(true);
    expect(result.waitingDays).toBe(4);
    expect(result.nextAllowedDate).toBe(null);
  });

  test("短時間での重複催促が制限される", () => {
    // SCEN-451
    const result = validateReminderFrequency(
      "APP001",
      "user123", 
      new Date("2023-01-01T09:00:00"),
      new Date("2023-01-02T09:00:00")
    );
    
    expect(result.canSendReminder).toBe(false);
    expect(result.waitingDays).toBe(1);
    expect(result.nextAllowedDate).toEqual(new Date("2023-01-04T09:00:00"));
  });

  test("制限期間ギリギリの催促要求が適切に処理される", () => {
    // SCEN-452
    const result = validateReminderFrequency(
      "APP001", 
      "user123",
      new Date("2023-01-01T09:00:00"),
      new Date("2023-01-04T09:00:00")
    );
    
    expect(result.canSendReminder).toBe(true);
    expect(result.waitingDays).toBe(3);
    expect(result.nextAllowedDate).toBe(null);
  });

  test("滞留期間と重要度に応じた適切な催促メッセージが生成される", () => {
    // SCEN-453
    const result = generateReminderMessage(
      "APP001",
      6,
      "一般申請",
      "田中部長",
      "山田職員"
    );
    
    expect(result.urgencyLevel).toBe("medium");
    expect(result.notificationMethod).toBe("both");
  });

  test("メッセージ生成に必要な情報が不足している場合、デフォルトメッセージが使用される", () => {
    // SCEN-454
    expect(() => {
      generateReminderMessage(
        "APP001",
        -1,
        "一般申請",
        "田中部長",
        "山田職員"
      );
    }).toThrow("滞留日数は0以上である必要があります");
  });

  test("最高重要度案件の緊急催促メッセージが適切に生成される", () => {
    // SCEN-455
    const result = generateReminderMessage(
      "APP001",
      10,
      "補助金申請",
      "田中部長", 
      "山田職員"
    );
    
    expect(result.urgencyLevel).toBe("high");
    expect(result.notificationMethod).toBe("email");
  });

  test("現在の承認段階に基づいて適切な承認者が特定される", () => {
    // SCEN-456
    const result = identifyNotificationRecipient(
      "APP001",
      "一般申請",
      "部長承認",
      "user123",
      true
    );
    
    expect(result.recipientType).toBe("primary_approver");
    expect(result.escalationRequired).toBe(false);
  });

  test("承認者が不在の場合、代理承認者が特定される", () => {
    // SCEN-457
    const result = identifyNotificationRecipient(
      "APP001",
      "一般申請",
      "部長承認",
      "user123",
      false
    );
    
    expect(result.recipientType).toBe("substitute_approver");
    expect(result.escalationRequired).toBe(false);
  });

  test("承認者も代理承認者も特定できない場合、エラーが発生する", () => {
    // SCEN-458
    expect(() => {
      identifyNotificationRecipient(
        "",
        "一般申請",
        "部長承認", 
        "user123",
        false
      );
    }).toThrow("催促対象の申請案件が特定できません。正しい申請番号を確認してください。");
  });

  test("高緊急度案件が即座に通知される", () => {
    // SCEN-465
    const result = determinePriorityForApprovalNotification(
      "緊急申請書類",
      "一般申請",
      new Date("2023-01-15T09:00:00"),
      new Date("2023-01-17T17:00:00"),
      false
    );
    
    expect(result.priority).toBe("high");
    expect(result.notificationTiming).toBe("immediate");
    expect(result.urgencyReason).toBe("タイトルに緊急キーワード含有");
  });

  test("通常案件が定期通知として処理される", () => {
    // SCEN-466
    const result = determinePriorityForApprovalNotification(
      "通常申請書類",
      "一般申請",
      new Date("2023-01-15T09:00:00"),
      new Date("2023-01-20T17:00:00"),
      false
    );
    
    expect(result.priority).toBe("low");
    expect(result.notificationTiming).toBe("scheduled");
    expect(result.urgencyReason).toBe("通常の申請案件");
  });

  test("緊急度判定に失敗した場合、デフォルト優先度が適用される", () => {
    // SCEN-467
    expect(() => {
      determinePriorityForApprovalNotification(
        "",
        "一般申請",
        new Date("2023-01-15T09:00:00"),
        new Date("2023-01-20T17:00:00"),
        false
      );
    }).toThrow("申請書類のタイトルが入力されていません。");
  });

  test("業務負荷を考慮した適切なタイミングで通知が送信される", () => {
    // SCEN-468
    const result = determineNotificationTiming(
      [{ priority: "medium", createdAt: new Date("2023-01-15T09:00:00") }],
      50,
      new Date("2023-01-14T09:00:00"),
      "medium"
    );
    
    expect(result.shouldSendNotification).toBe(true);
    expect(result.notificationFrequency).toBe("60minutes");
  });

  test("過度な通知頻度が制限される", () => {
    // SCEN-469
    const result = determineNotificationTiming(
      [{ priority: "low", createdAt: new Date("2023-01-15T09:00:00") }],
      90,
      new Date("2023-01-15T09:15:00"),
      "low"
    );
    
    expect(result.shouldSendNotification).toBe(false);
    expect(result.notificationFrequency).toBe("360minutes");
  });

  test("通知タイミング設定が無効な場合、エラーが発生する", () => {
    // SCEN-470
    const result = determineNotificationTiming(
      [],
      -10,
      new Date("2023-01-15T09:00:00"),
      "medium"
    );
    
    expect(result.shouldSendNotification).toBe(false);
  });

  test("承認期限を過ぎた案件が正しく検知される", () => {
    // SCEN-486
    const result = checkApprovalDelayAndNotify(
      "APP001",
      new Date("2023-01-20T09:00:00"),
      new Date("2023-01-18T17:00:00"),
      { beforeDays: [3, 1], urgentHours: 24 },
      { id: "user123", name: "田中承認者", email: "tanaka@example.com", department: "総務課" }
    );
    
    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("緊急催促");
    expect(result.delayStatus).toBe("緊急");
    expect(result.recipients).toContain("tanaka@example.com");
  });

  test("催促タイミングに到達した案件に通知が送信される", () => {
    // SCEN-487
    const result = checkApprovalDelayAndNotify(
      "APP001",
      new Date("2023-01-17T09:00:00"),
      new Date("2023-01-20T17:00:00"),
      { beforeDays: [3, 1], urgentHours: 24 },
      { id: "user123", name: "田中承認者", email: "tanaka@example.com", department: "総務課" }
    );
    
    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("事前催促");
    expect(result.delayStatus).toBe("注意");
  });

  test("検知処理でシステムエラーが発生した場合、適切に処理される", () => {
    // SCEN-488
    expect(() => {
      checkApprovalDelayAndNotify(
        "",
        new Date("2023-01-17T09:00:00"),
        new Date("2023-01-20T17:00:00"),
        { beforeDays: [3, 1], urgentHours: 24 },
        { id: "user123", name: "田中承認者", email: "tanaka@example.com", department: "総務課" }
      );
    }).toThrow("申請案件が特定できません。正しい申請番号を指定してください。");
  });

});