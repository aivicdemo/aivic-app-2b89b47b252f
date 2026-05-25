// システム障害時のフォールバック処理
export function handleSystemFailureFallback(systemStatus: string, applicationId: string, userRole: string) {
  let fallbackMethod = "emergency_paper";
  let emergencyContactList = ["relevant_staff", "it_support"];
  let syncRequired = true;
  
  // データ整合性エラーの場合は一時的な回避策を使用
  if (systemStatus === "data_inconsistency_error") {
    fallbackMethod = "temporary_workaround";
  }
  
  return {
    fallbackMethod,
    emergencyContactList,
    paperFormUrl: `http://emergency-forms.university.ac.jp/paper/${applicationId}`,
    syncRequired
  };
}