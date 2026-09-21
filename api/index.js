const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

// =====================================================
// CONFIGURAÇÕES
// =====================================================

app.use(cors());

app.use(express.json());

app.use(
express.urlencoded({
extended: true
})
);

// =====================================================
// CAMINHO DO FRONTEND
// =====================================================

const FRONTEND_DIR = path.join(
__dirname,
"../frontend"
);

// =====================================================
// FRONTEND
// =====================================================

app.use(
express.static(FRONTEND_DIR)
);

// =====================================================
// BANCO DE DADOS
// =====================================================

const DB_FILE = path.join(
__dirname,
"db.json"
);

// Estrutura padrão do banco
function bancoVazio() {
return {
usuarios: [],
pacientes: [],
triagens: [],
consultas: [],
tv_chamada: null,
tv_historico: []
};
}

// =====================================================
// LER BANCO
// =====================================================

function readDB() {
try {
if (!fs.existsSync(DB_FILE)) {
console.error(
"ERRO: db.json não encontrado em:",
DB_FILE
);

```
  return bancoVazio();
}

const arquivo = fs.readFileSync(
  DB_FILE,
  "utf8"
);

if (!arquivo.trim()) {
  console.error(
    "ERRO: db.json está vazio."
  );

  return bancoVazio();
}

const banco = JSON.parse(arquivo);

return {
  usuarios: Array.isArray(banco.usuarios)
    ? banco.usuarios
    : [],

  pacientes: Array.isArray(banco.pacientes)
    ? banco.pacientes
    : [],

  triagens: Array.isArray(banco.triagens)
    ? banco.triagens
    : [],

  consultas: Array.isArray(banco.consultas)
    ? banco.consultas
    : [],

  tv_chamada:
    banco.tv_chamada &&
    typeof banco.tv_chamada === "object"
      ? banco.tv_chamada
      : null,

  tv_historico: Array.isArray(
    banco.tv_historico
  )
    ? banco.tv_historico
    : []
};
```

} catch (error) {

```
console.error(
  "Erro ao ler db.json:",
  error.message
);

return bancoVazio();
```

}
}

// =====================================================
// SALVAR BANCO
// =====================================================

function writeDB(data) {
try {

```
fs.writeFileSync(
  DB_FILE,
  JSON.stringify(
    data,
    null,
    2
  ),
  "utf8"
);

return true;
```

} catch (error) {

```
console.error(
  "Erro ao salvar banco:",
  error.message
);

return false;
```

}
}

// =====================================================
// PÁGINA INICIAL
// =====================================================

app.get("/", (req, res) => {

res.sendFile(
path.join(
FRONTEND_DIR,
"index.html"
)
);

});

// =====================================================
// TESTE DA API
// =====================================================

app.get("/api", (req, res) => {

res.status(200).json({

```
sistema: "Sentinela",

status: "online",

servidor: "Render",

timestamp:
  new Date().toISOString()
```

});

});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/health", (req, res) => {

res.status(200).json({

```
status: "ok",

sistema: "Sentinela",

timestamp:
  new Date().toISOString()
```

});

});

// =====================================================
// LOGIN
// =====================================================

app.post("/login", (req, res) => {

try {

```
console.log(
  "================================="
);

console.log(
  "LOGIN RECEBIDO"
);

const db = readDB();

const usuarioRecebido =
  String(
    req.body?.usuario || ""
  )
    .trim()
    .toLowerCase();

const senhaRecebida =
  String(
    req.body?.senha || ""
  )
    .trim();

console.log(
  "USUARIO:",
  usuarioRecebido
);

// Nunca registrar a senha no console.

if (
  !usuarioRecebido ||
  !senhaRecebida
) {

  return res.status(400).json({

    sucesso: false,

    erro:
      "Digite a identificação e o código de acesso."

  });

}

const usuarios =
  Array.isArray(db.usuarios)
    ? db.usuarios
    : [];

const user =
  usuarios.find((u) => {

    const usuarioBanco =
      String(
        u?.usuario || ""
      )
        .trim()
        .toLowerCase();

    const senhaBanco =
      String(
        u?.senha || ""
      )
        .trim();

    return (
      usuarioBanco ===
      usuarioRecebido &&
      senhaBanco ===
      senhaRecebida
    );

  });

if (!user) {

  console.log(
    "LOGIN NEGADO:",
    usuarioRecebido
  );

  return res.status(401).json({

    sucesso: false,

    erro:
      "Identificação ou código de acesso inválido."

  });

}

const tipo =
  String(
    user.tipo || ""
  )
    .trim()
    .toLowerCase();

const tiposPermitidos = [
  "triagem",
  "medico",
  "atendimento"
];

if (
  !tiposPermitidos.includes(tipo)
) {

  console.error(
    "Tipo de usuário inválido:",
    tipo
  );

  return res.status(403).json({

    sucesso: false,

    erro:
      "O usuário não possui um tipo de acesso válido."

  });

}

console.log(
  "LOGIN OK:",
  user.usuario,
  "| tipo:",
  tipo
);

return res.status(200).json({

  sucesso: true,

  usuario:
    user.usuario,

  tipo:
    tipo

});
```

} catch (error) {

```
console.error(
  "ERRO NO LOGIN:",
  error.message
);

return res.status(500).json({

  sucesso: false,

  erro:
    "Erro interno no servidor."

});
```

}

});

// =====================================================
// PACIENTES
// =====================================================

app.get("/pacientes", (req, res) => {

try {

```
const db = readDB();

return res.status(200).json(
  db.pacientes || []
);
```

} catch (error) {

```
console.error(
  "Erro ao listar pacientes:",
  error.message
);

return res.status(500).json({

  erro:
    "Não foi possível carregar os pacientes."

});
```

}

});

// =====================================================
// ATENDIMENTO
// =====================================================

app.post("/atendimento", (req, res) => {

try {

```
const db = readDB();

const paciente = {

  id:
    Date.now(),

  // =============================
  // DADOS PRINCIPAIS
  // =============================

  nome:
    String(
      req.body?.nome || ""
    ).trim(),

  cpf:
    String(
      req.body?.cpf || ""
    ).trim(),

  dataNascimento:
    String(
      req.body?.dataNascimento || ""
    ).trim(),

  sexo:
    String(
      req.body?.sexo || ""
    ).trim(),

  nomeMae:
    String(
      req.body?.nomeMae || ""
    ).trim(),

  estadoCivil:
    String(
      req.body?.estadoCivil || ""
    ).trim(),

  // =============================
  // CONTATO / ENDEREÇO
  // =============================

  endereco:
    String(
      req.body?.endereco || ""
    ).trim(),

  telefone:
    String(
      req.body?.telefone || ""
    ).trim(),

  email:
    String(
      req.body?.email || ""
    ).trim(),

  contatoEmergencia:
    String(
      req.body?.contatoEmergencia || ""
    ).trim(),

  // =============================
  // TIPO DE ATENDIMENTO
  // =============================

  tipo:
    String(
      req.body?.tipo ||
      "Particular"
    ).trim(),

  // =============================
  // STATUS
  // =============================

  status:
    "triagem",

  // =============================
  // DATA DO CADASTRO
  // =============================

  createdAt:
    new Date().toISOString()

};

// =============================
// VALIDAÇÃO
// =============================

if (!paciente.nome) {

  return res.status(400).json({

    sucesso: false,

    erro:
      "O nome do paciente é obrigatório."

  });

}

// =============================
// GARANTIR ARRAY DE PACIENTES
// =============================

if (
  !Array.isArray(
    db.pacientes
  )
) {

  db.pacientes = [];

}

// =============================
// SALVAR PACIENTE
// =============================

db.pacientes.push(
  paciente
);

// =============================
// SALVAR BANCO
// =============================

if (!writeDB(db)) {

  return res.status(500).json({

    sucesso: false,

    erro:
      "Não foi possível salvar o paciente."

  });

}

// =============================
// RESPOSTA
// =============================

return res.status(201).json({

  sucesso: true,

  mensagem:
    "Paciente cadastrado com sucesso.",

  paciente

});
```

} catch (error) {

```
console.error(
  "Erro no atendimento:",
  error.message
);

return res.status(500).json({

  sucesso: false,

  erro:
    "Erro interno no servidor."

});
```

}

});
// =====================================================
// TRIAGEM
// =====================================================

app.post("/triagem", (req, res) => {

try {

```
const db = readDB();

// ===================================================
// DADOS RECEBIDOS
// ===================================================

const pacienteId =
  req.body?.pacienteId;

const nome =
  String(
    req.body?.nome || ""
  ).trim();

const sintoma =
  String(
    req.body?.sintoma ||
    req.body?.sintomas ||
    ""
  ).trim();

const alergia =
  String(
    req.body?.alergia || ""
  ).trim();

const observacao =
  String(
    req.body?.observacao || ""
  ).trim();

// ===================================================
// TEMPERATURA
// ===================================================

const temperaturaRecebida =
  req.body?.temperatura ??
  req.body?.temp ??
  "";

const temperatura =
  temperaturaRecebida === "" ||
  temperaturaRecebida === null ||
  temperaturaRecebida === undefined
    ? null
    : Number(
        temperaturaRecebida
      );

// ===================================================
// VALIDAÇÕES
// ===================================================

if (!nome) {

  return res.status(400).json({

    sucesso: false,

    erro:
      "O nome do paciente é obrigatório."

  });

}

if (!sintoma) {

  return res.status(400).json({

    sucesso: false,

    erro:
      "O sintoma principal é obrigatório."

  });

}

if (
  temperatura !== null &&
  (
    Number.isNaN(
      temperatura
    ) ||
    temperatura < 30 ||
    temperatura > 45
  )
) {

  return res.status(400).json({

    sucesso: false,

    erro:
      "A temperatura informada é inválida."

  });

}

// ===================================================
// CLASSIFICAÇÃO DE RISCO
// ===================================================

let risco =
  String(
    req.body?.risco || ""
  )
    .trim()
    .toLowerCase();

const vermelhos = [

  "infarto",

  "avc",

  "convulsao",

  "hemorragia",

  "falta_ar_grave"

];

const amarelos = [

  "febre",

  "vomito",

  "diarreia",

  "falta_ar_moderada"

];

// Temperatura crítica
if (
  temperatura !== null &&
  temperatura >= 39
) {

  risco =
    "vermelho";

}

// Sintomas de maior prioridade
else if (
  vermelhos.includes(
    sintoma
  )
) {

  risco =
    "vermelho";

}

// Temperatura elevada
else if (
  temperatura !== null &&
  temperatura >= 38
) {

  risco =
    "amarelo";

}

// Sintomas de atenção
else if (
  amarelos.includes(
    sintoma
  )
) {

  risco =
    "amarelo";

}

// Caso não tenha classificação
else {

  risco =
    "verde";

}

// Segurança adicional
const riscosPermitidos = [

  "verde",

  "amarelo",

  "vermelho"

];

if (
  !riscosPermitidos.includes(
    risco
  )
) {

  risco =
    "verde";

}

// ===================================================
// LOCALIZAR PACIENTE
// ===================================================

let paciente = null;

if (
  Array.isArray(
    db.pacientes
  )
) {

  if (
    pacienteId !==
    undefined &&
    pacienteId !== null &&
    pacienteId !== ""
  ) {

    paciente =
      db.pacientes.find(
        (p) =>
          String(p.id) ===
          String(pacienteId)
      );

  }

  // Compatibilidade:
  // caso o frontend antigo não envie pacienteId
  if (!paciente) {

    paciente =
      db.pacientes.find(
        (p) =>
          String(
            p.nome || ""
          )
            .trim()
            .toLowerCase() ===
          nome
            .trim()
            .toLowerCase()
      );

  }

}

// ===================================================
// VALIDAR PACIENTE
// ===================================================

if (!paciente) {

  return res.status(404).json({

    sucesso: false,

    erro:
      "Paciente não encontrado. Selecione um paciente da fila."

  });

}

// ===================================================
// ATUALIZAR STATUS DO PACIENTE
// ===================================================

paciente.status =
  "aguardando_medico";

paciente.triagemId =
  Date.now();

paciente.updatedAt =
  new Date().toISOString();

// ===================================================
// CRIAR TRIAGEM
// ===================================================

const triagem = {

  id:
    paciente.triagemId,

  pacienteId:
    paciente.id,

  nome:
    paciente.nome ||
    nome,

  sintoma:
    sintoma,

  temperatura:
    temperatura,

  alergia:
    alergia,

  observacao:
    observacao,

  risco:
    risco,

  status:
    "aguardando_medico",

  createdAt:
    new Date().toISOString()

};

// ===================================================
// GARANTIR ARRAY
// ===================================================

if (
  !Array.isArray(
    db.triagens
  )
) {

  db.triagens = [];

}

// ===================================================
// SALVAR TRIAGEM
// ===================================================

db.triagens.push(
  triagem
);

// ===================================================
// SALVAR BANCO
// ===================================================

if (
  !writeDB(db)
) {

  return res.status(500).json({

    sucesso: false,

    erro:
      "Não foi possível salvar a triagem."

  });

}

// ===================================================
// RESPOSTA
// ===================================================

return res.status(201).json({

  sucesso: true,

  mensagem:
    "Triagem salva e paciente encaminhado ao médico.",

  paciente:
    paciente,

  triagem:
    triagem

});
```

} catch (error) {

```
console.error(
  "Erro na triagem:",
  error.message
);

return res.status(500).json({

  sucesso: false,

  erro:
    "Erro interno no servidor."

});
```

}

});


// =====================================================
// LISTAR TRIAGENS
// =====================================================

app.get("/triagens", (req, res) => {

try {

```
const db = readDB();

return res.status(200).json(
  db.triagens || []
);
```

} catch (error) {

```
console.error(
  "Erro ao listar triagens:",
  error.message
);

return res.status(500).json({

  erro:
    "Não foi possível carregar as triagens."

});
```

}

});

// =====================================================
// LISTA DE MEDICAÇÕES
// =====================================================

app.get(
"/lista-medicacoes",
(req, res) => {

```
res.status(200).json([

  "Dipirona",

  "Paracetamol",

  "Ibuprofeno",

  "Amoxicilina",

  "Azitromicina",

  "Loratadina",

  "Omeprazol",

  "Buscopan",

  "Dramin",

  "Soro fisiológico"

]);
```

}
);

// =====================================================
// CONSULTA
// =====================================================

app.post("/consulta", (req, res) => {

try {

```
const db = readDB();

const consulta = {

  id:
    Date.now(),

  paciente:
    String(
      req.body?.paciente || ""
    ).trim(),

  diagnostico:
    String(
      req.body?.diagnostico || ""
    ).trim(),

  medicacao:
    String(
      req.body?.medicacao || ""
    ).trim(),

  obs:
    String(
      req.body?.obs || ""
    ).trim(),

  createdAt:
    new Date().toISOString()

};

if (!consulta.paciente) {

  return res.status(400).json({

    erro:
      "O paciente é obrigatório."

  });

}

if (
  !Array.isArray(db.consultas)
) {

  db.consultas = [];

}

db.consultas.push(
  consulta
);

if (!writeDB(db)) {

  return res.status(500).json({

    erro:
      "Não foi possível salvar a consulta."

  });

}

return res.status(201).json({

  sucesso: true,

  consulta

});
```

} catch (error) {

```
console.error(
  "Erro na consulta:",
  error.message
);

return res.status(500).json({

  erro:
    "Erro interno no servidor."

});
```

}

});

// =====================================================
// LISTAR CONSULTAS
// =====================================================

app.get("/medicacoes", (req, res) => {

try {

```
const db = readDB();

return res.status(200).json(
  db.consultas || []
);
```

} catch (error) {

```
console.error(
  "Erro ao listar consultas:",
  error.message
);

return res.status(500).json({

  erro:
    "Não foi possível carregar as consultas."

});
```

}

});

// =====================================================
// TV - CHAMAR PACIENTE
// =====================================================

app.post("/tv/chamar", (req, res) => {

try {

```
const db = readDB();

const paciente =
  String(
    req.body?.paciente || ""
  ).trim();

const localTipo =
  String(
    req.body?.localTipo ||
    "CONSULTÓRIO"
  ).trim();

const localNumero =
  String(
    req.body?.localNumero ||
    "01"
  ).trim();

if (!paciente) {

  return res.status(400).json({

    erro:
      "O nome do paciente é obrigatório."

  });

}

const chamada = {

  id:
    Date.now(),

  localTipo:
    localTipo.toUpperCase(),

  localNumero:
    localNumero,

  paciente:
    paciente,

  hora:
    new Date().toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    ),

  createdAt:
    new Date().toISOString()

};

db.tv_chamada =
  chamada;

if (
  !Array.isArray(
    db.tv_historico
  )
) {

  db.tv_historico = [];

}

db.tv_historico.unshift(
  chamada
);

// Mantém somente as últimas 100 chamadas
if (
  db.tv_historico.length > 100
) {

  db.tv_historico =
    db.tv_historico.slice(
      0,
      100
    );

}

if (!writeDB(db)) {

  return res.status(500).json({

    erro:
      "Não foi possível registrar a chamada."

  });

}

return res.status(201).json({

  sucesso: true,

  chamada

});
```

} catch (error) {

```
console.error(
  "Erro ao chamar paciente na TV:",
  error.message
);

return res.status(500).json({

  erro:
    "Erro interno ao realizar a chamada."

});
```

}

});

// =====================================================
// TV - CHAMADA ATUAL
// =====================================================

app.get("/tv/atual", (req, res) => {

try {

```
const db = readDB();

return res.status(200).json({

  sucesso: true,

  chamada:
    db.tv_chamada || null

});
```

} catch (error) {

```
console.error(
  "Erro ao carregar chamada atual:",
  error.message
);

return res.status(500).json({

  erro:
    "Não foi possível carregar a chamada atual."

});
```

}

});

// =====================================================
// TV - HISTÓRICO
// =====================================================

app.get("/tv/historico", (req, res) => {

try {

```
const db = readDB();

return res.status(200).json({

  sucesso: true,

  historico:
    db.tv_historico || []

});
```

} catch (error) {

```
console.error(
  "Erro ao carregar histórico da TV:",
  error.message
);

return res.status(500).json({

  erro:
    "Não foi possível carregar o histórico."

});
```

}

});

// =====================================================
// TV - LIMPAR CHAMADA ATUAL
// =====================================================

app.post("/tv/limpar", (req, res) => {

try {

```
const db = readDB();

db.tv_chamada = null;

if (!writeDB(db)) {

  return res.status(500).json({

    erro:
      "Não foi possível limpar a chamada."

  });

}

return res.status(200).json({

  sucesso: true,

  mensagem:
    "Chamada atual removida."

});
```

} catch (error) {

```
console.error(
  "Erro ao limpar chamada:",
  error.message
);

return res.status(500).json({

  erro:
    "Erro interno ao limpar chamada."

});
```

}

});

// =====================================================
// 404
// =====================================================

app.use((req, res) => {

res.status(404).json({

```
erro:
  "Rota não encontrada",

rota:
  req.originalUrl
```

});

});

// =====================================================
// TRATAMENTO DE ERROS
// =====================================================

app.use(
(
error,
req,
res,
next
) => {

```
console.error(
  "ERRO NÃO TRATADO:",
  error
);

if (
  res.headersSent
) {

  return next(error);

}

res.status(500).json({

  erro:
    "Erro interno no servidor."

});
```

}
);

// =====================================================
// INICIALIZAÇÃO
// =====================================================

const PORT =
process.env.PORT || 10000;

app.listen(

PORT,

"0.0.0.0",

() => {

```
console.log(
  "================================="
);

console.log(
  "SENTINELA INICIADO"
);

console.log(
  `Porta: ${PORT}`
);

console.log(
  `Frontend: ${FRONTEND_DIR}`
);

console.log(
  `Banco: ${DB_FILE}`
);

console.log(
  "================================="
);
```

}

);
