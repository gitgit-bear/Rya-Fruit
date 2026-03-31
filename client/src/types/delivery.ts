export type DeliverySettings = {
  freeShipThreshold: number;
  cutOffTime: string; // "HH:mm"
  leadDays: number;
  note: string;
  timeSlots: string[];
};

export type DeliveryZone = {
  id: string;
  name: string;
  fee: number;
  note?: string;
};

export type DeliveryConfig = {
  settings: DeliverySettings;
  zones: DeliveryZone[];
};

