import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { cn } from "@/lib/utils";
import React from "react";

const components = {
  h1: ({ children, ...props }) => (
    <h1 {...props} className="text-3xl font-bold text-foreground mb-4">
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 {...props} className="text-2xl font-semibold text-foreground mb-3">
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 {...props} className="text-xl font-medium text-foreground mb-2">
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 {...props} className="text-lg font-medium text-foreground mb-2">
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p {...props} className="text-base text-muted-foreground leading-relaxed">
      {children}
    </p>
  ),
  span: ({ children, ...props }) => (
    <span {...props} className="text-[16px]">
      {children}
    </span>
  ),
  code: ({ children, ...props }) => (
    <code
      {...props}
      className="bg-muted rounded text-sm font-mono text-primary"
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }) => (
    <pre
      {...props}
      className="bg-muted p-4 rounded-md overflow-x-auto text-sm mb-4 font-mono"
    >
      {children}
    </pre>
  ),
  strong: ({ children, ...props }) => (
    <strong {...props} className="font-bold text-primary">
      {children}
    </strong>
  ),
  a: ({ children, href, ...props }) => (
    <a
      {...props}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline transition-all duration-200"
    >
      {children}
    </a>
  ),
  ul: ({ children, ...props }) => (
    <ul {...props} className="list-disc pl-6 mb-4 space-y-1">
      {children}
    </ul>
  ),
  li: ({ children, ...props }) => (
    <li {...props} className="text-muted-foreground leading-relaxed">
      {children}
    </li>
  ),
  ol: ({ children, ...props }) => (
    <ol {...props} className="list-decimal pl-6 mb-4 space-y-1">
      {children}
    </ol>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      {...props}
      className="border-l-4 border-muted pl-4 italic text-muted-foreground my-4"
    >
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-auto my-6">
      <table
        {...props}
        className="min-w-full border border-border text-sm text-left rounded-md overflow-hidden"
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead {...props} className="bg-muted text-muted-foreground">
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
  tr: ({ children, ...props }) => (
    <tr
      {...props}
      className="border-b border-border hover:bg-muted/40 transition-colors"
    >
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th {...props} className="px-4 py-2 font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td {...props} className="px-4 py-2 text-muted-foreground">
      {children}
    </td>
  ),
};

const Markdown = ({ source, className }) => {
  const content = (
    <div className={cn(className)}>
      <ReactMarkdown
        components={components}
        rehypePlugins={[rehypeKatex]}
        remarkPlugins={[remarkGfm, remarkMath]}
      >
        {source.toString()}
      </ReactMarkdown>
    </div>
  );
  return <>{content}</>;
};

export default Markdown;
