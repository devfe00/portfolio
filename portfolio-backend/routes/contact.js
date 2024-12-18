// routes/contact.js
const express = require('express');
const router = express.Router();

// Email validation function
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Rota POST para o envio de mensagem de contato
router.post('/', (req, res) => {
  try {
    const { nome, email, mensagem } = req.body;

    // Validação detalhada dos campos
    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      return res.status(400).json({ error: 'Nome inválido!' });
    }

    if (!email || typeof email !== 'string' || !validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido!' });
    }

    if (!mensagem || typeof mensagem !== 'string' || mensagem.trim() === '') {
      return res.status(400).json({ error: 'Mensagem inválida!' });
    }

    // Limitações adicionais de comprimento
    if (nome.length > 100) {
      return res.status(400).json({ error: 'Nome muito longo!' });
    }

    if (mensagem.length > 1000) {
      return res.status(400).json({ error: 'Mensagem muito longa!' });
    }

    // Aqui adicionar lógica para:
    // 1. Salvar no banco de dados
    // 2. Enviar email
    // 3. Fazer outras operações necessárias

    // Exemplo de log (substitua por seu sistema de log adequado)
    console.log(`Mensagem recebida de: ${nome} (${email})`);

    res.status(201).json({
      success: true,
      message: 'Mensagem recebida com sucesso!',
      data: { 
        nome: nome.trim(), 
        email: email.trim(), 
        mensagemLength: mensagem.length 
      }
    });
  } catch (error) {
    console.error('Erro no processamento do contato:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: process.env.NODE_ENV === 'development' ? error.message : '' 
    });
  }
});

module.exports = router;


