/**
 * Animated step content wrapper: new step slides in from the right.
 */
export default function StepForm({ stepKey, children }) {
  return (
    <div className="relative min-h-[120px] overflow-hidden">
      <div key={stepKey} className="animate-slide-in">
        {children}
      </div>
    </div>
  );
}
