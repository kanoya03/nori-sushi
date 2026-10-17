import type {
  PickupPoint,
} from '../store/addressStore';

export const PICKUP_POINTS: PickupPoint[] = [
  {
    id: 1,
    name: 'NORI SUSHI — Duomo',
    address: 'Milano, Via Torino, 12',
    coordinate: [
      9.1856,
      45.4614,
    ],
  },

  {
    id: 2,
    name: 'NORI SUSHI — Brera',
    address: 'Milano, Via Brera, 23',
    coordinate: [
      9.1888,
      45.4720,
    ],
  },

  {
    id: 3,
    name: 'NORI SUSHI — Porta Venezia',
    address:
      'Milano, Corso Buenos Aires, 18',
    coordinate: [
      9.2053,
      45.4771,
    ],
  },
];