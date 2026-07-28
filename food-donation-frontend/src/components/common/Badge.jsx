import { STATUS_COLORS } from '../../utils/constants';
import { statusLabel } from '../../utils/formatters';

export default function Badge({ status, children, variant }) {
  const resolvedVariant = variant || STATUS_COLORS[status] || 'neutral';
  return (
    <span className={`badge badge-${resolvedVariant}`}>
      {children || statusLabel(status)}
    </span>
  );
}
