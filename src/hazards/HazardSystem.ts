import type { Ship } from "../entities/Ship";

export interface HazardStatus {
  label: string;
  active: boolean;
}

export interface HazardSystem {
  setup(): void;
  update(ship: Ship, deltaSeconds: number): HazardStatus | null;
  destroy(): void;
}
