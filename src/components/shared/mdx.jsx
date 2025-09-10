import React from "react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { MathJaxContext } from "better-react-mathjax";

import { cn, perfectFormatMarkdown } from "@/lib/utils";

import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export const FOCUS_VISIBLE_OUTLINE = `focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`;
export const LINK_STYLES = `decoration-none text-primary transition-all hover:text-primary`;
export const LINK_SUBTLE_STYLES = `hover:text-primary decoration-none`;
export const HEADING_LINK_ANCHOR = `before:content-['#'] before:absolute before:-ml-[1em] before:text-transparent hover:before:text-primary pl-[1em] -ml-[1em]`;

import { useState } from "react";

export function CodeBlock({ node, inline, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || "");
  const code = String(children).replace(/\n$/, "");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return !inline && match ? (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 text-xs text-white bg-gray-700 rounded hover:bg-gray-600 transition-opacity opacity-100"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        className="!bg-neutral-900 rounded !text-base font-mono"
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code
      className="bg-gray-200 dark:bg-accent border px-1 rounded text-sm font-mono text-primary"
      {...props}
    >
      {children}
    </code>
  );
}

const components = {
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        "relative mt-3 border-t-2 pt-9 pb-3 scroll-m-20 text-2xl font-bold",
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "font-heading mt-4 scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        "font-heading mt-8 scroll-m-20 text-lg font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn(
        "font-heading mt-8 scroll-m-20 text-lg font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  ),
  h5: ({ className, ...props }) => (
    <h5
      className={cn(
        "mt-8 scroll-m-20 text-lg font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  ),
  h6: ({ className, ...props }) => (
    <h6
      className={cn(
        "mt-8 scroll-m-20 text-base font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  ),
  a: ({ href = "", ...props }) => {
    if (href.startsWith("http")) {
      return (
        <a
          className={cn("no-underline text-active")}
          href={href}
          target="_blank"
          rel="noopener"
          {...props}
        />
      );
    }

    return (
      <Link
        to={href}
        className={cn(LINK_STYLES, FOCUS_VISIBLE_OUTLINE, HEADING_LINK_ANCHOR)}
        {...props}
      />
    );
  },
  p: ({ className, ...props }) => (
    <p
      className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("my-1 ml-6 list-disc", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn("my-1 ml-6 list-decimal", className)} {...props} />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("mt-2", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn("mt-6 border-l-2 pl-6 italic", className)}
      {...props}
    />
  ),
  img: ({ className, alt, ...props }) => (
    <img className={cn("rounded-md", className)} alt={alt} {...props} />
  ),
  hr: ({ ...props }) => <hr className="my-4 md:my-8" {...props} />,
  code: ({ node, inline, className, children, ...props }) => (
    <CodeBlock
      node={node}
      inline={inline}
      className={className}
      props={props}
      children={children}
    />
  ),
  pre: ({ className, ...props }) => {
    return (
      <>
        <pre
          className="rounded-md overflow-x-auto text-sm mb-4 font-mono"
          {...props}
        />
      </>
    );
  },
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-4 rounded-md border border-border">
      <table {...props} className="w-full text-left border-collapse text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead
      {...props}
      className="bg-muted text-muted-foreground border-b border-border"
    >
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      {...props}
      className="px-4 py-2 text-left font-semibold text-foreground border-r border-border last:border-r-0"
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      {...props}
      className="px-4 py-2 border-t border-border text-muted-foreground border-r last:border-r-0"
    >
      {children}
    </td>
  ),
};

const config = {
  loader: { load: ["[tex]/ams"] },
  tex2jax: {
    inlineMath: [
      ["$", "$"],
      [`\(`, `\)`],
    ],
    displayMath: [
      [`\[`, `\]`],
      ["$$", "$$"],
    ],
  },
};

const MDX = ({ content }) => {
  return (
    <div className="relative">
      <MathJaxContext config={config}>
        <ReactMarkdown
          children={perfectFormatMarkdown(content)}
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={components}
        />
      </MathJaxContext>
    </div>
  );
};

export default MDX;
