#!/usr/bin/env node

import chalk from 'chalk';
import { program } from 'commander';
import * as dotenv from 'dotenv';
import ora from 'ora';
import { batchProcessingService } from '../services/batchProcessingService';
import { PipelineConfig, pipelineManager } from '../services/unifiedPipelineManager';

// Load environment variables
dotenv.config();

// CLI Configuration
program
  .name('process-tips')
  .description('Process BDBT tips with Grok API and generate outputs')
  .version('1.0.0');

// Main processing command
program
  .command('process')
  .description('Process tips with specified configuration')
  .option('-n, --number <number>', 'Number of tips to process', '100')
  .option('-g, --grok', 'Enable Grok API enhancement', false)
  .option('-p, --pdf', 'Generate PDF outputs', false)
  .option('-c, --canva', 'Generate Canva designs', false)
  .option('-w, --webpage', 'Generate web pages', false)
  .option('-a, --all', 'Generate all output formats', false)
  .option('-o, --output <path>', 'Output directory', './output')
  .option('--batch-size <number>', 'Batch processing size', '10')
  .action(async (options) => {
    const spinner = ora('Initializing pipeline...').start();
    
    try {
      // Build configuration
      const config: PipelineConfig = {
        source: 'database',
        limit: parseInt(options.number),
        useGrok: options.grok,
        outputs: {
          pdf: options.all || options.pdf ? {
            enabled: true,
            individual: true,
            catalogue: true,
            megaPDF: options.all
          } : undefined,
          canva: options.all || options.canva ? {
            enabled: true,
            templates: ['default'],
            autoExport: true
          } : undefined,
          webpage: options.all || options.webpage ? {
            enabled: true,
            individual: true,
            collection: true
          } : undefined
        },
        batchSize: parseInt(options.batchSize),
        outputDirectory: options.output,
        generateReport: true
      };

      // Validate configuration
      const validation = pipelineManager.validateConfig(config);
      if (!validation.valid) {
        spinner.fail('Invalid configuration');
        console.error(chalk.red('Errors:'));
        validation.errors.forEach(err => console.error(chalk.red(`  - ${err}`)));
        process.exit(1);
      }

      // Estimate processing
      spinner.text = 'Estimating processing requirements...';
      const estimate = await pipelineManager.estimatePipeline(config);
      
      spinner.info('Processing estimate:');
      console.log(chalk.cyan(`  - Time: ${(estimate.estimatedTime / 1000 / 60).toFixed(2)} minutes`));
      console.log(chalk.cyan(`  - Cost: $${estimate.estimatedCost.toFixed(4)}`));
      console.log(chalk.cyan(`  - Outputs: ${JSON.stringify(estimate.estimatedOutputs)}`));
      
      // Subscribe to progress updates
      const unsubscribe = batchProcessingService.subscribeToProgress((progress) => {
        spinner.text = `${progress.stage}: ${progress.current}/${progress.total} (${progress.percentage.toFixed(1)}%)`;
        if (progress.currentTip) {
          spinner.text += ` - ${progress.currentTip}`;
        }
      });

      // Execute pipeline
      spinner.start('Processing tips...');
      const result = await pipelineManager.executePipeline(config);
      unsubscribe();

      // Display results
      if (result.status === 'success') {
        spinner.succeed('Processing completed successfully!');
      } else if (result.status === 'partial') {
        spinner.warn('Processing completed with some errors');
      } else {
        spinner.fail('Processing failed');
      }

      console.log('\n' + chalk.bold('Summary:'));
      console.log(chalk.green(`  ✓ Processed: ${result.summary.processedTips}/${result.summary.totalTips} tips`));
      
      if (result.summary.enhancedTips > 0) {
        console.log(chalk.green(`  ✓ Enhanced: ${result.summary.enhancedTips} tips with Grok`));
      }
      
      if (result.summary.outputsGenerated.pdfs > 0) {
        console.log(chalk.green(`  ✓ PDFs: ${result.summary.outputsGenerated.pdfs} generated`));
      }
      
      if (result.summary.outputsGenerated.canvaDesigns > 0) {
        console.log(chalk.green(`  ✓ Canva: ${result.summary.outputsGenerated.canvaDesigns} designs created`));
      }
      
      if (result.summary.outputsGenerated.webpages > 0) {
        console.log(chalk.green(`  ✓ Web Pages: ${result.summary.outputsGenerated.webpages} generated`));
      }

      if (result.costs) {
        console.log('\n' + chalk.bold('API Usage:'));
        console.log(chalk.yellow(`  • Tokens: ${result.costs.grokTokens}`));
        console.log(chalk.yellow(`  • Cost: $${result.costs.estimatedCost.toFixed(4)}`));
      }

      if (result.errors.length > 0) {
        console.log('\n' + chalk.bold('Errors:'));
        result.errors.slice(0, 5).forEach(err => {
          console.log(chalk.red(`  ✗ ${err.tipTitle || 'General'}: ${err.error}`));
        });
        if (result.errors.length > 5) {
          console.log(chalk.red(`  ... and ${result.errors.length - 5} more errors`));
        }
      }

      console.log('\n' + chalk.bold('Output:'));
      console.log(chalk.blue(`  📁 ${config.outputDirectory}`));
      if (result.outputs.reportPath) {
        console.log(chalk.blue(`  📄 Report: ${result.outputs.reportPath}`));
      }

      // Timing
      console.log('\n' + chalk.bold('Performance:'));
      console.log(chalk.gray(`  ⏱  Total: ${(result.timing.totalDuration / 1000).toFixed(2)}s`));

    } catch (error) {
      spinner.fail('An error occurred');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Quick commands
program
  .command('quick-pdf')
  .description('Quick generate PDFs for 100 tips')
  .option('-n, --number <number>', 'Number of tips', '100')
  .action(async (options) => {
    const spinner = ora('Generating PDFs...').start();
    try {
      const result = await pipelineManager.quickGenerate('pdf-only', parseInt(options.number));
      spinner.succeed(`Generated ${result.summary.outputsGenerated.pdfs} PDFs`);
    } catch (error) {
      spinner.fail('PDF generation failed');
      console.error(chalk.red(error.message));
    }
  });

program
  .command('quick-all')
  .description('Generate all outputs for tips')
  .option('-n, --number <number>', 'Number of tips', '50')
  .action(async (options) => {
    const spinner = ora('Generating all outputs...').start();
    try {
      const result = await pipelineManager.quickGenerate('all', parseInt(options.number));
      spinner.succeed('All outputs generated successfully');
      console.log(chalk.green(`  ✓ PDFs: ${result.summary.outputsGenerated.pdfs}`));
      console.log(chalk.green(`  ✓ Canva: ${result.summary.outputsGenerated.canvaDesigns}`));
      console.log(chalk.green(`  ✓ Web: ${result.summary.outputsGenerated.webpages}`));
    } catch (error) {
      spinner.fail('Generation failed');
      console.error(chalk.red(error.message));
    }
  });

// Test command
program
  .command('test')
  .description('Test the pipeline with a small batch')
  .action(async () => {
    console.log(chalk.bold.cyan('Testing BDBT Tips Processing Pipeline...\n'));
    
    // Test configuration
    const testConfig: PipelineConfig = {
      source: 'database',
      limit: 5,
      useGrok: true,
      outputs: {
        pdf: {
          enabled: true,
          individual: true,
          catalogue: false,
          megaPDF: false
        },
        canva: {
          enabled: true,
          templates: ['default'],
          autoExport: false
        },
        webpage: {
          enabled: true,
          individual: true,
          collection: false
        }
      },
      batchSize: 2,
      outputDirectory: './output/test_' + Date.now(),
      generateReport: true
    };

    const spinner = ora('Running test pipeline...').start();
    
    try {
      const result = await pipelineManager.executePipeline(testConfig);
      
      if (result.status === 'success') {
        spinner.succeed('Test completed successfully!');
        console.log(chalk.green('\nAll systems operational ✓'));
      } else {
        spinner.warn('Test completed with issues');
        console.log(chalk.yellow('\nSome components may need attention'));
      }
      
      console.log('\nTest Results:');
      console.log(`  - Processed: ${result.summary.processedTips} tips`);
      console.log(`  - PDFs: ${result.summary.outputsGenerated.pdfs}`);
      console.log(`  - Canva: ${result.summary.outputsGenerated.canvaDesigns}`);
      console.log(`  - Web: ${result.summary.outputsGenerated.webpages}`);
      
    } catch (error) {
      spinner.fail('Test failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Interactive mode
program
  .command('interactive')
  .description('Interactive mode for processing tips')
  .action(async () => {
    console.log(chalk.bold.cyan('BDBT Tips Processing System - Interactive Mode\n'));
    console.log('This feature is coming soon!');
    console.log('For now, use the process command with options.');
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}