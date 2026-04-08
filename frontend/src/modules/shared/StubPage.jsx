import { PageHeader } from '../../core';

export default function StubPage({ title, subtitle = 'This module is coming soon' }) {
  return (
    <div className="page-container">
      <PageHeader title={title} subtitle={subtitle} />
      <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-none bg-gradient-brand/10 flex items-center justify-center mb-4">
          <div className="w-10 h-10 rounded-none bg-gradient-brand flex items-center justify-center">
            <span className="text-white text-lg font-bold">🚧</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-content-primary mb-2">{title}</h3>
        <p className="text-sm text-content-secondary max-w-md">
          This module is under development and will be available soon. All data and functionality will be connected in upcoming phases.
        </p>
        <div className="mt-6 flex gap-2">
          <span className="badge-teal">Phase 2+</span>
          <span className="badge bg-surface-hover text-content-secondary">In Development</span>
        </div>
      </div>
    </div>
  );
}
