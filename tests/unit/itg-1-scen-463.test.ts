import { handleSystemFailureFallback } from '../../src/logic/it-1';

describe("承認フローの進捗状況と滞留期間をリアルタイムで可視化する", () => {
  test("システム障害時でも承認進捗確認と催促業務を継続し、障害復旧後にデータを同期する", () => {
    // SCEN-463
    
    // 正常稼働時
    const normalResult = handleSystemFailureFallback(
      "running",
      "APP-001",
      "一般職員"
    );
    
    expect(normalResult).toEqual({
      fallbackMethod: "normal",
      emergencyContactList: [],
      paperFormUrl: "",
      syncRequired: false
    });
    
    // システム障害発生（重要度高い書類）
    const downSystemResult = handleSystemFailureFallback(
      "down",
      "SUB-001",
      "一般職員"
    );
    
    expect(downSystemResult).toEqual({
      fallbackMethod: "emergency_paper",
      emergencyContactList: ["emergency_contact_1", "emergency_contact_2"],
      paperFormUrl: "http://emergency.example.com/forms/SUB-001",
      syncRequired: true
    });
    
    // システム障害発生（一般書類）
    const downGeneralResult = handleSystemFailureFallback(
      "error",
      "GEN-001", 
      "一般職員"
    );
    
    expect(downGeneralResult).toEqual({
      fallbackMethod: "wait_recovery",
      emergencyContactList: ["support_contact_1"],
      paperFormUrl: "http://emergency.example.com/forms/GEN-001",
      syncRequired: true
    });
  });
});