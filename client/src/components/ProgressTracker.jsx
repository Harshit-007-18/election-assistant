export default function ProgressTracker({ progress }) {
  if (!progress) return null;

  const percent = Math.round((progress.current / progress.total) * 100);

  return (
    <div className="progress-tracker">
      <span className="progress-label">{progress.label || 'Progress'}</span>
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="progress-step">
        {progress.current}/{progress.total}
      </span>
    </div>
  );
}
