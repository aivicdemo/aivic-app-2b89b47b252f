import { validateApplicationInput } from '../../src/logic/it-1-br-2-1-1';

describe("申請書類の文書種別を自動判別し補助金関連度に基づいて電子化可否を判定する機能", () => {
  test("申請内容入力検証 - 必須項目が全て入力されている場合、次の処理に進むことができる", () => {
    // SCEN-417
    const documentTitle = "科学研究費助成事業における設備導入申請について";
    const documentContent = "本申請は、科学研究費助成事業に係る研究設備の導入を目的としており、研究の効率性向上および成果の質的向上を図るものである。申請する設備は高性能分析装置であり、本学の研究活動において必要不可欠な機器である。";
    const applicationType = "補助金申請";
    const applicantDepartment = "工学部";
    const urgencyLevel = "通常";

    const result = validateApplicationInput(
      documentTitle,
      documentContent,
      applicationType,
      applicantDepartment,
      urgencyLevel
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });
});