// 承認遅延案件検知と催促通知システム

export interface SystemStatus {
  isOnline: boolean;
  compatibility: string;
  lastCheck: string;
}

export interface FallbackResult {
  fallbackMethod: string;
  emergencyContactList: string[];
  paperFormUrl: string;
  syncRequired: boolean;
}

export interface NotificationPriority {
  priority: string;
  notificationTiming: string;
  urgencyReason: string;
}

export interface ReminderMessageData {
  approverName?: string;
  applicantName?: string;
  applicationTitle?: string;
  daysOverdue?: number;
  applicationId?: string;
}

// システム障害時のフォールバック処理
export function handleSystemFailureFallback(
  systemStatus: SystemStatus,
  applicationId: string,
  userRole: string
): FallbackResult {
  // 互換性エラーが検出された場合は temporary_workaround を使用
  if (systemStatus.compatibility === 'error') {
    return {
      fallbackMethod: 'temporary_workaround',
      emergencyContactList: ['relevant_staff', 'it_support'],
      paperFormUrl: `http://emergency-forms.university.ac.jp/paper/${applicationId}`,
      syncRequired: true
    };
  }
  
  // その他の障害時は emergency_paper を使用
  return {
    fallbackMethod: 'emergency_paper',
    emergencyContactList: ['contact1@university.ac.jp', 'contact2@university.ac.jp'],
    paperFormUrl: `https://system.university.ac.jp/forms/${applicationId}.pdf`,
    syncRequired: true
  };
}

// 通知優先度判定
export function determineNotificationPriority(
  applicationType: string,
  daysOverdue: number,
  approverRole: string,
  isUrgent: boolean
): NotificationPriority {
  // 通常案件は低優先度として処理
  if (applicationType === 'normal' && !isUrgent) {
    return {
      priority: 'low',
      notificationTiming: 'scheduled',
      urgencyReason: '通常の申請案件'
    };
  }
  
  // その他は高優先度
  return {
    priority: 'high',
    notificationTiming: 'immediate',
    urgencyReason: '緊急または遅延案件'
  };
}

// 催促メッセージ生成
export function generateReminderMessage(data: ReminderMessageData): string {
  const {
    approverName,
    applicantName,
    applicationTitle,
    daysOverdue,
    applicationId
  } = data;

  // 滞留日数のバリデーションを最初にチェック
  if (daysOverdue !== undefined && daysOverdue < 0) {
    throw new Error('滞留日数は0以上である必要があります');
  }
  
  if (!approverName || approverName.trim() === '') {
    throw new Error('催促対象の承認者が特定できません');
  }
  
  if (!applicantName || applicantName.trim() === '') {
    throw new Error('申請者名が不明です');
  }
  
  if (!applicationTitle || applicationTitle.trim() === '') {
    throw new Error('申請タイトルが不明です');
  }
  
  if (daysOverdue === undefined) {
    throw new Error('滞留日数が不明です');
  }
  
  if (!applicationId || applicationId.trim() === '') {
    throw new Error('申請IDが不明です');
  }

  // 全ての情報が揃っている場合のメッセージ生成
  return `${approverName}様\n\n申請者: ${applicantName}\n申請タイトル: ${applicationTitle}\n滞留日数: ${daysOverdue}日\n申請ID: ${applicationId}\n\n上記申請の承認をお待ちしております。`;
}

// デフォルトメッセージ生成（情報不足時）
export function generateDefaultReminderMessage(): string {
  return '承認待ちの申請があります。システムにログインして確認してください。';
}