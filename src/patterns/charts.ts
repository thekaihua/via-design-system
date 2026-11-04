/** Chart fixtures from the design (via-series.js: requests, webhooks, volume). */

const buckets = ['08:10', '08:40', '09:10', '09:40', '10:10', '10:40', '11:10', '11:40'];

export const requestActivity = buckets.map((time, i) => ({
  time,
  successful: [7, 12, 15, 11, 17, 10, 13, 9][i],
  errors: [2, 5, 8, 6, 9, 5, 7, 7][i],
}));

export const webhookActivity = buckets.map((time, i) => ({
  time,
  deliveries: [146, 172, 189, 158, 202, 194, 176, 221][i],
}));

export const paymentVolume = ['00:00', '04:00', '08:10', '09:10', '10:10', '11:10', '12:10', '16:00', '20:00', '23:59'].map((time, i) => ({
  time,
  volume: [0, 0, 35, 70, 105, 140, 140, 140, 140, 140][i],
  previous: 0,
}));
