export type YesNo = "yes" | "no";
export type DailyTime = "under_15" | "between_15_30" | "over_30";

export type DiagnosisAnswers = {
  businessAccount: YesNo;
  profileReview: YesNo;
  postConsistency: YesNo;
  targetClarity: YesNo;
  storiesDaily: YesNo;
  highlightsUpdated: YesNo;
  insightsCheck: YesNo;
  competitorCheck: YesNo;
  competitorAnalysis: YesNo;
  adUsage: YesNo;
  dailyTime: DailyTime;
};

export type Level = "初級" | "中級" | "上級" | "エキスパート";
export type Category = "基礎設計" | "コンテンツ" | "分析・改善" | "集客施策";

export type DiagnosisResult = {
  score: number;
  level: Level;
  bottleneck: Category;
  currentState: string;
  bottleneckText: string;
  nextActions: string[];
  timeAdvice: string | null;
  breakdown: Record<string, number>;
};

const CATEGORY_MAP: Record<Category, (keyof DiagnosisAnswers)[]> = {
  基礎設計: ["businessAccount", "profileReview", "targetClarity"],
  コンテンツ: ["postConsistency", "storiesDaily", "highlightsUpdated"],
  "分析・改善": ["insightsCheck", "competitorCheck", "competitorAnalysis"],
  集客施策: ["adUsage"],
};

const CURRENT_STATE: Record<Level, string> = {
  初級:
    "Instagram運用の土台がまだ整っていない段階です。アカウント設計やターゲット設定といった基礎部分が曖昧なまま発信している状態で、投稿しても反応が返ってこない原因はここにあります。まずは運用の前提を整えるところから始める必要があります。",
  中級:
    "基本的な運用はできているものの、戦略や改善サイクルが不十分な段階です。「なんとなく投稿している」状態から抜け出せておらず、成果が感覚頼みになっています。データに基づいた運用設計にシフトすれば、ここから一気に伸ばせる余地があります。",
  上級:
    "基本は押さえられており、運用の型ができている状態です。ただし、集客や成果への転換がまだ弱く、「やることはやっているのに結果が出ない」に陥りやすい段階です。競合分析や投稿改善を深めることで、次のフェーズに進めます。",
  エキスパート:
    "Instagram運用として押さえるべき項目はほぼ全て実践できている状態です。ここから先は、広告運用・外部施策・コラボといった次のステージの最適化フェーズです。さらなる成果を狙うなら、ブランディング設計や収益導線の最適化が次の論点になります。",
};

const BOTTLENECK_TEXT: Record<Category, string> = {
  基礎設計:
    "一番のボトルネックは「アカウントの基礎設計」です。誰に何を届けるアカウントなのか、プロフィールを見た人がフォローすべき理由を感じられるか。この土台が曖昧だと、どれだけ投稿しても適切な人には届きません。",
  コンテンツ:
    "一番のボトルネックは「コンテンツ発信の継続性と統一感」です。統一感のないフィード、更新の止まったストーリーズ・ハイライトは、訪問者に「このアカウントは動いていない」という印象を与えてしまいます。",
  "分析・改善":
    "一番のボトルネックは「分析と改善のサイクル」です。インサイトを見ていない、競合を見ていない、伸びた投稿の理由が分からない。この状態では投稿数を増やしても、当たる・外れるの運頼みになります。",
  集客施策:
    "一番のボトルネックは「集客施策への踏み込み」です。基礎運用は整っていますが、認知拡大のための広告や外部連携を活用できていません。オーガニックの限界を超えるには、次のステージへの投資判断が必要です。",
};

const NEXT_ACTIONS: Record<Category, string[]> = {
  基礎設計: [
    "プロフィールを「誰向け・何が得られるアカウントか」が一目で分かる文言に書き直す",
    "アカウントのメインテーマ(発信軸)を3つ以内に絞り込み、投稿内容をその中に収める",
    "ビジネスアカウント/クリエイターアカウントに切り替え、分析の前提を整える",
  ],
  コンテンツ: [
    "投稿デザインのテンプレートを固定し、フィード全体に統一感を持たせる",
    "ストーリーズを毎日1投稿、ハイライトは月1回の見直しをルール化する",
    "投稿前に「誰に何を伝える投稿か」を書き出し、目的のない投稿を減らす",
  ],
  "分析・改善": [
    "週1回、インサイトでリーチ・保存・プロフィールアクセスを確認する習慣をつける",
    "ベンチマーク競合を3アカウント選び、伸びた投稿を「なぜ伸びたか」言語化する",
    "投稿ごとに「伸びた/伸びなかった理由」の仮説を1行でメモする",
  ],
  集客施策: [
    "少額(月1〜3万円)から広告運用を試し、どのクリエイティブが効くか検証する",
    "他アカウントとのコラボ投稿・タグ付けを企画し、外部からの流入動線を作る",
    "プロフィールのリンクを最適化し、Instagram外(LINE・LPなど)への動線を設計する",
  ],
};

function toLevel(score: number): Level {
  if (score === 10) return "エキスパート";
  if (score >= 8) return "上級";
  if (score >= 5) return "中級";
  return "初級";
}

function computeBottleneck(
  answers: DiagnosisAnswers,
  breakdown: Record<string, number>,
): Category {
  let worst: Category = "基礎設計";
  let worstRate = Infinity;

  (Object.keys(CATEGORY_MAP) as Category[]).forEach((cat) => {
    const keys = CATEGORY_MAP[cat];
    const yesCount = keys.reduce((acc, k) => acc + (breakdown[k] === 1 ? 1 : 0), 0);
    const rate = yesCount / keys.length;
    if (rate < worstRate) {
      worstRate = rate;
      worst = cat;
    }
  });

  return worst;
}

function buildTimeAdvice(
  dailyTime: DailyTime,
  level: Level,
): string | null {
  if (dailyTime === "under_15") {
    return "現在の運用時間(1日15分未満)では、どんな施策も効果が出にくい状態です。運用時間の確保、もしくは代行・外注の検討も視野に入れてください。";
  }
  if (dailyTime === "over_30" && (level === "初級" || level === "中級")) {
    return "1日30分以上の時間を投下しているにもかかわらずスコアが伸びていないのは、戦略設計にズレがある可能性が高いです。時間ではなく運用方針の見直しが必要です。";
  }
  return null;
}

export function scoreDiagnosis(answers: DiagnosisAnswers): DiagnosisResult {
  const breakdown: Record<string, number> = {};

  const yesNoKeys: (keyof DiagnosisAnswers)[] = [
    "businessAccount",
    "profileReview",
    "postConsistency",
    "targetClarity",
    "storiesDaily",
    "highlightsUpdated",
    "insightsCheck",
    "competitorCheck",
    "competitorAnalysis",
    "adUsage",
  ];

  yesNoKeys.forEach((k) => {
    breakdown[k] = answers[k] === "yes" ? 1 : 0;
  });

  const score = yesNoKeys.reduce((acc, k) => acc + breakdown[k], 0);
  const level = toLevel(score);
  const bottleneck = computeBottleneck(answers, breakdown);

  return {
    score,
    level,
    bottleneck,
    currentState: CURRENT_STATE[level],
    bottleneckText: BOTTLENECK_TEXT[bottleneck],
    nextActions: NEXT_ACTIONS[bottleneck],
    timeAdvice: buildTimeAdvice(answers.dailyTime, level),
    breakdown,
  };
}
