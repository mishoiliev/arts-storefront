import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function Rating({ value }: { value: number }) {
  return (
    <span
      className='inline-flex items-center gap-1.5 text-xs font-medium text-ink'
      aria-label={`Rated ${value.toFixed(1)} out of 5`}
    >
      <FontAwesomeIcon
        icon={faStar}
        className='size-3 text-accent'
        aria-hidden='true'
      />
      <span className='tabular-nums'>{value.toFixed(1)}</span>
    </span>
  );
}
