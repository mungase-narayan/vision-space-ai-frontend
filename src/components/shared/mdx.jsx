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
import ChartRenderer, { ENGINE } from "./chart-renderer";

export const FOCUS_VISIBLE_OUTLINE = `focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`;
export const LINK_STYLES = `decoration-none text-primary transition-all hover:text-primary`;
export const LINK_SUBTLE_STYLES = `hover:text-primary decoration-none`;
export const HEADING_LINK_ANCHOR = `before:content-['#'] before:absolute before:-ml-[1em] before:text-transparent hover:before:text-primary pl-[1em] -ml-[1em]`;

import { useState } from "react";

export function CodeBlock({ node, inline, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || "");
  const code = String(children).replace(/\n$/, "");
  const [copied, setCopied] = useState(false);

  // Detect custom chart languages and render accordingly
  if (!inline && match) {
    const lang = match[1]?.toLowerCase();
    if (["plotly", "chartjs", "d3"].includes(lang)) {
      try {
        const spec = JSON.parse(code);
        const engine =
          lang === "plotly"
            ? ENGINE.PLOTLY
            : lang === "chartjs"
              ? ENGINE.CHARTJS
              : ENGINE.D3;
        return (
          <div data-chart-renderer="true" className="my-4 border border-border rounded-md p-2 bg-background">
            <ChartRenderer engine={engine} spec={spec} />
          </div>
        );
      } catch (e) {
        // fall through to show code if JSON invalid
      }
    }
  }

  // If code block has no language and looks like JSON, try auto-rendering as chart
  if (!inline && !match) {
    try {
      const spec = JSON.parse(code);
      let engine = ENGINE.CHARTJS;
      if (Array.isArray(spec?.data) && (spec?.layout || spec?.data?.[0]?.type)) {
        engine = ENGINE.PLOTLY;
      } else if (typeof spec?.type === "string" && spec?.data && spec?.data?.labels) {
        engine = ENGINE.CHARTJS;
      } else if (Array.isArray(spec?.data) && spec?.data?.[0] && ("x" in spec.data[0]) && ("y" in spec.data[0])) {
        engine = ENGINE.D3;
      }
      return (
        <div data-chart-renderer="true" className="my-4 border border-border rounded-md p-2 bg-background">
          <ChartRenderer engine={engine} spec={spec} />
        </div>
      );
    } catch (_) {
      // not JSON; fall through
    }
  }

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
    <div className="relative group my-4">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 text-xs font-medium text-white bg-slate-700/80 backdrop-blur-sm rounded-md hover:bg-slate-600/80 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
      >
        {copied ? "✓" : "Copy"}
      </button>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        className="!bg-slate-900/95 !rounded-lg !text-sm font-mono shadow-lg border border-slate-700/50"
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code
      className="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800 dark:text-slate-100"
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
      className={cn("leading-6 [&:not(:first-child)]:mt-4 text-slate-700 dark:text-slate-200", className)}
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
      className={cn("mt-4 border-l-4 border-slate-500 dark:border-slate-400 pl-4 italic bg-slate-50/50 dark:bg-slate-800/30 py-3 rounded-r-lg", className)}
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
  pre: ({ className, children, ...props }) => {
    const onlyChild = Array.isArray(children) ? children[0] : children;
    if (
      React.isValidElement(onlyChild) &&
      onlyChild?.props?.["data-chart-renderer"]
    ) {
      return onlyChild;
    }

    return (
      <pre
        className={cn("rounded-md overflow-x-auto text-sm mb-4 font-mono", className)}
        {...props}
      >
        {children}
      </pre>
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
  // Directly render visualization tool envelope if present
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      if (parsed && parsed.kind === "visualization" && parsed.library && parsed.spec) {
        if (parsed.library === "plotly") {
          return (
            <div data-chart-renderer="true" className="my-2">
              <ChartRenderer engine={ENGINE.PLOTLY} spec={{ ...parsed.spec, layout: { ...(parsed.spec?.layout || {}), height: parsed.meta?.height || parsed.spec?.layout?.height || 400 } }} />
            </div>
          );
        }
        // If other libraries (e.g., vega-lite) are requested but not supported, fall through to markdown
      }
    } catch (_) {
      // not JSON, render as markdown below
    }
  }

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
