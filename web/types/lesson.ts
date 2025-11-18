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
  action: string;       // "learn"
  lang: string;         // "ja"
}


// Quiz 문제용 타입
export interface AudioQuizOption {
  id: string;
  imageUrl: string;
}

// Quiz 문제 전체 타입
export interface AudioQuizQuestion {
  id: string;
  lang: string;
  ko: string;
  jp: string;
}