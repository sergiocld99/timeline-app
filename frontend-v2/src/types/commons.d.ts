export type FormData = Record<string, string>;
export type WeightColors = '🔴' | '🟠' | '🟡' | '🟢';

export type Weight = {
  color: WeightColors,
  percentage: number
}

export type Weighted = {
  weight: Weight
}

export type AxiosErrorResponse = {
  message?: string;
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
};