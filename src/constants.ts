import { cwd } from "process";
import * as dotenv from 'dotenv';
import { DateTime } from "luxon";
dotenv.config();

export const appConfig = {
    assetsFolder: cwd() + '/' + process.env.ASSETS_FOLDER,
} as const;

export const getNow = () => DateTime.now().toFormat('yyyy-MM-dd');