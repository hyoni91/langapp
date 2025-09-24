
export type WordStatus = "draft" | "published";

export interface ImageMeta {
  id: string;
  imageUrl: string;       // Firebase Storage URL
  storagePath: string;
  contentType?: string;
  createdAt: string;      // ISO string (API로 받을 때)
}

export type Word = {
  id: string;
  jaSurface : string,
  koSurface : string,
  tags: string[];
  status: WordStatus;
  updatedAt: Date, // ISO 문자열로 클라에 전달
  image?: ImageMeta | null;
  userId: string,
}


// 포스팅용
export type WordEditor = {
  jaSurface : string;
  koSurface : string;
  status : WordStatus;
  imageFile?: File; // 업로드 전, 프론트에서만 사용
  imageUrl?: string; // 업로드後 Firebase のURL  storagePath : string;
  contentType : string;
}