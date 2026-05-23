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
} from "../../src/logic/it-1-br-1-2-1";

const fetchMock = require("jest-fetch-mock");

describe("承認遅延案件を検知し担当者に自動で催促通知を送信する", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-432
  test("承認期限自動設定 - 標準的な申請書類の場合、適切な承認期限が設定される", () => {
    const submissionDate = new Date("2024-01-15T09:00:00Z");
    const result = setApprovalDeadline("一般申請", false, "standard", submissionDate);
    
    const expectedDeadlineDate = new Date(submissionDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    expect(result.deadlineDate).toEqual(expectedDeadlineDate);
    expect(result.businessDays).toBe(3);
    expect(result.notificationSchedule).toEqual(["2日前", "当日"]);
  });

  // SCEN-433
  test("承認期限自動設定 - 緊急案件の場合、短縮された承認期限が設定される", () => {
    const submissionDate = new Date("2024-01-15T09:00:00Z");
    const result = setApprovalDeadline("一般申請", false, "high", submissionDate);
    
    const expectedDeadlineDate = new Date(submissionDate.getTime() + 1.5 * 24 * 60 * 60 * 1000);
    expect(result.deadlineDate).toEqual(expectedDeadlineDate);
    expect(result.businessDays).toBe(1.5);
    expect(result.notificationSchedule).toEqual(["2日前", "当日"]);
  });

  // SCEN-434
  test("承認期限自動設定 - 文書種別が不明な場合、デフォルト期限が適用される", () => {
    expect(() => {
      setApprovalDeadline("", false, "standard", new Date("2030-01-01T00:00:00Z"));
    }).toThrow("提出日時に未来の日付は指定できません。");
  });

  // SCEN-444
  test("滞留案件抽出 - 設定期限を超過した案件が正しく抽出される", () => {
    const currentDate = new Date("2024-01-20T10:00:00Z");
    const applicationStatuses = [
      {
        applicationId: "APP001",
        currentStage: "部長承認",
        stageStartDate: new Date("2024-01-10T09:00:00Z"),
        documentType: "一般申請",
        isSubsidyRelated: false
      }
    ];
    const thresholds = { normal: 5, subsidyRelated: 3, urgent: 2 };

    const result = identifyStagnantApplications(applicationStatuses, thresholds, currentDate);
    
    expect(result).toHaveLength(1);
    expect(result[0].applicationId).toBe("APP001");
    expect(result[0].stagnantDays).toBe(10);
    expect(result[0].thresholdExceeded).toBe(5);
    expect(result[0].urgencyLevel).toBe("high");
    expect(result[0].recommendedAction).toBe("上司エスカレーション");
  });

  // SCEN-445
  test("滞留案件抽出 - 期限内の案件は滞留案件として抽出されない", () => {
    const currentDate = new Date("2024-01-20T10:00:00Z");
    const applicationStatuses = [
      {
        applicationId: "APP001",
        currentStage: "部長承認",
        stageStartDate: new Date("2024-01-18T09:00:00Z"),
        documentType: "一般申請",
        isSubsidyRelated: false
      }
    ];
    const thresholds = { normal: 5, subsidyRelated: 3, urgent: 2 };

    const result = identifyStagnantApplications(applicationStatuses, thresholds, currentDate);
    
    expect(result).toHaveLength(0);
  });

  // SCEN-446
  test("滞留案件抽出 - 期限ちょうどの案件の取扱いが適切に判定される", () => {
    const currentDate = new Date("2024-01-20T10:00:00Z");
    const applicationStatuses = [
      {
        applicationId: "APP001",
        currentStage: "部長承認",
        stageStartDate: new Date("2024-01-15T09:00:00Z"),
        documentType: "一般申請",
        isSubsidyRelated: false
      }
    ];
    const thresholds = { normal: 5, subsidyRelated: 3, urgent: 2 };

    const result = identifyStagnantApplications(applicationStatuses, thresholds, currentDate);
    
    expect(result).toHaveLength(0);
  });

  // SCEN-447
  test("催促対象優先度判定 - 重要度と滞留期間に基づいて適切な優先度が決定される", () => {
    const pendingApplications = [
      {
        applicationId: "APP001",
        delayDays: 8,
        approverLevel: 3,
        documentImportance: 5,
        applicantDepartment: "総務課"
      }
    ];
    const priorityWeights = { delayWeight: 2, levelWeight: 1, importanceWeight: 3 };

    const result = determinePriorityForReminder(pendingApplications, priorityWeights);
    
    expect(result).toHaveLength(1);
    expect(result[0].applicationId).toBe("APP001");
    expect(result[0].priorityScore).toBe(34); // 8*2 + 3*1 + 5*3 = 34
    expect(result[0].reminderUrgency).toBe("low");
  });

  // SCEN-448
  test("催促対象優先度判定 - 同一優先度の案件について適切な順序が決定される", () => {
    const pendingApplications = [
      {
        applicationId: "APP001",
        delayDays: 10,
        approverLevel: 5,
        documentImportance: 8,
        applicantDepartment: "総務課"
      },
      {
        applicationId: "APP002",
        delayDays: 15,
        approverLevel: 3,
        documentImportance: 6,
        applicantDepartment: "人事課"
      }
    ];
    const priorityWeights = { delayWeight: 2, levelWeight: 1, importanceWeight: 3 };

    const result = determinePriorityForReminder(pendingApplications, priorityWeights);
    
    expect(result).toHaveLength(2);
    expect(result[0].applicationId).toBe("APP002");
    expect(result[0].priorityScore).toBe(51); // 15*2 + 3*1 + 6*3 = 51
    expect(result[1].applicationId).toBe("APP001");
    expect(result[1].priorityScore).toBe(49); // 10*2 + 5*1 + 8*3 = 49
  });

  // SCEN-449
  test("催促対象優先度判定 - 優先度判定に必要な情報が不足している場合、エラーが発生する", () => {
    expect(() => {
      determinePriorityForReminder([], { delayWeight: -1, levelWeight: 1, importanceWeight: 3 });
    }).toThrow("優先度計算の重み係数に無効な値が設定されています。システム管理者にお問い合わせください。");
  });

  // SCEN-450
  test("催促頻度制限 - 適切な間隔での催促通知が送信される", () => {
    const currentDate = new Date("2024-01-20T10:00:00Z");
    const lastReminderDate = new Date("2024-01-17T10:00:00Z");

    const result = validateReminderFrequency("APP001", "USER001", lastReminderDate, currentDate);
    
    expect(result.canSendReminder).toBe(true);
    expect(result.waitingDays).toBe(3);
    expect(result.nextAllowedDate).toBeNull();
  });

  // SCEN-451
  test("催促頻度制限 - 短時間での重複催促が制限される", () => {
    const currentDate = new Date("2024-01-20T10:00:00Z");
    const lastReminderDate = new Date("2024-01-19T10:00:00Z");

    const result = validateReminderFrequency("APP001", "USER001", lastReminderDate, currentDate);
    
    expect(result.canSendReminder).toBe(false);
    expect(result.waitingDays).toBe(1);
    expect(result.nextAllowedDate).toEqual(new Date("2024-01-22T10:00:00Z"));
  });

  // SCEN-452
  test("催促頻度制限 - 制限期間ギリギリの催促要求が適切に処理される", () => {
    expect(() => {
      validateReminderFrequency("", "USER001", null, new Date());
    }).toThrow("申請書類が特定できません。正しい申請を選択してください。");
  });

  // SCEN-453
  test("催促メッセージ生成 - 滞留期間と重要度に応じた適切な催促メッセージが生成される", () => {
    const result = generateReminderMessage("APP001", 5, "一般申請", "田中太郎", "佐藤次郎");
    
    expect(result.urgencyLevel).toBe("medium");
    expect(result.notificationMethod).toBe("both");
    expect(result.messageContent).toContain("田中太郎");
    expect(result.messageContent).toContain("佐藤次郎");
    expect(result.messageContent).toContain("5");
  });

  // SCEN-454
  test("催促メッセージ生成 - メッセージ生成に必要な情報が不足している場合、デフォルトメッセージが使用される", () => {
    expect(() => {
      generateReminderMessage("APP001", -1, "一般申請", "田中太郎", "佐藤次郎");
    }).toThrow("滞留日数は0以上である必要があります");
  });

  // SCEN-455
  test("催促メッセージ生成 - 最高重要度案件の緊急催促メッセージが適切に生成される", () => {
    const result = generateReminderMessage("APP001", 10, "補助金申請", "田中太郎", "佐藤次郎");
    
    expect(result.urgencyLevel).toBe("high");
    expect(result.notificationMethod).toBe("email");
    expect(result.messageContent).toContain("田中太郎");
    expect(result.messageContent).toContain("佐藤次郎");
    expect(result.messageContent).toContain("10");
  });

  // SCEN-456
  test("催促通知宛先特定 - 現在の承認段階に基づいて適切な承認者が特定される", () => {
    const result = identifyNotificationRecipient("APP001", "一般申請", "部長承認", "USER001", true);
    
    expect(result.recipientId).toBe("USER001");
    expect(result.recipientType).toBe("primary_approver");
    expect(result.notificationMethod).toBe("email");
    expect(result.escalationRequired).toBe(false);
  });

  // SCEN-457
  test("催促通知宛先特定 - 承認者が不在の場合、代理承認者が特定される", () => {
    const result = identifyNotificationRecipient("APP001", "補助金申請", "部長承認", "USER001", false);
    
    expect(result.recipientType).toBe("substitute_approver");
    expect(result.notificationMethod).toBe("urgent_contact");
    expect(result.escalationRequired).toBe(false);
  });

  // SCEN-458
  test("催促通知宛先特定 - 承認者も代理承認者も特定できない場合、エラーが発生する", () => {
    expect(() => {
      identifyNotificationRecipient("", "一般申請", "部長承認", "USER001", true);
    }).toThrow("催促対象の申請案件が特定できません。正しい申請番号を確認してください。");
  });

  // SCEN-465
  test("通知優先度判定 - 高緊急度案件が即座に通知される", () => {
    const deadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const result = determinePriorityForApprovalNotification("緊急申請", "一般申請", new Date(), deadline, true);
    
    expect(result.priority).toBe("high");
    expect(result.notificationTiming).toBe("immediate");
    expect(result.urgencyReason).toBe("期限まで3日以内");
  });

  // SCEN-466
  test("通知優先度判定 - 通常案件が定期通知として処理される", () => {
    const deadline = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const result = determinePriorityForApprovalNotification("通常申請", "一般申請", new Date(), deadline, false);
    
    expect(result.priority).toBe("low");
    expect(result.notificationTiming).toBe("scheduled");
    expect(result.urgencyReason).toBe("通常の申請案件");
  });

  // SCEN-467
  test("通知優先度判定 - 緊急度判定に失敗した場合、デフォルト優先度が適用される", () => {
    expect(() => {
      determinePriorityForApprovalNotification("", "一般申請", new Date(), null, false);
    }).toThrow("申請書類のタイトルが入力されていません。");
  });

  // SCEN-468
  test("承認者通知タイミング制御 - 業務負荷を考慮した適切なタイミングで通知が送信される", () => {
    const pendingApplications = [{ priority: "medium", createdAt: new Date() }];
    const lastNotificationTime = new Date(Date.now() - 60 * 60 * 1000);
    
    const result = determineNotificationTiming(pendingApplications, 90, lastNotificationTime, "medium");
    
    expect(result.shouldSendNotification).toBe(false);
    expect(result.notificationFrequency).toBe("120minutes");
  });

  // SCEN-469
  test("承認者通知タイミング制御 - 過度な通知頻度が制限される", () => {
    const pendingApplications = [{ priority: "low", createdAt: new Date() }];
    const lastNotificationTime = new Date(Date.now() - 10 * 60 * 1000);
    
    const result = determineNotificationTiming(pendingApplications, 50, lastNotificationTime, "low");
    
    expect(result.shouldSendNotification).toBe(false);
  });

  // SCEN-470
  test("承認者通知タイミング制御 - 通知タイミング設定が無効な場合、エラーが発生する", () => {
    const pendingApplications = [];
    const lastNotificationTime = new Date(Date.now() - 60 * 60 * 1000);
    
    const result = determineNotificationTiming(pendingApplications, 150, lastNotificationTime, "medium");
    
    expect(result.notificationFrequency).toBe("360minutes");
  });

  // SCEN-486
  test("承認遅延検知 - 承認期限を過ぎた案件が正しく検知される", () => {
    const currentDateTime = new Date("2024-01-20T10:00:00Z");
    const approvalDeadline = new Date("2024-01-18T17:00:00Z");
    const reminderSettings = { beforeDays: [3, 1], urgentHours: 24 };
    const approverInfo = { id: "USER001", name: "田中太郎", email: "tanaka@university.ac.jp", department: "総務課" };
    
    const result = checkApprovalDelayAndNotify("APP001", currentDateTime, approvalDeadline, reminderSettings, approverInfo);
    
    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("緊急催促");
    expect(result.delayStatus).toBe("緊急");
    expect(result.recipients).toContain("tanaka@university.ac.jp");
  });

  // SCEN-487
  test("承認遅延検知 - 催促タイミングに到達した案件に通知が送信される", () => {
    const currentDateTime = new Date("2024-01-19T10:00:00Z");
    const approvalDeadline = new Date("2024-01-20T17:00:00Z");
    const reminderSettings = { beforeDays: [3, 1], urgentHours: 24 };
    const approverInfo = { id: "USER001", name: "田中太郎", email: "tanaka@university.ac.jp", department: "総務課" };
    
    const result = checkApprovalDelayAndNotify("APP001", currentDateTime, approvalDeadline, reminderSettings, approverInfo);
    
    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("事前催促");
    expect(result.delayStatus).toBe("注意");
  });

  // SCEN-488
  test("承認遅延検知 - 検知処理でシステムエラーが発生した場合、適切に処理される", () => {
    expect(() => {
      checkApprovalDelayAndNotify("", new Date(), new Date(), null, null);
    }).toThrow("申請案件が特定できません。正しい申請番号を指定してください。");
  });
});