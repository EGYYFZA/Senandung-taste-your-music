export default function Loading() {
  return (
    <div className="loading-state" role="status">
      <span className="skeleton skeleton-heading" />
      <span className="skeleton skeleton-hero" />
      <span className="sr-only">Menyiapkan ruang musikmu...</span>
    </div>
  );
}
