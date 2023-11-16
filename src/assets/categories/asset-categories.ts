import { Command } from "commander";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { appConfig } from "../../constants";
import { parse, unparse } from "papaparse";
import { Currency, currencies } from "../../types/currency";

const folder = appConfig.assetsFolder + '/assets';
const fileUrl = `${folder}/asset-categories.csv`;
export const cat = new Command('categories').alias('cat');

cat
    .command('list', { isDefault: true })
    .alias('ls')
    .action(() => {
        const categories = getCategories();
        _outputCategories(categories);
    });

cat
    .command('add <category> <currency>')
    .action((category: string, currency: Currency) => {
        if (!existsSync(fileUrl)) {
            mkdirSync(folder, { recursive: true });
        }

        if (!currencies.includes(currency)) { 
            console.log(`Currency ${currency} is not supported. Please use one of the following: ${currencies.join('|')}`);
            return;
        }

        const categories = getCategories();
        if (categories.some(c => c.category === category && c.currency === currency)) { 
            _outputCategories(categories);
            return;
        }

        categories.push({ category, currency });
        _saveCategories(categories);
        _outputCategories(categories);
    });

cat
    .command('remove [category]')
    .option('--all', 'Remove all categories')
    .alias('rm')
    .action((category: string, options: { all: boolean }) => {
        const categories = getCategories();

        if (options.all) {
            _saveCategories([]);
        } else {
            if (!category?.length) {
                console.log('Please provide a category to remove');
                return;
            }
            
            if (categories.some(x => x.category === category)) {
                const index = categories.findIndex(x => x.category === category);
                categories.splice(index, 1);
                _saveCategories(categories);
            }
        }
        _outputCategories(categories);
    });

export const getCategories = (): AssetCategory[] => {
    if (!existsSync(fileUrl)) return [];
    const content = readFileSync(fileUrl, 'utf-8');
    const categories = parse(content, { header: true }).data as AssetCategory[];
    return categories;
}

const _saveCategories = (categories: AssetCategory[]) => {
    const content = unparse(categories, { header: true });
    writeFileSync(fileUrl, content);
};

const _outputCategories = (categories: AssetCategory[]) => {
    categories.forEach(c => {
        console.log(`${c.category} - ${c.currency}`);
    });
}

export type AssetCategory = {
    category: string;
    currency: Currency;
}