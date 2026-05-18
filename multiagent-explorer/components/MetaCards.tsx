'use client';
import type { Pattern } from '@/types/pattern';

interface Props {
  pattern: Pattern;
}

export default function MetaCards({ pattern }: Props) {
  return (
    <div className="meta">
      <div className="card fit">
        <div className="label">FIT</div>
        <div className="body" dangerouslySetInnerHTML={{ __html: pattern.fit }} />
      </div>
      <div className="card risk">
        <div className="label">RISKS</div>
        <div className="body" dangerouslySetInnerHTML={{ __html: pattern.risks }} />
      </div>
      <div className="card example">
        <div className="label">
          IN PRACTICE <span className="tag">{pattern.example.tag}</span>
        </div>
        <div className="body" dangerouslySetInnerHTML={{ __html: pattern.example.body }} />
        {pattern.code && (
          <details>
            <summary data-lang={pattern.code.lang}>
              View code · {pattern.code.lang}
            </summary>
            <pre>
              <code dangerouslySetInnerHTML={{ __html: pattern.code.snippet }} />
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
