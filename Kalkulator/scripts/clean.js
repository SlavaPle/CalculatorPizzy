#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

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

// Функция для удаления директории
function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      log(`✅ Удалена: ${dirPath}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Ошибка удаления ${dirPath}: ${error.message}`, 'red');
      return false;
    }
  } else {
    log(`⚠️ Не найдена: ${dirPath}`, 'yellow');
    return true;
  }
}

// Функция для удаления файла
function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      log(`✅ Удален: ${filePath}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Ошибка удаления ${filePath}: ${error.message}`, 'red');
      return false;
    }
  } else {
    log(`⚠️ Не найден: ${filePath}`, 'yellow');
    return true;
  }
}

// Функция для очистки проекта
function cleanProject(projectName, projectPath) {
  log(`🧹 Очистка ${projectName}...`, 'blue');
  
  const directoriesToRemove = [
    'node_modules',
    'dist',
    'build',
    '.next',
    'out',
    '.vite',
    '.turbo',
    'coverage',
    '.nyc_output',
    'logs',
    'uploads'
  ];

  const filesToRemove = [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '*.log',
    '*.pid',
    '*.seed',
    '*.pid.lock'
  ];

  let success = true;

  // Удаление директорий
  for (const dir of directoriesToRemove) {
    const fullPath = path.join(projectPath, dir);
    if (!removeDirectory(fullPath)) {
      success = false;
    }
  }

  // Удаление файлов
  for (const file of filesToRemove) {
    const fullPath = path.join(projectPath, file);
    if (!removeFile(fullPath)) {
      success = false;
    }
  }

  return success;
}

// Функция для очистки корневой директории
function cleanRoot() {
  log('🧹 Очистка корневой директории...', 'blue');
  
  const directoriesToRemove = [
    'node_modules',
    'dist',
    'build',
    'logs',
    'uploads',
    'temp'
  ];

  const filesToRemove = [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml'
  ];

  let success = true;

  // Удаление директорий
  for (const dir of directoriesToRemove) {
    if (!removeDirectory(dir)) {
      success = false;
    }
  }

  // Удаление файлов
  for (const file of filesToRemove) {
    if (!removeFile(file)) {
      success = false;
    }
  }

  return success;
}

// Функция для очистки Docker
function cleanDocker() {
  return new Promise((resolve) => {
    log('🐳 Очистка Docker...', 'blue');
    
    exec('docker system prune -f', (error, stdout, stderr) => {
      if (error) {
        log(`❌ Ошибка очистки Docker: ${error.message}`, 'red');
        resolve(false);
      } else {
        log('✅ Docker очищен', 'green');
        resolve(true);
      }
    });
  });
}

// Функция для очистки кэша npm
function cleanNpmCache() {
  return new Promise((resolve) => {
    log('📦 Очистка кэша npm...', 'blue');
    
    exec('npm cache clean --force', (error, stdout, stderr) => {
      if (error) {
        log(`❌ Ошибка очистки кэша npm: ${error.message}`, 'red');
        resolve(false);
      } else {
        log('✅ Кэш npm очищен', 'green');
        resolve(true);
      }
    });
  });
}

// Основная функция
async function main() {
  const args = process.argv.slice(2);
  const cleanAll = args.includes('--all') || args.includes('-a');
  const cleanDockerFlag = args.includes('--docker') || args.includes('-d');
  const cleanCache = args.includes('--cache') || args.includes('-c');

  log('🧹 Очистка Kalkulator проекта', 'bright');
  log('==============================', 'bright');

  let allSuccess = true;

  // Очистка корневой директории
  if (!cleanRoot()) {
    allSuccess = false;
  }

  // Очистка проектов
  const projects = [
    { name: 'Web', path: 'web' },
    { name: 'Backend', path: 'backend' },
    { name: 'Shared', path: 'shared' }
  ];

  for (const project of projects) {
    if (!cleanProject(project.name, project.path)) {
      allSuccess = false;
    }
  }

  // Очистка Docker (если запрошено)
  if (cleanDockerFlag || cleanAll) {
    if (!(await cleanDocker())) {
      allSuccess = false;
    }
  }

  // Очистка кэша npm (если запрошено)
  if (cleanCache || cleanAll) {
    if (!(await cleanNpmCache())) {
      allSuccess = false;
    }
  }

  log('', 'reset');
  if (allSuccess) {
    log('🎉 Очистка завершена!', 'green');
    log('', 'reset');
    log('📋 Следующие шаги:', 'cyan');
    log('• npm run install:all - установка зависимостей', 'yellow');
    log('• npm run setup - полная настройка', 'yellow');
  } else {
    log('❌ Некоторые операции очистки не выполнены', 'red');
  }
}

// Запуск
main();
