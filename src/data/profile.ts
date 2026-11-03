export type LinkItem = {
  id: string;
  title: string;
  description?: string;
  url: string;
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
    id: "github",
    title: "💻 GitHub",
    description: "만든 것들",
    url: "https://github.com/kaede77-yeon",
  },
  {
    id: "email",
    title: "✉️ 이메일",
    description: "kaede77@naver.com",
    url: "mailto:kaede77@naver.com",
  },
];
