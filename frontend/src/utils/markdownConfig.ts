import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

export const markdownPlugins = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeHighlight]
};
