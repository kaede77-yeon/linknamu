export type LinkItem = {
  id: string;
  title: string;
  description?: string;
  url: string;
  /** 사이트 내부 메뉴 — 새 창으로 열되 클릭 수는 집계/표시하지 않는다 */
  internal?: boolean;
};

export const profile = {
  name: "이 연규",
  bio: "공공기관 AX | AI활용에 관심 많음",
  avatar: "/profile.jpeg",
};

export const links: LinkItem[] = [
  {
    id: "blog",
    title: "📝 블로그",
    description: "배운 것들을 기록합니다",
    url: "https://blog.naver.com/kaede77",
  },
  {
    id: "gallery",
    title: "🖼 나만의 갤러리",
    description: "사진을 올리고 모아봅니다",
    url: "/gallery",
    internal: true,
  },
  {
    id: "comment",
    title: "💬 연규에게 댓글쓰기",
    description: "자유롭게 한마디 남겨주세요",
    url: "/comments",
    internal: true,
  },
];
