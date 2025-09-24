#!/usr/bin/env node

const { spawn, exec } = require('child_process');
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

// Функция для выполнения команды
function runCommand(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    log(`🔧 Выполнение: ${command}`, 'blue');
    
    const child = spawn(command, { shell: true, cwd, stdio: 'inherit' });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

// Функция для проверки Node.js версии
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    log(`❌ Требуется Node.js 18 или выше. Текущая версия: ${nodeVersion}`, 'red');
    process.exit(1);
  }
  
  log(`✅ Node.js версия: ${nodeVersion}`, 'green');
}

// Функция для проверки npm версии
function checkNpmVersion() {
  return new Promise((resolve, reject) => {
    exec('npm --version', (error, stdout) => {
      if (error) {
        log('❌ npm не найден', 'red');
        reject(error);
        return;
      }
      
      const npmVersion = stdout.trim();
      log(`✅ npm версия: ${npmVersion}`, 'green');
      resolve();
    });
  });
}

// Функция для создания .env файлов
function createEnvFiles() {
  const envFiles = [
    {
      source: 'backend/env.example',
      target: 'backend/.env',
      name: 'Backend'
    }
  ];

  for (const envFile of envFiles) {
    if (fs.existsSync(envFile.source)) {
      if (!fs.existsSync(envFile.target)) {
        fs.copyFileSync(envFile.source, envFile.target);
        log(`✅ Создан ${envFile.name} .env файл`, 'green');
      } else {
        log(`⚠️ ${envFile.name} .env файл уже существует`, 'yellow');
      }
    } else {
      log(`⚠️ ${envFile.name} .env.example файл не найден`, 'yellow');
    }
  }
}

// Функция для установки зависимостей
async function installDependencies() {
  log('📦 Установка зависимостей...', 'blue');
  
  try {
    // Установка корневых зависимостей
    await runCommand('npm install');
    
    // Установка зависимостей для каждого проекта
    const projects = ['web', 'backend', 'shared'];
    
    for (const project of projects) {
      log(`📦 Установка зависимостей для ${project}...`, 'blue');
      await runCommand('npm install', path.join(process.cwd(), project));
    }
    
    log('✅ Все зависимости установлены', 'green');
  } catch (error) {
    log(`❌ Ошибка установки зависимостей: ${error.message}`, 'red');
    throw error;
  }
}

// Функция для настройки базы данных
async function setupDatabase() {
  log('🗄️ Настройка базы данных...', 'blue');
  
  try {
    // Генерация Prisma клиента
    await runCommand('npx prisma generate', path.join(process.cwd(), 'backend'));
    
    // Применение миграций
    await runCommand('npx prisma db push', path.join(process.cwd(), 'backend'));
    
    log('✅ База данных настроена', 'green');
  } catch (error) {
    log(`❌ Ошибка настройки базы данных: ${error.message}`, 'red');
    log('💡 Убедитесь, что PostgreSQL запущен и доступен', 'yellow');
    throw error;
  }
}

// Функция для создания директорий
function createDirectories() {
  const directories = [
    'logs',
    'uploads',
    'backend/uploads',
    'backend/logs'
  ];

  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`✅ Создана директория: ${dir}`, 'green');
    }
  }
}

// Функция для проверки Docker
function checkDocker() {
  return new Promise((resolve) => {
    exec('docker --version', (error) => {
      if (error) {
        log('⚠️ Docker не найден. Docker Compose будет недоступен', 'yellow');
      } else {
        log('✅ Docker найден', 'green');
      }
      resolve();
    });
  });
}

// Основная функция
async function main() {
  try {
    log('🚀 Настройка Kalkulator Development Environment', 'bright');
    log('==============================================', 'bright');

    // Проверка версий
    checkNodeVersion();
    await checkNpmVersion();
    await checkDocker();

    // Создание директорий
    createDirectories();

    // Создание .env файлов
    createEnvFiles();

    // Установка зависимостей
    await installDependencies();

    // Настройка базы данных
    await setupDatabase();

    log('', 'reset');
    log('🎉 Настройка завершена!', 'green');
    log('', 'reset');
    log('📋 Следующие шаги:', 'cyan');
    log('1. Настройте переменные окружения в backend/.env', 'yellow');
    log('2. Запустите PostgreSQL и Redis', 'yellow');
    log('3. Выполните: npm run dev', 'yellow');
    log('', 'reset');
    log('🔗 Полезные команды:', 'cyan');
    log('• npm run dev - запуск всех сервисов', 'yellow');
    log('• npm run dev:web - только web приложение', 'yellow');
    log('• npm run dev:backend - только backend сервер', 'yellow');
    log('• npm run docker:up - запуск через Docker', 'yellow');
    log('• npm run db:studio - Prisma Studio', 'yellow');

  } catch (error) {
    log(`❌ Ошибка настройки: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Запуск
main();
