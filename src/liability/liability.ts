import { appConfig, getNow } from './../constants';
import { Command } from "commander";
import prompts, { PromptObject } from 'prompts';
import { Currency } from '../types/currency';
import { parse, unparse } from 'papaparse';
import { readFileSync, writeFileSync } from 'fs';
import { cat, getCategories } from './categories/liability-categories';

const folder = appConfig.assetsFolder + '/liabilities';
const fileUrl = `${folder}/liability.csv`;

export const liability = new Command('liability').alias('l');

liability
.command('add')
.action(async () => {
    const categories = getCategories();
    const questions: PromptObject[] = categories.map(c => {
        return {
            type: 'text',
            name: c.category,
            message: `How much ${c.currency} do you owe from ${c.category}?`,
        }
    });
    const answers = await prompts(questions);
    const liability: LiabilityRecord[] = [];
    for (const key in answers) {
        const amountString: string = answers[key].replace(',', '');
        const amount = Number(amountString);

        if (isNaN(amount)) {
            console.log(`The amount for ${key} is not a number. input: ${amount}`);
            return;
        }
        const category = categories.find(c => c.category === key);
        if (category) {
            liability.push({ category: category.category, amount, currency: category.currency, date: getNow(), id: liability.length });
        }
    }
    _saveToFile(liability);
});

liability
.command('remove <id>')
.alias('rm')
.action(async (id: number) => {
    if (isNaN(id)) {
        console.log('Please provide a valid id');
        return;
    }

    const liability = _getLiabilities();
    const idx = liability.findIndex(x => x.id === id);
    if (idx === -1) {
        console.log('Please provide a valid id');
        return;
    }

    liability.splice(idx, 1);
    _saveToFile(liability);
});

liability
.command('list [date]', { isDefault: true })
.alias('ls')
.option('--all', 'List all liabilities')
.action((date: string, options: {all: boolean}) => {
    const assets = _getLiabilities();
    if (options.all) {
        _outputLiabilities(assets);
        return;
    }

    const filter = date ?? getNow();
    const filtered = assets.filter(x => x.date === filter);
    _outputLiabilities(filtered);
});

const _getLiabilities = (): LiabilityRecord[] => {
    const content = readFileSync(fileUrl, { encoding: 'utf-8' });
    const assets = parse<LiabilityRecord>(content, { header: true });
    return assets.data;
};

const _saveToFile = (categories: LiabilityRecord[]) => {
    const content = unparse(categories, { header: true });
    writeFileSync(fileUrl, content);
};

const _outputLiabilities = (assets: LiabilityRecord[]) => {
    assets.forEach(a => {
        console.log(`${a.id} - ${a.date} ${a.amount} ${a.currency} in ${a.category}`);
    });
}

liability.addCommand(cat);

export type LiabilityRecord = {
    category: string;
    amount: number;
    currency: Currency;
    date: string;
    id: number;
}