#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
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

// Функция для проверки команды
function checkCommand(command) {
  return new Promise((resolve) => {
    exec(`which ${command}`, (error) => {
      if (error) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// Функция для проверки версии Node.js
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  log(`Node.js версия: ${nodeVersion}`, majorVersion >= 18 ? 'green' : 'red');
  
  if (majorVersion < 18) {
    log('❌ Требуется Node.js 18 или выше', 'red');
    return false;
  }
  
  return true;
}

// Функция для проверки npm
function checkNpm() {
  return new Promise((resolve) => {
    exec('npm --version', (error, stdout) => {
      if (error) {
        log('❌ npm не найден', 'red');
        resolve(false);
      } else {
        log(`✅ npm версия: ${stdout.trim()}`, 'green');
        resolve(true);
      }
    });
  });
}

// Функция для проверки Docker
function checkDocker() {
  return new Promise((resolve) => {
    exec('docker --version', (error, stdout) => {
      if (error) {
        log('⚠️ Docker не найден (опционально)', 'yellow');
        resolve(false);
      } else {
        log(`✅ Docker версия: ${stdout.trim()}`, 'green');
        resolve(true);
      }
    });
  });
}

// Функция для проверки Docker Compose
function checkDockerCompose() {
  return new Promise((resolve) => {
    exec('docker-compose --version', (error, stdout) => {
      if (error) {
        log('⚠️ Docker Compose не найден (опционально)', 'yellow');
        resolve(false);
      } else {
        log(`✅ Docker Compose версия: ${stdout.trim()}`, 'green');
        resolve(true);
      }
    });
  });
}

// Функция для проверки PostgreSQL
function checkPostgreSQL() {
  return new Promise((resolve) => {
    exec('psql --version', (error, stdout) => {
      if (error) {
        log('⚠️ PostgreSQL не найден (опционально)', 'yellow');
        resolve(false);
      } else {
        log(`✅ PostgreSQL версия: ${stdout.trim()}`, 'green');
        resolve(true);
      }
    });
  });
}

// Функция для проверки Redis
function checkRedis() {
  return new Promise((resolve) => {
    exec('redis-server --version', (error, stdout) => {
      if (error) {
        log('⚠️ Redis не найден (опционально)', 'yellow');
        resolve(false);
      } else {
        log(`✅ Redis версия: ${stdout.trim()}`, 'green');
        resolve(true);
      }
    });
  });
}

// Функция для проверки файлов проекта
function checkProjectFiles() {
  const requiredFiles = [
    'package.json',
    'web/package.json',
    'backend/package.json',
    'shared/package.json',
    'docker-compose.yml'
  ];

  let allFilesExist = true;

  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      log(`✅ ${file}`, 'green');
    } else {
      log(`❌ ${file}`, 'red');
      allFilesExist = false;
    }
  }

  return allFilesExist;
}

// Функция для проверки зависимостей
function checkDependencies() {
  const projects = ['web', 'backend', 'shared'];
  let allDepsInstalled = true;

  for (const project of projects) {
    const nodeModulesPath = path.join(project, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      log(`✅ ${project}/node_modules`, 'green');
    } else {
      log(`❌ ${project}/node_modules`, 'red');
      allDepsInstalled = false;
    }
  }

  return allDepsInstalled;
}

// Основная функция
async function main() {
  log('🔍 Проверка зависимостей Kalkulator', 'bright');
  log('====================================', 'bright');

  let allChecksPassed = true;

  // Проверка Node.js
  if (!checkNodeVersion()) {
    allChecksPassed = false;
  }

  // Проверка npm
  if (!(await checkNpm())) {
    allChecksPassed = false;
  }

  // Проверка Docker
  await checkDocker();

  // Проверка Docker Compose
  await checkDockerCompose();

  // Проверка PostgreSQL
  await checkPostgreSQL();

  // Проверка Redis
  await checkRedis();

  log('', 'reset');
  log('📁 Проверка файлов проекта:', 'cyan');
  if (!checkProjectFiles()) {
    allChecksPassed = false;
  }

  log('', 'reset');
  log('📦 Проверка зависимостей:', 'cyan');
  if (!checkDependencies()) {
    allChecksPassed = false;
  }

  log('', 'reset');
  if (allChecksPassed) {
    log('🎉 Все проверки пройдены!', 'green');
    log('', 'reset');
    log('📋 Следующие шаги:', 'cyan');
    log('1. npm run setup - полная настройка', 'yellow');
    log('2. npm run dev - запуск разработки', 'yellow');
  } else {
    log('❌ Некоторые проверки не пройдены', 'red');
    log('', 'reset');
    log('💡 Рекомендации:', 'cyan');
    log('• Установите Node.js 18+ с официального сайта', 'yellow');
    log('• Выполните npm run install:all', 'yellow');
    log('• Настройте PostgreSQL и Redis', 'yellow');
  }
}

// Запуск
main();
