#!/usr/bin/env node
import { Command } from 'commander';
import { assets } from './assets/assets';
import { liability } from './liability/liability';
import { getConversions, updateConversions } from './utils/currency-handler';

const program = new Command();

program.addCommand(assets);
program.addCommand(liability);


program.parse(process.argv);