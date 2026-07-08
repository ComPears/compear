#!/usr/bin/env node
/**
 * Patches fork-ts-checker-webpack-plugin so config.logger.log/error are not required
 * (avoids "config.logger.log is not a function" with some webpack/react-scripts setups).
 */
const fs = require('fs');
const path = require('path');

const pluginRoot = path.join(__dirname, '..', 'node_modules', 'fork-ts-checker-webpack-plugin');
const doneFile = path.join(pluginRoot, 'lib', 'hooks', 'tap-done-to-async-get-issues.js');
const errorFile = path.join(pluginRoot, 'lib', 'hooks', 'tap-error-to-log-message.js');

function patchDone(content) {
  if (content.includes("const log = typeof config.logger.log === 'function'")) return content;
  const insert = `const log = typeof config.logger.log === 'function' ? config.logger.log.bind(config.logger) : (config.logger.info && config.logger.info.bind(config.logger)) || console.log;
    const err = typeof config.logger.error === 'function' ? config.logger.error.bind(config.logger) : console.error;
    `;
  content = content.replace(
    /(\s+const \{ debug \} = \(0, infrastructure_logger_1\.getInfrastructureLogger\)\(compiler\);)\s+(compiler\.hooks\.done\.tap)/,
    `$1\n    ${insert}$2`
  );
  return content
    .replace(/config\.logger\.log\(chalk_1\.default\.cyan\('Type-checking in progress\.\.\.'\)\)/, "log(chalk_1.default.cyan('Type-checking in progress...'))")
    .replace(/config\.logger\.error\(issues\.map\(\(issue\) => formatter\(issue\)\)\.join\('\\n'\)\)/, "err(issues.map((issue) => formatter(issue)).join('\\n'))")
    .replace(/config\.logger\.log\(\(0, stats_formatter_1\.statsFormatter\)\(issues, stats\)\)/, 'log((0, stats_formatter_1.statsFormatter)(issues, stats))')
    .replace(/config\.logger\.log\(chalk_1\.default\.green\('No errors found\.'\)\)/, "log(chalk_1.default.green('No errors found.'))");
}

function patchError(content) {
  if (content.includes("const err = typeof config.logger.error === 'function'")) return content;
  content = content.replace(
    /(function tapErrorToLogMessage\(compiler, config\) \{\s+const hooks = \(0, plugin_hooks_1\.getPluginHooks\)\(compiler\);)\s+(hooks\.error\.tap)/,
    `$1
    const err = typeof config.logger.error === 'function' ? config.logger.error.bind(config.logger) : console.error;
    $2`
  );
  return content
    .replace(/config\.logger\.error\(String\(error\)\)/g, 'err(String(error))')
    .replace(/config\.logger\.error\(chalk_1\.default\.red\('Issues checking service interrupted/, "err(chalk_1.default.red('Issues checking service interrupted")
    .replace(/config\.logger\.error\(chalk_1\.default\.red\('Issues checking service aborted/, "err(chalk_1.default.red('Issues checking service aborted");
}

let patched = 0;
if (fs.existsSync(doneFile)) {
  const content = fs.readFileSync(doneFile, 'utf8');
  const next = patchDone(content);
  if (next !== content) {
    fs.writeFileSync(doneFile, next);
    patched++;
  }
}
if (fs.existsSync(errorFile)) {
  const content = fs.readFileSync(errorFile, 'utf8');
  const next = patchError(content);
  if (next !== content) {
    fs.writeFileSync(errorFile, next);
    patched++;
  }
}
if (patched > 0) {
  console.log('patch-fork-ts-checker-logger: patched fork-ts-checker-webpack-plugin logger fallback');
}
