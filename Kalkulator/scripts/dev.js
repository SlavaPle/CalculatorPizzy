#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

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

// Функция для проверки существования файлов
function checkFiles() {
  const requiredFiles = [
    'web/package.json',
    'backend/package.json',
    'shared/package.json'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      log(`❌ Файл не найден: ${file}`, 'red');
      process.exit(1);
    }
  }
}

// Функция для установки зависимостей
function installDependencies() {
  return new Promise((resolve, reject) => {
    log('📦 Установка зависимостей...', 'blue');
    
    const install = spawn('npm', ['install'], { stdio: 'inherit' });
    
    install.on('close', (code) => {
      if (code === 0) {
        log('✅ Зависимости установлены', 'green');
        resolve();
      } else {
        log('❌ Ошибка установки зависимостей', 'red');
        reject(new Error('Installation failed'));
      }
    });
  });
}

// Функция для запуска backend
function startBackend() {
  return new Promise((resolve, reject) => {
    log('🚀 Запуск backend сервера...', 'blue');
    
    const backend = spawn('npm', ['run', 'dev'], {
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

    backend.on('close', (code) => {
      if (code !== 0) {
        log('❌ Backend сервер остановлен', 'red');
        reject(new Error('Backend failed'));
      }
    });

    // Ждем запуска backend
    setTimeout(() => {
      log('✅ Backend сервер запущен на http://localhost:3001', 'green');
      resolve(backend);
    }, 3000);
  });
}

// Функция для запуска web
function startWeb() {
  return new Promise((resolve, reject) => {
    log('🌐 Запуск web приложения...', 'blue');
    
    const web = spawn('npm', ['run', 'dev'], {
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

    web.on('close', (code) => {
      if (code !== 0) {
        log('❌ Web приложение остановлено', 'red');
        reject(new Error('Web failed'));
      }
    });

    // Ждем запуска web
    setTimeout(() => {
      log('✅ Web приложение запущено на http://localhost:3000', 'green');
      resolve(web);
    }, 5000);
  });
}

// Функция для настройки базы данных
function setupDatabase() {
  return new Promise((resolve, reject) => {
    log('🗄️ Настройка базы данных...', 'blue');
    
    const dbSetup = spawn('npm', ['run', 'db:push'], {
      cwd: path.join(__dirname, '..', 'backend'),
      stdio: 'pipe'
    });

    dbSetup.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        log(`[DB] ${message}`, 'yellow');
      }
    });

    dbSetup.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        log(`[DB ERROR] ${message}`, 'red');
      }
    });

    dbSetup.on('close', (code) => {
      if (code === 0) {
        log('✅ База данных настроена', 'green');
        resolve();
      } else {
        log('❌ Ошибка настройки базы данных', 'red');
        reject(new Error('Database setup failed'));
      }
    });
  });
}

// Основная функция
async function main() {
  try {
    log('🚀 Запуск Kalkulator Development Environment', 'bright');
    log('==========================================', 'bright');

    // Проверка файлов
    checkFiles();

    // Установка зависимостей
    await installDependencies();

    // Настройка базы данных
    await setupDatabase();

    // Запуск серверов
    const backend = await startBackend();
    const web = await startWeb();

    log('🎉 Все сервисы запущены!', 'green');
    log('📱 Web App: http://localhost:3000', 'cyan');
    log('🔧 API: http://localhost:3001', 'cyan');
    log('📊 Health Check: http://localhost:3001/api/health', 'cyan');
    log('', 'reset');
    log('Нажмите Ctrl+C для остановки', 'yellow');

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

  } catch (error) {
    log(`❌ Ошибка: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Запуск
main();
