import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 3001;
const SALT_ROUNDS = 12;
// Пеппер из символов с кодами 190,191,192,193 (Latin-1): ¾, ¿, À, Á
const PEPPER = "\u00BE\u00BF\u00C0\u00C1";

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Разрешаем все localhost:* и отсутствие origin (например, curl)
    if (!origin) return callback(null, true);
    const localhostRegex = /^http:\/\/localhost:\d+$/;
    const allowed = localhostRegex.test(origin) || origin === (process.env.CORS_ORIGIN || 'http://localhost:3000');
    return allowed ? callback(null, true) : callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ===================== In-memory storage (dev only) =====================
// Users already defined below. Add formulas storage per user
type FormulaVariableDto = {
  key: string;
  name?: string;
  unit?: string;
};

type FormulaDto = {
  id: string;
  name: string;
  expression: string;
  variables?: FormulaVariableDto[];
  resultName?: string;
  resultUnit?: string;
  createdAt: string;
  updatedAt: string;
};

type CalculatorDto = {
  id: string;
  name: string;
  displayName: string;
  description: string;
  formulas: any[];
  createdAt: string;
  updatedAt: string;
};
const formulasByUser: Record<string, Record<string, FormulaDto>> = {};
const calculatorsByUser: Record<string, Record<string, CalculatorDto>> = {};

// Helper: extract userId from our simple dev token format
function extractUserIdFromToken(token?: string): string | null {
  if (!token) return null;
  // Supported formats: token-<userId>, refresh-<userId>, guest-token-<guestId>
  if (token.startsWith('token-') || token.startsWith('refresh-')) {
    return token.split('-')[1] || null;
  }
  if (token.startsWith('guest-token-')) {
    return token.replace('guest-token-', '') || null;
  }
  if (token.startsWith('guest-refresh-')) {
    return token.replace('guest-refresh-', '') || null;
  }
  return null;
}

function getAuthUserId(req: any): string | null {
  const auth = req.headers['authorization'] || '';
  const parts = String(auth).split(' ');
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
    return extractUserIdFromToken(parts[1]);
  }
  // Fallback to token in query for convenience during dev
  if (req.query && req.query.token) {
    return extractUserIdFromToken(String(req.query.token));
  }
  return null;
}

// Auth: guest login
app.post('/api/auth/guest', (req, res) => {
  const guestId = `guest_${Date.now()}`;
  const now = new Date();
  const user = {
    id: guestId,
    email: `${guestId}@guest.local`,
    name: 'Гость',
    isVerified: false,
    createdAt: now,
    lastLoginAt: now,
    preferences: {
      language: 'ru',
      theme: 'auto',
      units: 'metric',
      notifications: { email: false, push: false, sync: false },
    },
  };

  // Тестовые токены (в реальной версии будут JWT)
  const token = `guest-token-${guestId}`;
  const refreshToken = `guest-refresh-${guestId}`;

  res.json({ success: true, user, token, refreshToken });
});

// In-memory users (только для dev)
const users: Record<string, any> = {};

// Auth: register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password и name обязательны' });
  }
  const emailNormalized = String(email).trim().toLowerCase();
  if (!emailNormalized) {
    return res.status(400).json({ error: 'Некорректный email' });
  }
  // Политика сложности пароля: ≥8, заглавная, строчная, цифра, символ
  const hasUpper = /\p{Lu}/u.test(String(password));
  const hasLower = /\p{Ll}/u.test(String(password));
  const hasDigit = /\d/.test(String(password));
  const hasSymbol = /[^\p{L}\d]/u.test(String(password));
  const hasLen = String(password).length >= 8;
  const noSpace = !/\s/.test(String(password));
  if (!(hasUpper && hasLower && hasDigit && hasSymbol && hasLen && noSpace)) {
    return res.status(400).json({
      error: 'Пароль недостаточно сложный: минимум 8 символов, заглавная, строчная, цифра, символ, без пробелов',
    });
  }
  const exists = Object.values(users).find((u: any) => u.emailNormalized === emailNormalized);
  if (exists) {
    return res.status(409).json({ error: 'Пользователь уже существует' });
  }
  const id = `u_${Date.now()}`;
  const now = new Date();
  const user = {
    id,
    email: emailNormalized,
    emailNormalized,
    name,
    isVerified: false,
    createdAt: now,
    lastLoginAt: now,
    preferences: {
      language: 'ru',
      theme: 'auto',
      units: 'metric',
      notifications: { email: false, push: false, sync: false },
    },
  };
  try {
    const passwordHash = await bcrypt.hash(String(password) + PEPPER, SALT_ROUNDS);
    users[id] = { ...user, passwordHash };
    const token = `token-${id}`;
    const refreshToken = `refresh-${id}`;
    // Prepare per-user formulas store
    if (!formulasByUser[id]) {
      formulasByUser[id] = {};
    }
    return res.status(201).json({ success: true, user, token, refreshToken });
  } catch (e) {
    return res.status(500).json({ error: 'Ошибка хеширования пароля' });
  }
});

// Auth: login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email и password обязательны' });
  }
  const emailNormalized = String(email).trim().toLowerCase();
  const found = Object.values(users).find((u: any) => u.emailNormalized === emailNormalized) as any;
  if (!found || !found.passwordHash) {
    return res.status(401).json({ error: 'Неверные учетные данные' });
  }
  const ok = await bcrypt.compare(String(password) + PEPPER, found.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Неверные учетные данные' });
  }
  const { passwordHash: _ph, ...user } = found;
  user.lastLoginAt = new Date();
  const token = `token-${user.id}`;
  const refreshToken = `refresh-${user.id}`;
  // Ensure formulas store exists
  if (!formulasByUser[user.id]) {
    formulasByUser[user.id] = {};
  }
  return res.json({ success: true, user, token, refreshToken });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Simple API endpoints
app.get('/api/calculators', (req, res) => {
  res.json({
    calculators: [
      {
        id: '1',
        name: 'Базовый калькулятор',
        description: 'Простой калькулятор для базовых вычислений',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

app.post('/api/calculators', (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Название калькулятора обязательно' });
  }

  const calculator = {
    id: Date.now().toString(),
    name,
    description: description || '',
    createdAt: new Date().toISOString()
  };

  res.status(201).json(calculator);
});

// ===================== Formulas CRUD (per-user, in-memory) =====================
app.get('/api/formulas', (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: 'Требуется аутентификация' });
  const store = formulasByUser[userId] || {};
  res.json({ formulas: Object.values(store) });
});

app.post('/api/formulas', (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: 'Требуется аутентификация' });
  const { name, expression, variables, resultName, resultUnit } = req.body || {};
  if (!name || !expression) {
    return res.status(400).json({ error: 'name и expression обязательны' });
  }
  const now = new Date().toISOString();
  const id = `f_${Date.now()}_${Math.floor(Math.random()*1e6)}`;
  const formula: FormulaDto = {
    id,
    name: String(name),
    expression: String(expression),
    variables: Array.isArray(variables)
      ? variables
          .map((v: any) => ({
            key: String(v?.key || ''),
            name: v?.name ? String(v.name) : undefined,
            unit: v?.unit ? String(v.unit) : undefined,
          }))
          .filter(v => v.key)
      : undefined,
    resultName: resultName ? String(resultName) : undefined,
    resultUnit: resultUnit ? String(resultUnit) : undefined,
    createdAt: now,
    updatedAt: now,
  };
  if (!formulasByUser[userId]) formulasByUser[userId] = {};
  formulasByUser[userId][id] = formula;
  res.status(201).json({ success: true, formula });
});

app.put('/api/formulas/:id', (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: 'Требуется аутентификация' });
  const id = req.params.id;
  const store = formulasByUser[userId] || {};
  const existing = store[id];
  if (!existing) return res.status(404).json({ error: 'Формула не найдена' });
  const { name, expression, variables, resultName, resultUnit } = req.body || {};
  const updated: FormulaDto = {
    ...existing,
    name: name !== undefined ? String(name) : existing.name,
    expression: expression !== undefined ? String(expression) : existing.expression,
    variables: variables !== undefined
      ? (Array.isArray(variables)
          ? variables
              .map((v: any) => ({
                key: String(v?.key || ''),
                name: v?.name ? String(v.name) : undefined,
                unit: v?.unit ? String(v.unit) : undefined,
              }))
              .filter(v => v.key)
          : undefined)
      : existing.variables,
    resultName: resultName !== undefined ? (resultName ? String(resultName) : undefined) : existing.resultName,
    resultUnit: resultUnit !== undefined ? (resultUnit ? String(resultUnit) : undefined) : existing.resultUnit,
    updatedAt: new Date().toISOString(),
  };
  formulasByUser[userId][id] = updated;
  res.json({ success: true, formula: updated });
});

app.delete('/api/formulas/:id', (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: 'Требуется аутентификация' });
  const id = req.params.id;
  const store = formulasByUser[userId] || {};
  if (!store[id]) return res.status(404).json({ error: 'Формула не найдена' });
  delete formulasByUser[userId][id];
  res.json({ success: true });
});

// ===================== Calculator endpoints =====================
app.get('/api/calculators', (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: 'Требуется аутентификация' });
  const store = calculatorsByUser[userId] || {};
  const calculators = Object.values(store);
  res.json({ success: true, calculators });
});

app.post('/api/calculators', (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: 'Требуется аутентификация' });
  const { name, displayName, description, formulas } = req.body || {};
  const id = 'calc_' + Date.now().toString();
  const now = new Date().toISOString();
  const calculator: CalculatorDto = {
    id,
    name: String(name || 'Новый калькулятор'),
    displayName: String(displayName || name || 'Новый калькулятор'),
    description: String(description || ''),
    formulas: Array.isArray(formulas) ? formulas : [],
    createdAt: now,
    updatedAt: now,
  };
  if (!calculatorsByUser[userId]) calculatorsByUser[userId] = {};
  calculatorsByUser[userId][id] = calculator;
  res.json({ success: true, calculator });
});

app.put('/api/calculators/:id', (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: 'Требуется аутентификация' });
  const id = req.params.id;
  const store = calculatorsByUser[userId] || {};
  const existing = store[id];
  if (!existing) return res.status(404).json({ error: 'Калькулятор не найден' });
  const { name, displayName, description, formulas } = req.body || {};
  const updated: CalculatorDto = {
    ...existing,
    name: name !== undefined ? String(name) : existing.name,
    displayName: displayName !== undefined ? String(displayName) : existing.displayName,
    description: description !== undefined ? String(description) : existing.description,
    formulas: formulas !== undefined ? (Array.isArray(formulas) ? formulas : existing.formulas) : existing.formulas,
    updatedAt: new Date().toISOString(),
  };
  calculatorsByUser[userId][id] = updated;
  res.json({ success: true, calculator: updated });
});

app.delete('/api/calculators/:id', (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: 'Требуется аутентификация' });
  const id = req.params.id;
  const store = calculatorsByUser[userId] || {};
  if (!store[id]) return res.status(404).json({ error: 'Калькулятор не найден' });
  delete calculatorsByUser[userId][id];
  res.json({ success: true });
});

app.post('/api/calculations/execute', (req, res) => {
  const { expression, variables } = req.body;
  
  if (!expression) {
    return res.status(400).json({ error: 'Выражение обязательно' });
  }

  try {
    // Простое вычисление (в реальном приложении здесь будет FormulaEngine)
    let result = 0;
    
    if (expression === 'pi * r^2' && variables?.r) {
      result = Math.PI * Math.pow(variables.r, 2);
    } else if (expression === 'a + b' && variables?.a && variables?.b) {
      result = variables.a + variables.b;
    } else {
      // Простая арифметика
      const cleanExpression = expression.replace(/[^0-9+\-*/().]/g, '');
      result = eval(cleanExpression);
    }

    res.json({
      result,
      expression,
      variables,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({ 
      error: 'Ошибка вычисления',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Error handler
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Ошибка сервера:', error);
  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📱 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
  console.log(`🌍 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});

export default app;
