import { Currency } from "./currency"

export type Conversion = {
    from: Currency,
    to: Currency,
    factor: number
}