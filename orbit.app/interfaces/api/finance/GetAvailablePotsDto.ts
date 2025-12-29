export interface GetAvailablePotsDto {
  pots: AvailablePot[];
}

export interface AvailablePot {
  id: number;
  name: string;
  currentBalance: number;
}
