#!/usr/bin/env node

/**
 * SuiCompass CLI - Main Entry Point
 */

import { Command } from 'commander';
import { stakeCommand } from './commands/stake';
import { portfolioCommand } from './commands/portfolio';

const program = new Command();

program
    .name('sui-compass')
    .description('SuiCompass CLI - AI-Powered DeFi Assistant for Sui')
    .version('1.0.0');

program
    .command('stake')
    .description('Stake SUI tokens with a validator')
    .requiredOption('-a, --amount <amount>', 'Amount of SUI to stake')
    .option('-v, --validator <address>', 'Validator address (auto-select if not provided)')
    .option('-k, --private-key <key>', 'Base64 encoded private key')
    .action(stakeCommand);

program
    .command('portfolio')
    .description('View wallet balance and staking positions')
    .option('-a, --address <address>', 'Wallet address to query')
    .option('-k, --private-key <key>', 'Base64 encoded private key')
    .action(portfolioCommand);

program.parse();
