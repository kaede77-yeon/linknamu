// 서버·클라이언트가 함께 쓰는 댓글 타입 (여기서는 mongodb를 import 하지 않는다)

/** 재댓글 최대 횟수. 댓글(0) → 재댓글(1) → 재재댓글(2) */
export const MAX_DEPTH = 2;

export const AUTHOR_MAX = 20;
export const BODY_MAX = 500;
export const DEFAULT_AUTHOR = "익명";

export type CommentItem = {
  id: string;
  parentId: string | null;
  depth: number;
  author: string;
  body: string;
  createdAt: string; // ISO 문자열
};

export type CommentNode = CommentItem & {
  replies: CommentNode[];
};

/** 평평한 목록을 부모-자식 트리로 바꾼다 */
export function buildCommentTree(items: CommentItem[]): CommentNode[] {
  const nodes = new Map<string, CommentNode>();
  for (const item of items) {
    nodes.set(item.id, { ...item, replies: [] });
  }

  const all = Array.from(nodes.values());

  const roots: CommentNode[] = [];
  for (const node of all) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) {
      parent.replies.push(node);
    } else {
      // 최상위 댓글, 또는 부모가 사라진 고아 댓글
      roots.push(node);
    }
  }

  const asc = (a: CommentNode, b: CommentNode) =>
    a.createdAt.localeCompare(b.createdAt);

  // 답글은 쓴 순서대로, 최상위 댓글은 최신 글이 위로
  for (const node of all) {
    node.replies.sort(asc);
  }
  roots.sort((a, b) => -asc(a, b));

  return roots;
}
