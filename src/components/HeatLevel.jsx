export default function HeatLevel({ level, max = 5 }) {
  return (
    <div className="heat-level">
      <span className="heat-label">Heat:</span>
      <div className="heat-peppers">
        {[...Array(max)].map((_, i) => (
          <span
            key={i}
            className={`pepper ${i < level ? 'active' : ''}`}
            title={`${level}/${max} heat`}
          >
            🌶️
          </span>
        ))}
      </div>
    </div>
  );
}
