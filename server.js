const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const compression = require('compression');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const winston = require('winston');

require('dotenv').config({ path: '/Volumes/Programação/web development 1.1/.env' });
console.log('JWT_SECRET:', process.env.JWT_SECRET); // Isso deve imprimir o valor da chave JWT

// Configuração de Logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Configuração do aplicativo
const app = express();

// Middleware de Segurança Avançado
app.use(helmet()); // Adiciona vários headers de segurança
app.use(compression()); // Compressão de respostas

// Configuração de Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: 'Muitas requisições, por favor tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Configuração de CORS mais segura
const corsOptions = {
  origin: function (origin, callback) {
    const whiteList = [
      'http://localhost:3000', 
      'https://seu-dominio-frontend.com'
    ];
    
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Parsers
app.use(express.json({ limit: '10kb' })); // Limite de tamanho do payload
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Simulação de Repositório de Usuários (substituir por banco de dados real)
const users = [
  {
    id: 1,
    username: 'admin',
    passwordHash: '$2b$10$xEgR3ugEzi9qmiWybLtkQ.sDCzVbp0CRqeiNN4zAvrnV2bg8Uu40C' // Este hash foi gerado com a senha "123456"
  }
];

// Middleware de Autenticação Melhorado
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // 'Bearer <token>'

  if (!token) {
    logger.warn('Tentativa de acesso sem token');
    return res.status(401).json({ error: 'Acesso negado, token não fornecido!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    logger.error('Erro de autenticação de token', { error: err });
    return res.status(403).json({ error: 'Token inválido!' });
  }
};

// Rota de Login com Validações
app.post('/api/login', 
  body('username').isString().trim().notEmpty(),
  body('password').isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Verificando se o usuário existe
      const user = users.find(u => u.username === username);
      if (!user) {
        logger.warn(`Usuário não encontrado: ${username}`);
        return res.status(401).json({ error: 'Credenciais inválidas!' });
      }

      // Logando as senhas para diagnóstico
      console.log(`Senha fornecida: ${password}`);
      console.log(`Hash armazenado: ${user.passwordHash}`);

      // Comparando a senha fornecida com o hash armazenado
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      console.log(`Senha correta: ${isMatch}`);

      if (!isMatch) {
        logger.warn(`Senha incorreta para usuário: ${username}`);
        return res.status(401).json({ error: 'Credenciais inválidas!' });
      }

      // Gerando o token
      const token = jwt.sign(
        { id: user.id, username: user.username }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h', algorithm: 'HS256' }
      );

      logger.info(`Usuário logado: ${username}`);
      res.json({ token, userId: user.id });

    } catch (error) {
      logger.error('Erro no login', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Erro interno de autenticação', message: error.message });
    }
    
  }
);


// Rota Protegida de Exemplo
app.get('/api/secure-data', authenticateToken, (req, res) => {
  res.json({
    message: 'Dados seguros acessados com sucesso',
    user: {
      id: req.user.id,
      username: req.user.username
    }
  });
});

// Middleware de Tratamento de Erros Centralizado
app.use((err, req, res, next) => {
  logger.error('Erro não tratado', { 
    error: err,
    path: req.path,
    method: req.method
  });

  res.status(err.status || 500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : ''
  });
});

// Configuração do Servidor
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
  logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Tratamento de Encerramento Gracioso
process.on('SIGTERM', () => {
  logger.info('Sinal SIGTERM recebido, fechando servidor');
  server.close(() => {
    logger.info('Servidor HTTP fechado');
    process.exit(0);
  });
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Exceção não capturada', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Rejeição de promessa não tratada', { reason });
});

module.exports = server;
