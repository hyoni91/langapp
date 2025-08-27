

export type Word = {
  id: string;
  jaSurface : string,
  koSurface : string,
  tags: string[];
  updatedAt: Date; // ISO 문자열로 클라에 전달
}
