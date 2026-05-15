import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

const markdownAlerts = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
} as const;

function remarkGithubAlerts() {
  return (tree: any) => {
    function visit(node: any) {
      if (!node || typeof node !== 'object') {
        return;
      }

      if (node.type === 'blockquote') {
        transformAlertBlock(node);
      }

      if (Array.isArray(node.children)) {
        node.children.forEach(visit);
      }
    }

    visit(tree);
  };
}

function transformAlertBlock(node: any) {
  const firstChild = node.children?.[0];
  if (firstChild?.type !== 'paragraph' || !Array.isArray(firstChild.children)) {
    return;
  }

  const firstTextIndex = firstChild.children.findIndex((child: any) => child.type === 'text');
  const firstText = firstChild.children[firstTextIndex];
  if (!firstText || typeof firstText.value !== 'string') {
    return;
  }

  const marker = firstText.value.match(/^\s*\[!(note|tip|important|warning|caution)(?:\]|\})[ \t]*(?:\n)?/i);
  if (!marker) {
    return;
  }

  const alertType = marker[1].toLowerCase() as keyof typeof markdownAlerts;
  firstText.value = firstText.value.slice(marker[0].length);

  if (!firstText.value) {
    firstChild.children.splice(firstTextIndex, 1);
  }

  if (firstChild.children.length === 0) {
    node.children.shift();
  }

  node.data = {
    ...node.data,
    hName: 'div',
    hProperties: {
      ...(node.data?.hProperties || {}),
      className: ['markdown-alert', `markdown-alert-${alertType}`],
    },
  };

  node.children.unshift({
    type: 'paragraph',
    data: {
      hName: 'div',
      hProperties: {
        className: ['markdown-alert-title'],
      },
    },
    children: [{ type: 'text', value: markdownAlerts[alertType] }],
  });
}

interface MarkdownRendererProps {
  content: string;
  emptyText?: string;
  className?: string;
}

const headingAnchorClass = 'scroll-mt-24';

export default function MarkdownRenderer({
  content,
  emptyText = '*暂无内容...*',
  className = '',
}: MarkdownRendererProps) {
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkGithubAlerts]}
        rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
        components={{
          h1: ({ children, ...props }) => (
            <h1 className={headingAnchorClass} {...props}>{children}</h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className={headingAnchorClass} {...props}>{children}</h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className={headingAnchorClass} {...props}>{children}</h3>
          ),
          a: ({ children, ...props }) => (
            <a target="_blank" rel="noreferrer" {...props}>{children}</a>
          ),
          table: ({ children, ...props }) => (
            <div className="markdown-table-wrap">
              <table {...props}>{children}</table>
            </div>
          ),
        }}
      >
        {content || emptyText}
      </ReactMarkdown>
    </div>
  );
}
