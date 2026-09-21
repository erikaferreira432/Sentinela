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

const FRONTEND_DIR =
path.join(__dirname, "../frontend");

// =====================================================
// FRONTEND
// =====================================================

app.use(
express.static(FRONTEND_DIR)
);

// =====================================================
// BANCO DE DADOS
// =====================================================

const DB_FILE =
path.join(__dirname, "db.json");

function bancoVazio() {

return {

```
usuarios: [],

pacientes: [],

triagens: [],

consultas: []
```

};

}

function readDB() {

try {

```
if (!fs.existsSync(DB_FILE)) {

  console.error(
    "ERRO: db.json não encontrado em:",
    DB_FILE
  );

  return bancoVazio();

}


const arquivo =
  fs.readFileSync(
    DB_FILE,
    "utf8"
  );


if (!arquivo.trim()) {

  console.error(
    "ERRO: db.json está vazio."
  );

  return bancoVazio();

}


const banco =
  JSON.parse(arquivo);


return {

  usuarios:
    Array.isArray(banco.usuarios)
      ? banco.usuarios
      : [],

  pacientes:
    Array.isArray(banco.pacientes)
      ? banco.pacientes
      : [],

  triagens:
    Array.isArray(banco.triagens)
      ? banco.triagens
      : [],

  consultas:
    Array.isArray(banco.consultas)
      ? banco.consultas
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


const db =
  readDB();


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


/*
 * Não registrar a senha no console.
 */


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
      usuarioRecebido

      &&

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


/*
 * Normaliza o tipo do usuário.
 */

const tipo =

  String(
    user.tipo || ""
  )
    .trim()
    .toLowerCase();


/*
 * Verifica se o usuário possui
 * um tipo válido.
 */

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

  usuario: user.usuario,

  tipo: tipo

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
const db =
  readDB();


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
const db =
  readDB();


const paciente = {

  id: Date.now(),

  nome:
    String(
      req.body?.nome || ""
    ).trim(),

  cpf:
    String(
      req.body?.cpf || ""
    ).trim(),

  tipo:
    String(
      req.body?.tipo ||
      "Particular"
    ).trim(),

  status:
    "triagem",

  createdAt:
    new Date().toISOString()

};


if (!paciente.nome) {

  return res.status(400).json({

    erro:
      "O nome do paciente é obrigatório."

  });

}


db.pacientes.push(
  paciente
);


if (!writeDB(db)) {

  return res.status(500).json({

    erro:
      "Não foi possível salvar o paciente."

  });

}


return res.status(201).json(
  paciente
);
```

} catch (error) {

```
console.error(
  "Erro no atendimento:",
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
// TRIAGEM
// =====================================================

app.post("/triagem", (req, res) => {

try {

```
const db =
  readDB();


let risco =
  req.body?.risco;


const temperatura =
  Number(
    req.body?.temperatura
  );


if (
  !Number.isNaN(temperatura)
  &&
  temperatura >= 39
) {

  risco =
    "vermelho";

}

else if (
  !Number.isNaN(temperatura)
  &&
  temperatura >= 38
) {

  risco =
    "amarelo";

}

else if (!risco) {

  risco =
    "verde";

}


const triagem = {

  id: Date.now(),

  nome:
    String(
      req.body?.nome || ""
    ).trim(),

  sintoma:
    String(
      req.body?.sintoma || ""
    ).trim(),

  temperatura:
    req.body?.temperatura || "",

  alergia:
    String(
      req.body?.alergia || ""
    ).trim(),

  observacao:
    String(
      req.body?.observacao || ""
    ).trim(),

  risco,

  status:
    "aguardando_medico",

  createdAt:
    new Date().toISOString()

};


if (!triagem.nome) {

  return res.status(400).json({

    erro:
      "O nome do paciente é obrigatório."

  });

}


db.triagens.push(
  triagem
);


if (!writeDB(db)) {

  return res.status(500).json({

    erro:
      "Não foi possível salvar a triagem."

  });

}


return res.status(201).json(
  triagem
);
```

} catch (error) {

```
console.error(
  "Erro na triagem:",
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
// LISTAR TRIAGENS
// =====================================================

app.get("/triagens", (req, res) => {

try {

```
const db =
  readDB();


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
const db =
  readDB();


const consulta = {

  id: Date.now(),

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


db.consultas.push(
  consulta
);


if (!writeDB(db)) {

  return res.status(500).json({

    erro:
      "Não foi possível salvar a consulta."

  });

}


return res.status(201).json(
  consulta
);
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
// MEDICAÇÕES / CONSULTAS
// =====================================================

app.get("/medicacoes", (req, res) => {

try {

```
const db =
  readDB();


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
// ERRO 404
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


if (res.headersSent) {

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
