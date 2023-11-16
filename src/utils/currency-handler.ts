import { existsSync, readFileSync, writeFileSync } from "fs";
import { Conversion } from "../types/conversion";
import { cwd } from "process";
import { DateTime } from "luxon";

const fileName = 'currency.json';
const path = `${cwd()}/${fileName}`;

export const updateConversions = async () => {
    const exchangeRates = await _getExchangeRate();
    const conversions: Conversion[] = [
        {
            from: 'JPY',
            to: 'PHP',
            factor: exchangeRates.PHP,
        },
        {
            from: 'JPY',
            to: 'USD',
            factor: exchangeRates.USD,
        },
        {
            from: 'PHP',
            to: 'JPY',
            factor: 1 / exchangeRates.PHP,
        },
        {
            from: 'USD',
            to: 'JPY',
            factor: 1 / exchangeRates.USD,
        }
    ];

    _saveToFile(conversions);
}

export const getConversions = async (): Promise<Conversion[]> => {
    const cachedConversions = _getFromFile();
    if (cachedConversions.length === 0) {
        await updateConversions();
    }
    return _getFromFile();
}

type ExchangeRateResponse = {
    data: {
        PHP: number,
        USD: number,
    }
}

const _getExchangeRate = async () => {
    console.log('getting from api')
    const response = await fetch('https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_2V3aVYkWQQDXDVYa6ttWkrR5t8mRn6uskXJQX7jI&currencies=PHP%2CUSD&base_currency=JPY')
    const content = await response.json() as ExchangeRateResponse
    return content.data;
}

const _saveToFile = (conversions: Conversion[]) => {
    writeFileSync(path, JSON.stringify({date: DateTime.now().toFormat('yyyy-MM-dd'), conversions}, null, 2))
}

const _getFromFile = (): Conversion[] => {
    if (!existsSync(path)) return [];
    const content = readFileSync(path, 'utf-8');
    if (!content?.toString().length) return [];

    const data = JSON.parse(content.toString()) as {date: string, conversions: Conversion[]};
    if (data.date !== DateTime.now().toFormat('yyyy-MM-dd')) return [];
    return data.conversions;
}