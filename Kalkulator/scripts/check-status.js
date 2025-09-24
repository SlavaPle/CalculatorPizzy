#!/usr/bin/env node

const http = require('http');

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

// Функция для проверки сервера
function checkServer(port, name) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          log(`✅ ${name} сервер работает на порту ${port}`, 'green');
          log(`   Статус: ${response.status}`, 'cyan');
          log(`   Время работы: ${Math.round(response.uptime)}с`, 'cyan');
          resolve(true);
        } catch (error) {
          log(`⚠️ ${name} сервер отвечает, но неожиданный формат ответа`, 'yellow');
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      log(`❌ ${name} сервер не отвечает на порту ${port}`, 'red');
      log(`   Ошибка: ${error.message}`, 'red');
      resolve(false);
    });

    req.setTimeout(5000, () => {
      log(`⏰ ${name} сервер не отвечает (таймаут 5с)`, 'yellow');
      req.destroy();
      resolve(false);
    });
  });
}

// Функция для проверки веб-приложения
function checkWebApp(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      if (res.statusCode === 200) {
        log(`✅ Web приложение работает на порту ${port}`, 'green');
        log(`   Статус: ${res.statusCode}`, 'cyan');
        resolve(true);
      } else {
        log(`⚠️ Web приложение отвечает, но статус ${res.statusCode}`, 'yellow');
        resolve(false);
      }
    });

    req.on('error', (error) => {
      log(`❌ Web приложение не отвечает на порту ${port}`, 'red');
      log(`   Ошибка: ${error.message}`, 'red');
      resolve(false);
    });

    req.setTimeout(5000, () => {
      log(`⏰ Web приложение не отвечает (таймаут 5с)`, 'yellow');
      req.destroy();
      resolve(false);
    });
  });
}

// Основная функция
async function main() {
  log('🔍 Проверка статуса сервисов Kalkulator', 'bright');
  log('========================================', 'bright');

  const results = await Promise.all([
    checkServer(3001, 'Backend API'),
    checkWebApp(3000)
  ]);

  const [backendOk, webOk] = results;

  log('', 'reset');
  if (backendOk && webOk) {
    log('🎉 Все сервисы работают!', 'green');
    log('', 'reset');
    log('📋 Доступные URL:', 'cyan');
    log('• Web App: http://localhost:3000', 'yellow');
    log('• API: http://localhost:3001', 'yellow');
    log('• Health Check: http://localhost:3001/api/health', 'yellow');
  } else {
    log('❌ Некоторые сервисы не работают', 'red');
    log('', 'reset');
    log('💡 Рекомендации:', 'cyan');
    if (!backendOk) {
      log('• Проверьте backend сервер: cd backend && npm run dev', 'yellow');
    }
    if (!webOk) {
      log('• Проверьте web приложение: cd web && npm run dev', 'yellow');
    }
  }
}

// Запуск
main();
