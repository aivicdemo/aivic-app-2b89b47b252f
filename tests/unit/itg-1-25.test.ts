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

  // SCEN-432: [normal] 承認期限自動設定 - 標準的な申請書類の場合、適切な承認期限が設定される
  test("標準的な申請書類の承認期限が適切に設定される", () => {
    const documentType = "一般申請書";
    const subsidyRelated = false;
    const urgencyLevel = "標準";
    const submissionDate = new Date("2024-01-15T09:00:00");

    const result = setApprovalDeadline(documentType, subsidyRelated, urgencyLevel, submissionDate);

    expect(result.businessDays).toBe(3);
    expect(result.deadlineDate).toEqual(new Date("2024-01-18T09:00:00"));
    expect(result.notificationSchedule).toEqual(["2日前", "当日"]);
  });

  // SCEN-433: [normal] 承認期限自動設定 - 緊急案件の場合、短縮された承認期限が設定される
  test("緊急案件の承認期限が短縮して設定される", () => {
    const documentType = "補助金申請書";
    const subsidyRelated = true;
    const urgencyLevel = "high";
    const submissionDate = new Date("2024-01-15T09:00:00");

    const result = setApprovalDeadline(documentType, subsidyRelated, urgencyLevel, submissionDate);

    expect(result.businessDays).toBe(2.5);
    expect(result.deadlineDate).toEqual(new Date("2024-01-17T21:00:00"));
    expect(result.notificationSchedule).toEqual(["2日前", "当日"]);
  });

  // SCEN-434: [edge] 承認期限自動設定 - 文書種別が不明な場合、デフォルト期限が適用される
  test("文書種別不明時にデフォルト期限が適用される", () => {
    expect(() => {
      setApprovalDeadline("", false, "標準", new Date());
    }).toThrow("申請書類の種別が指定されていません。");
  });

  // SCEN-444: [normal] 滞留案件抽出 - 設定期限を超過した案件が正しく抽出される
  test("設定期限を超過した案件が抽出される", () => {
    const applicationStatuses = [
      {
        applicationId: "APP001",
        currentStage: "課長承認",
        stageStartDate: new Date("2024-01-01T09:00:00"),
        documentType: "一般申請",
        isSubsidyRelated: false
      }
    ];
    const stagnationThresholds = {
      normal: 3,
      subsidyRelated: 5,
      urgent: 1
    };
    const currentDate = new Date("2024-01-10T09:00:00");

    const result = identifyStagnantApplications(applicationStatuses, stagnationThresholds, currentDate);

    expect(result).toHaveLength(1);
    expect(result[0].applicationId).toBe("APP001");
    expect(result[0].stagnantDays).toBe(9);
    expect(result[0].thresholdExceeded).toBe(6);
    expect(result[0].urgencyLevel).toBe("high");
    expect(result[0].recommendedAction).toBe("上司エスカレーション");
  });

  // SCEN-445: [normal] 滞留案件抽出 - 期限内の案件は滞留案件として抽出されない
  test("期限内の案件は滞留案件として抽出されない", () => {
    const applicationStatuses = [
      {
        applicationId: "APP002",
        currentStage: "課長承認",
        stageStartDate: new Date("2024-01-08T09:00:00"),
        documentType: "一般申請",
        isSubsidyRelated: false
      }
    ];
    const stagnationThresholds = {
      normal: 5,
      subsidyRelated: 7,
      urgent: 2
    };
    const currentDate = new Date("2024-01-10T09:00:00");

    const result = identifyStagnantApplications(applicationStatuses, stagnationThresholds, currentDate);

    expect(result).toHaveLength(0);
  });

  // SCEN-446: [edge] 滞留案件抽出 - 期限ちょうどの案件の取扱いが適切に判定される
  test("期限ちょうどの案件は滞留案件として抽出されない", () => {
    const applicationStatuses = [
      {
        applicationId: "APP003",
        currentStage: "課長承認",
        stageStartDate: new Date("2024-01-07T09:00:00"),
        documentType: "一般申請",
        isSubsidyRelated: false
      }
    ];
    const stagnationThresholds = {
      normal: 3,
      subsidyRelated: 5,
      urgent: 1
    };
    const currentDate = new Date("2024-01-10T09:00:00");

    const result = identifyStagnantApplications(applicationStatuses, stagnationThresholds, currentDate);

    expect(result).toHaveLength(0);
  });

  // SCEN-447: [normal] 催促対象優先度判定 - 重要度と滞留期間に基づいて適切な優先度が決定される
  test("重要度と滞留期間に基づく優先度が決定される", () => {
    const pendingApplications = [
      {
        applicationId: "APP004",
        delayDays: 8,
        approverLevel: 3,
        documentImportance: 5,
        applicantDepartment: "総務部"
      },
      {
        applicationId: "APP005",
        delayDays: 3,
        approverLevel: 2,
        documentImportance: 2,
        applicantDepartment: "経理部"
      }
    ];
    const priorityWeights = {
      delayWeight: 10,
      levelWeight: 5,
      importanceWeight: 8
    };

    const result = determinePriorityForReminder(pendingApplications, priorityWeights);

    expect(result).toHaveLength(2);
    expect(result[0].applicationId).toBe("APP004");
    expect(result[0].priorityScore).toBe(135); // 8*10 + 3*5 + 5*8
    expect(result[0].reminderUrgency).toBe("high");
    expect(result[1].applicationId).toBe("APP005");
    expect(result[1].priorityScore).toBe(56); // 3*10 + 2*5 + 2*8
    expect(result[1].reminderUrgency).toBe("medium");
  });

  // SCEN-448: [edge] 催促対象優先度判定 - 同一優先度の案件について適切な順序が決定される
  test("同一優先度の案件が優先度スコア順に並べられる", () => {
    const pendingApplications = [
      {
        applicationId: "APP006",
        delayDays: 5,
        approverLevel: 2,
        documentImportance: 3,
        applicantDepartment: "総務部"
      },
      {
        applicationId: "APP007",
        delayDays: 6,
        approverLevel: 2,
        documentImportance: 2,
        applicantDepartment: "経理部"
      }
    ];
    const priorityWeights = {
      delayWeight: 10,
      levelWeight: 5,
      importanceWeight: 8
    };

    const result = determinePriorityForReminder(pendingApplications, priorityWeights);

    expect(result[0].applicationId).toBe("APP007");
    expect(result[0].priorityScore).toBe(86); // 6*10 + 2*5 + 2*8
    expect(result[1].applicationId).toBe("APP006");
    expect(result[1].priorityScore).toBe(84); // 5*10 + 2*5 + 3*8
  });

  // SCEN-449: [error] 催促対象優先度判定 - 優先度判定に必要な情報が不足している場合、エラーが発生する
  test("滞留案件が存在しない場合エラーが発生する", () => {
    expect(() => {
      determinePriorityForReminder([], {
        delayWeight: 10,
        levelWeight: 5,
        importanceWeight: 8
      });
    }).toThrow("催促対象となる滞留案件が存在しません。承認進捗を再確認してください。");
  });

  // SCEN-450: [normal] 催促頻度制限 - 適切な間隔での催促通知が送信される
  test("適切な間隔での催促通知が許可される", () => {
    const applicationId = "APP008";
    const targetApproverId = "USER001";
    const lastReminderDate = new Date("2024-01-01T09:00:00");
    const currentDate = new Date("2024-01-05T09:00:00");

    const result = validateReminderFrequency(applicationId, targetApproverId, lastReminderDate, currentDate);

    expect(result.canSendReminder).toBe(true);
    expect(result.waitingDays).toBe(4);
    expect(result.nextAllowedDate).toBeNull();
  });

  // SCEN-451: [normal] 催促頻度制限 - 短時間での重複催促が制限される
  test("短時間での重複催促が制限される", () => {
    const applicationId = "APP009";
    const targetApproverId = "USER002";
    const lastReminderDate = new Date("2024-01-03T09:00:00");
    const currentDate = new Date("2024-01-04T09:00:00");

    const result = validateReminderFrequency(applicationId, targetApproverId, lastReminderDate, currentDate);

    expect(result.canSendReminder).toBe(false);
    expect(result.waitingDays).toBe(1);
    expect(result.nextAllowedDate).toEqual(new Date("2024-01-06T09:00:00"));
  });

  // SCEN-452: [edge] 催促頻度制限 - 制限期間ギリギリの催促要求が適切に処理される
  test("制限期間ギリギリの催促要求が適切に処理される", () => {
    const applicationId = "APP010";
    const targetApproverId = "USER003";
    const lastReminderDate = new Date("2024-01-01T09:00:00");
    const currentDate = new Date("2024-01-04T09:00:00");

    const result = validateReminderFrequency(applicationId, targetApproverId, lastReminderDate, currentDate);

    expect(result.canSendReminder).toBe(true);
    expect(result.waitingDays).toBe(3);
    expect(result.nextAllowedDate).toBeNull();
  });

  // SCEN-453: [normal] 催促メッセージ生成 - 滞留期間と重要度に応じた適切な催促メッセージが生成される
  test("滞留期間と重要度に応じた催促メッセージが生成される", () => {
    const applicationId = "APP011";
    const stagnationDays = 6;
    const documentType = "補助金申請書";
    const approverName = "田中部長";
    const applicantName = "佐藤太郎";

    const result = generateReminderMessage(applicationId, stagnationDays, documentType, approverName, applicantName);

    expect(result.urgencyLevel).toBe("medium");
    expect(result.notificationMethod).toBe("both");
    expect(result.messageContent).toContain("佐藤太郎");
    expect(result.messageContent).toContain("補助金申請書");
    expect(result.messageContent).toContain("6");
  });

  // SCEN-454: [error] 催促メッセージ生成 - メッセージ生成に必要な情報が不足している場合、デフォルトメッセージが使用される
  test("承認者名が空の場合エラーが発生する", () => {
    expect(() => {
      generateReminderMessage("APP012", 5, "一般申請", "", "佐藤太郎");
    }).toThrow("催促対象の承認者が特定できません");
  });

  // SCEN-455: [edge] 催促メッセージ生成 - 最高重要度案件の緊急催促メッセージが適切に生成される
  test("最高重要度案件の緊急催促メッセージが生成される", () => {
    const applicationId = "APP013";
    const stagnationDays = 10;
    const documentType = "補助金申請書";
    const approverName = "山田理事";
    const applicantName = "鈴木次郎";

    const result = generateReminderMessage(applicationId, stagnationDays, documentType, approverName, applicantName);

    expect(result.urgencyLevel).toBe("high");
    expect(result.notificationMethod).toBe("email");
    expect(result.messageContent).toContain("緊急");
  });

  // SCEN-456: [normal] 催促通知宛先特定 - 現在の承認段階に基づいて適切な承認者が特定される
  test("現在の承認段階の承認者が特定される", () => {
    const applicationId = "APP014";
    const documentType = "一般申請書";
    const currentApprovalStage = "部長承認";
    const assignedApproverId = "USER004";
    const approverAvailability = true;

    const result = identifyNotificationRecipient(applicationId, documentType, currentApprovalStage, assignedApproverId, approverAvailability);

    expect(result.recipientId).toBe("USER004");
    expect(result.recipientType).toBe("primary_approver");
    expect(result.notificationMethod).toBe("email");
    expect(result.escalationRequired).toBe(false);
  });

  // SCEN-457: [normal] 催促通知宛先特定 - 承認者が不在の場合、代理承認者が特定される
  test("承認者不在時に代理承認者が特定される", () => {
    const applicationId = "APP015";
    const documentType = "補助金申請書";
    const currentApprovalStage = "課長承認";
    const assignedApproverId = "USER005";
    const approverAvailability = false;

    const result = identifyNotificationRecipient(applicationId, documentType, currentApprovalStage, assignedApproverId, approverAvailability);

    expect(result.recipientType).toBe("substitute_approver");
    expect(result.notificationMethod).toBe("urgent_contact");
    expect(result.escalationRequired).toBe(false);
  });

  // SCEN-458: [error] 催促通知宛先特定 - 承認者も代理承認者も特定できない場合、エラーが発生する
  test("承認者も代理承認者も特定できない場合エラーが発生する", () => {
    expect(() => {
      identifyNotificationRecipient("", "一般申請書", "課長承認", "USER006", false);
    }).toThrow("催促対象の申請案件が特定できません。正しい申請番号を確認してください。");
  });

  // SCEN-465: [normal] 通知優先度判定 - 高緊急度案件が即座に通知される
  test("高緊急度案件が即座に通知される", () => {
    const documentTitle = "緊急補助金申請書";
    const documentType = "補助金申請";
    const submissionDate = new Date("2024-01-15T09:00:00");
    const deadline = new Date("2024-01-17T17:00:00");
    const subsidyRelated = true;

    const result = determinePriorityForApprovalNotification(documentTitle, documentType, submissionDate, deadline, subsidyRelated);

    expect(result.priority).toBe("high");
    expect(result.notificationTiming).toBe("immediate");
    expect(result.urgencyReason).toBe("期限まで3日以内");
  });

  // SCEN-466: [normal] 通知優先度判定 - 通常案件が定期通知として処理される
  test("通常案件が定期通知として処理される", () => {
    const documentTitle = "通常申請書";
    const documentType = "一般申請";
    const submissionDate = new Date("2024-01-15T09:00:00");
    const deadline = new Date("2024-01-30T17:00:00");
    const subsidyRelated = false;

    const result = determinePriorityForApprovalNotification(documentTitle, documentType, submissionDate, deadline, subsidyRelated);

    expect(result.priority).toBe("normal");
    expect(result.notificationTiming).toBe("scheduled");
    expect(result.urgencyReason).toBe("期限まで1週間以内");
  });

  // SCEN-467: [error] 通知優先度判定 - 緊急度判定に失敗した場合、デフォルト優先度が適用される
  test("タイトルが空の場合エラーが発生する", () => {
    expect(() => {
      determinePriorityForApprovalNotification("", "一般申請", new Date(), new Date(), false);
    }).toThrow("申請書類のタイトルが入力されていません。");
  });

  // SCEN-468: [normal] 承認者通知タイミング制御 - 業務負荷を考慮した適切なタイミングで通知が送信される
  test("業務負荷を考慮したタイミングで通知が送信される", () => {
    const pendingApplications = [{ priority: "medium", createdAt: new Date("2024-01-14T09:00:00") }];
    const approverWorkload = 60;
    const lastNotificationTime = new Date("2024-01-15T08:00:00");
    const applicationPriority = "medium";

    const result = determineNotificationTiming(pendingApplications, approverWorkload, lastNotificationTime, applicationPriority);

    expect(result.shouldSendNotification).toBe(true);
    expect(result.notificationFrequency).toBe("60minutes");
  });

  // SCEN-469: [normal] 承認者通知タイミング制御 - 過度な通知頻度が制限される
  test("過度な通知頻度が制限される", () => {
    const pendingApplications = [{ priority: "low", createdAt: new Date("2024-01-15T08:45:00") }];
    const approverWorkload = 30;
    const lastNotificationTime = new Date("2024-01-15T08:50:00");
    const applicationPriority = "low";

    const result = determineNotificationTiming(pendingApplications, approverWorkload, lastNotificationTime, applicationPriority);

    expect(result.shouldSendNotification).toBe(false);
    expect(result.nextNotificationTime.getTime()).toBeGreaterThan(new Date("2024-01-15T08:50:00").getTime());
  });

  // SCEN-470: [error] 承認者通知タイミング制御 - 通知タイミング設定が無効な場合、エラーが発生する
  test("業務負荷レベルが範囲外の場合警告が出る", () => {
    const pendingApplications = [];
    const approverWorkload = 150;
    const lastNotificationTime = new Date();
    const applicationPriority = "medium";

    expect(() => {
      determineNotificationTiming(pendingApplications, approverWorkload, lastNotificationTime, applicationPriority);
    }).toThrow("業務負荷レベルは0から100の範囲で設定してください");
  });

  // SCEN-486: [normal] 承認遅延検知 - 承認期限を過ぎた案件が正しく検知される
  test("承認期限を過ぎた案件が検知される", () => {
    const applicationId = "APP016";
    const currentDateTime = new Date("2024-01-20T10:00:00");
    const approvalDeadline = new Date("2024-01-19T17:00:00");
    const reminderSettings = { beforeDays: [3, 1], urgentHours: 24 };
    const approverInfo = { id: "USER007", name: "田中課長", email: "tanaka@example.com", department: "総務部" };

    const result = checkApprovalDelayAndNotify(applicationId, currentDateTime, approvalDeadline, reminderSettings, approverInfo);

    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("緊急催促");
    expect(result.delayStatus).toBe("緊急");
    expect(result.recipients).toContain("tanaka@example.com");
    expect(result.recipients).toContain("applicant@university.ac.jp");
    expect(result.recipients).toContain("manager@university.ac.jp");
  });

  // SCEN-487: [normal] 承認遅延検知 - 催促タイミングに到達した案件に通知が送信される
  test("催促タイミングの案件に通知が送信される", () => {
    const applicationId = "APP017";
    const currentDateTime = new Date("2024-01-18T10:00:00");
    const approvalDeadline = new Date("2024-01-19T17:00:00");
    const reminderSettings = { beforeDays: [3, 1], urgentHours: 24 };
    const approverInfo = { id: "USER008", name: "佐藤部長", email: "sato@example.com", department: "経理部" };

    const result = checkApprovalDelayAndNotify(applicationId, currentDateTime, approvalDeadline, reminderSettings, approverInfo);

    expect(result.shouldNotify).toBe(true);
    expect(result.notificationType).toBe("事前催促");
    expect(result.delayStatus).toBe("注意");
    expect(result.recipients).toEqual(["sato@example.com"]);
  });

  // SCEN-488: [error] 承認遅延検知 - 検知処理でシステムエラーが発生した場合、適切に処理される
  test("申請案件が存在しない場合エラーが発生する", () => {
    expect(() => {
      checkApprovalDelayAndNotify("", new Date(), new Date(), { beforeDays: [], urgentHours: 24 }, { id: "", name: "", email: "", department: "" });
    }).toThrow("申請案件が特定できません。正しい申請番号を指定してください。");
  });
});