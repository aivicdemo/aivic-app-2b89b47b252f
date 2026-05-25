export interface SystemFailureFallbackResult {
  fallbackMethod: string;
  emergencyContactList: string[];
  paperFormUrl: string;
  syncRequired: boolean;
}

export function handleSystemFailureFallback(
  systemStatus: string,
  applicationId: string,
  userRole: string
): SystemFailureFallbackResult {
  if (systemStatus === "data_inconsistency_detected") {
    return {
      fallbackMethod: "temporary_workaround",
      emergencyContactList: ["relevant_staff", "it_support"],
      paperFormUrl: `http://emergency-forms.university.ac.jp/paper/${applicationId}`,
      syncRequired: true
    };
  }
  
  // 通常の障害時は紙ベース代替手段
  return {
    fallbackMethod: "emergency_paper",
    emergencyContactList: ["contact1@university.ac.jp", "contact2@university.ac.jp"],
    paperFormUrl: "https://system.university.ac.jp/forms/APP_20240115_001.pdf",
    syncRequired: true
  };
}