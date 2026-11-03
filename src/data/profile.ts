export type LinkItem = {
  id: string;
  title: string;
  description?: string;
  url: string;
};

export const profile = {
  name: "이연규",
  bio: "에이아이 배우기",
  avatar: "/avatar.svg",
};

export const links: LinkItem[] = [
  {
    id: "blog",
    title: "블로그",
    description: "배운 것들을 기록합니다",
    url: "https://example.com/blog",
  },
  {
    id: "github",
    title: "GitHub",
    description: "만든 것들",
    url: "https://github.com",
  },
  {
    id: "instagram",
    title: "Instagram",
    description: "일상",
    url: "https://instagram.com",
  },
];
