// システム障害時承認継続ロジック
export function handleSystemFailureFallback(
  systemStatus: string,
  applicationId: string,
  userRole: string
): {
  fallbackMethod: string;
  emergencyContactList: string[];
  paperFormUrl: string;
  syncRequired: boolean;
} {
  let fallbackMethod = "emergency_paper";
  let emergencyContactList = ["relevant_staff", "it_support"];
  
  // データ整合性エラーの場合は一時的な回避策を使用
  if (systemStatus === "data_consistency_error") {
    fallbackMethod = "temporary_workaround";
  }
  
  const paperFormUrl = `http://emergency-forms.university.ac.jp/paper/${applicationId}`;
  const syncRequired = true;

  return {
    fallbackMethod,
    emergencyContactList,
    paperFormUrl,
    syncRequired
  };
}