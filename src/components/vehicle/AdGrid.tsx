import type { VehicleCardT } from '../../types';
import VehicleCard from './VehicleCard';
import { AdView, useEffectiveView } from '../../utils/adView';

const LAYOUT: Record<AdView, { grid: string; card: 'list' | 'large' | 'grid' }> = {
  list: { grid: 'grid-cols-1 gap-3 lg:grid-cols-2', card: 'list' },
  large: { grid: 'grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3', card: 'large' },
  grid2: { grid: 'grid-cols-2 gap-2.5 sm:gap-4', card: 'grid' },
  grid3: { grid: 'grid-cols-2 gap-3 md:grid-cols-3 md:gap-4', card: 'grid' },
  grid4: { grid: 'grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4', card: 'grid' },
};

/** a list of ads laid out the way the visitor chose in the View menu */
export default function AdGrid({ ads, className = '' }: { ads: VehicleCardT[]; className?: string }) {
  const view = useEffectiveView();
  const l = LAYOUT[view];
  return <div className={`grid ${l.grid} ${className}`}>{ads.map((v) => <VehicleCard key={v._id} v={v} variant={l.card} />)}</div>;
}
