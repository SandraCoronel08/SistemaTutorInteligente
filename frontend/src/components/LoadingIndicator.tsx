type LoadingIndicatorProps = {
  label?: string;
  asMessage?: boolean;
};

export function LoadingIndicator({
  label = "El tutor esta respondiendo...",
  asMessage = false
}: LoadingIndicatorProps): JSX.Element {
  if (asMessage) {
    return (
      <article
        className="message-row loading-message-row"
        role="status"
        aria-live="polite"
      >
        <div className="message-avatar">AI</div>
        <div className="message-bubble message-assistant loading-message">
          <span className="loading-dots" aria-hidden="true">
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
          </span>
          <span>{label}</span>
        </div>
      </article>
    );
  }

  return (
    <div className="loading-indicator" role="status" aria-live="polite">
      <span className="loading-dot" />
      <span className="loading-dot" />
      <span className="loading-dot" />
      <span>{label}</span>
    </div>
  );
}
