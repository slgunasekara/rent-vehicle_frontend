import { Bike, Bus, Car, CarFront, CarTaxiFront, Caravan, Container, Forklift, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const CATEGORY_ICON: Record<string, LucideIcon> = {
  car: Car, suv: CarFront, van: Caravan, bus: Bus, motorbike: Bike, lorry: Truck, three_wheel: CarTaxiFront, pickup: Container, heavy_duty: Forklift,
};
