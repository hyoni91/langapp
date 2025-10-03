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
