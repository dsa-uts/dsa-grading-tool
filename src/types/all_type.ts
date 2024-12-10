export type DeductionItem = {
  id: string; // 自動生成されるID
  description: string;
  points: number;
  defaultFeedback: string; // デフォルトの講評文字列
  // 部分点のリスト(Key: 整数ID: Value: DeductionItem)
  // 整数IDは、subDeductions内での順番を表す。
  subDeductions: DeductionItem[];
}

// 学生に登録されている減点項目を管理するデータ構造
export type RegisteredDeduction = {
  deductionId: string; // DeductionItem.id
  feedback: string; // 講評(人によって講評の内容を微妙に変えれるようにするためのフィールド)
}

// 学生データ
export type Student = {
  id: string;
  studentId: string; // 学籍番号
  name: string; // 名前
  // そもそも回答を提出しているかどうか
  // 未提出なら、最終結果の点数・講評は未記入になる
  isSubmitted: boolean;
  isGraded: boolean; // 採点済みかどうか
  registeredDeductionList: RegisteredDeduction[];
  additionalDeduction: number; // 追加減点(TAが手動で設定する減点)
  additionalFeedback: string; // 追加講評(TAが手動で設定する講評)
}

// 全データをまとめたデータ構造
// データをセーブする際、JSONデータにシリアライズするために、
// データ構造をこのように定義している。
export type AllData = {
  totalPoints: number; // 満点
  deductionItemTree: DeductionItem;
  studentList: Student[];
}

// 現在採点対象になっている学生のチェックボックスリストの状態
export type CheckBoxState = {
  deductionId: string; // DeductionItem.id
  isChecked: boolean; // チェックボックスのチェック状態
  isDisabled: boolean; // 親のチェックボックスがチェックされている場合はtrue
  isExpanded: boolean; // 子のチェックボックスが展開されている場合はtrue
  subCheckBoxStateList: CheckBoxState[]; // 子のチェックボックスの状態
  modifiedFeedback: string; // その学生だけに修正される講評
}

export type RegisteredDeductionTree = {
  id: number;
  registeredDeduction: RegisteredDeduction | null;
  children: RegisteredDeductionTree[];
}
