export const currencies = ['PHP', 'JPY', 'USD'] as const;
export type Currency = typeof currencies[number];
