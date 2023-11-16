import { appConfig, getNow } from './../constants';
import { Command } from "commander";
import { cat, getCategories } from "./categories/asset-categories";
import prompts, { PromptObject } from 'prompts';
import { Currency } from '../types/currency';
import { parse, unparse } from 'papaparse';
import { readFileSync, writeFileSync } from 'fs';

const folder = appConfig.assetsFolder + '/assets';
const fileUrl = `${folder}/assets.csv`;

export const assets = new Command('assets').alias('a');

assets
.command('add')
.action(async () => {
    const categories = getCategories();
    const questions: PromptObject[] = categories.map(c => {
        return {
            type: 'text',
            name: c.category,
            message: `How much ${c.currency} do you have in ${c.category}?`,
        }
    });
    const answers = await prompts(questions);
    const assets: AssetRecord[] = [];
    for (const key in answers) {
        const amountString: string = answers[key].replace(',', '');
        const amount = Number(amountString);

        if (isNaN(amount)) {
            console.log(`The amount for ${key} is not a number. input: ${amount}`);
            return;
        }
        
        const category = categories.find(c => c.category === key);
        if (category) {
            assets.push({ category: category.category, amount, currency: category.currency, date: getNow(), id: assets.length });
        }
    }
    _saveToFile(assets);
});

assets
.command('remove <id>')
.alias('rm')
.action(async (id: number) => {
    if (isNaN(id)) {
        console.log('Please provide a valid id');
        return;
    }

    const assets = _getAssets();
    const idx = assets.findIndex(x => x.id === id);
    if (idx === -1) {
        console.log('Please provide a valid id');
        return;
    }

    assets.splice(idx, 1);
    _saveToFile(assets);
});

assets
.command('list [date]', { isDefault: true })
.alias('ls')
.option('--all', 'List all assets')
.action((date: string, options: {all: boolean}) => {
    const assets = _getAssets();
    if (options.all) {
        _outputAssets(assets);
        return;
    }

    const filter = date ?? getNow();
    const filtered = assets.filter(x => x.date === filter);
    _outputAssets(filtered);
});

const _getAssets = (): AssetRecord[] => {
    const content = readFileSync(fileUrl, { encoding: 'utf-8' });
    const assets = parse<AssetRecord>(content, { header: true });
    return assets.data;
};

const _saveToFile = (categories: AssetRecord[]) => {
    const content = unparse(categories, { header: true });
    writeFileSync(fileUrl, content);
};

const _outputAssets = (assets: AssetRecord[]) => {
    assets.forEach(a => {
        console.log(`${a.id} - ${a.date} ${a.amount} ${a.currency} in ${a.category}`);
    });
}

assets.addCommand(cat);

export type AssetRecord = {
    category: string;
    amount: number;
    currency: Currency;
    date: string;
    id: number;
}