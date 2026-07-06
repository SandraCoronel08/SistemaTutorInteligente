import ReactMarkdown from "react-markdown";
import { markdownPlugins } from "../utils/markdownConfig";

type MarkdownMessageProps = {
  content: string;
};

export function MarkdownMessage({ content }: MarkdownMessageProps): JSX.Element {
  return (
    <ReactMarkdown
      remarkPlugins={markdownPlugins.remarkPlugins}
      rehypePlugins={markdownPlugins.rehypePlugins}
    >
      {content}
    </ReactMarkdown>
  );
}
