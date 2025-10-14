//UI표시 가공용

export interface LearningCardData {
  id: string;            // = word.id
  ko: string;            // = word.koSurface
  ja: string;            // = word.jaSurface
  imgUrl: string;        // = word.image?.imageUrl ?? placeholder
  tags: string[];
  imgId : string;
  status: "draft" | "published";
}

export type LearningListData = LearningCardData[];

//단어 학습 완료(발음완료) 표시용
export interface LearnedWord {
  id: string;           // = word.id
  action: "learn";
  lang: "ja"; // 기준 언어 고정
}
