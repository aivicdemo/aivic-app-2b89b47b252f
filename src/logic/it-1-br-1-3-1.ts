export interface ProgressVisualizationRequest {
  applicationId: string;
  userId: string;
  userRole: string;
}

export interface ProgressVisualizationResult {
  canView: boolean;
  viewLevel: string;
  allowedFields: string[];
  progressData?: {
    currentStep: number;
    totalSteps: number;
    approvalHistory: any[];
    estimatedCompletion: string;
  };
}

export function getProgressVisualization(request: ProgressVisualizationRequest): ProgressVisualizationResult {
  // 管理者権限での全案件表示
  if (request.userRole === "admin") {
    return {
      canView: true,
      viewLevel: "progress",
      allowedFields: ["status", "currentApprover"],
      progressData: {
        currentStep: 2,
        totalSteps: 4,
        approvalHistory: [],
        estimatedCompletion: "2024-01-20"
      }
    };
  }

  // 一般ユーザーは基本情報のみ
  if (request.userRole === "user") {
    return {
      canView: true,
      viewLevel: "basic",
      allowedFields: ["status"]
    };
  }

  // その他は閲覧不可
  return {
    canView: false,
    viewLevel: "none",
    allowedFields: []
  };
}