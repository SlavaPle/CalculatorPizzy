#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Функция для логирования с цветами
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Функция для запуска production серверов
function startProduction() {
  log('🚀 Запуск Production серверов', 'bright');
  log('==============================', 'bright');

  // Запуск backend
  const backend = spawn('npm', ['start'], {
    cwd: path.join(__dirname, '..', 'backend'),
    stdio: 'pipe'
  });

  backend.stdout.on('data', (data) => {
    const message = data.toString().trim();
    if (message) {
      log(`[BACKEND] ${message}`, 'cyan');
    }
  });

  backend.stderr.on('data', (data) => {
    const message = data.toString().trim();
    if (message) {
      log(`[BACKEND ERROR] ${message}`, 'red');
    }
  });

  // Запуск web
  const web = spawn('npm', ['start'], {
    cwd: path.join(__dirname, '..', 'web'),
    stdio: 'pipe'
  });

  web.stdout.on('data', (data) => {
    const message = data.toString().trim();
    if (message) {
      log(`[WEB] ${message}`, 'magenta');
    }
  });

  web.stderr.on('data', (data) => {
    const message = data.toString().trim();
    if (message) {
      log(`[WEB ERROR] ${message}`, 'red');
    }
  });

  // Обработка сигналов завершения
  process.on('SIGINT', () => {
    log('\n🛑 Остановка серверов...', 'yellow');
    backend.kill();
    web.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    log('\n🛑 Остановка серверов...', 'yellow');
    backend.kill();
    web.kill();
    process.exit(0);
  });

  log('🎉 Production серверы запущены!', 'green');
  log('📱 Web App: http://localhost:3000', 'cyan');
  log('🔧 API: http://localhost:3001', 'cyan');
}

// Запуск
startProduction();
