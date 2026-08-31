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
app.use(express.urlencoded({ extended: true }));


// =====================================================
// FRONTEND
// =====================================================

app.use(
  express.static(
    path.join(__dirname, "../frontend")
  )
);


// =====================================================
// BANCO DE DADOS
// =====================================================

const DB_FILE = path.join(__dirname, "db.json");

function readDB() {

  try {

    if (!fs.existsSync(DB_FILE)) {

      console.error("ERRO: db.json não encontrado!");

      return {
        usuarios: [],
        pacientes: [],
        triagens: [],
        consultas: []
      };
    }

    const arquivo = fs.readFileSync(
      DB_FILE,
      "utf8"
    );

    return JSON.parse(arquivo);

  } catch (error) {

    console.error(
      "Erro ao ler db.json:",
      error
    );

    return {
      usuarios: [],
      pacientes: [],
      triagens: [],
      consultas: []
    };
  }
}


function writeDB(data) {

  try {

    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(data, null, 2),
      "utf8"
    );

    return true;

  } catch (error) {

    console.error(
      "Erro ao salvar banco:",
      error
    );

    return false;
  }
}


// =====================================================
// TESTE DA API
// =====================================================

app.get("/api", (req, res) => {

  res.json({
    sistema: "Sentinela",
    status: "online"
  });

});


// =====================================================
// LOGIN
// =====================================================

app.post("/login", (req, res) => {

  try {

    console.log("=================================");
    console.log("TENTATIVA DE LOGIN");
    console.log("Body recebido:", req.body);


    const db = readDB();


    // Pega os dados enviados pelo navegador
    const usuario = String(
      req.body?.usuario || ""
    ).trim();

    const senha = String(
      req.body?.senha || ""
    ).trim();


    console.log("Usuário:", usuario);
    console.log("Senha:", senha);
    console.log(
      "Usuários cadastrados:",
      db.usuarios?.length || 0
    );


    // Verifica preenchimento
    if (!usuario || !senha) {

      return res.status(400).json({

        sucesso: false,

        erro:
          "Informe a identificação e o código de acesso."

      });

    }


    // Procura o usuário
    const user = (db.usuarios || []).find(
      (u) => {

        const usuarioBanco =
          String(u.usuario || "").trim();

        const senhaBanco =
          String(u.senha || "").trim();


        return (
          usuarioBanco === usuario &&
          senhaBanco === senha
        );

      }
    );


    // Login inválido
    if (!user) {

      console.log(
        "LOGIN INVÁLIDO:",
        usuario
      );

      return res.status(401).json({

        sucesso: false,

        erro:
          "Identificação ou código de acesso inválido."

      });

    }


    // Login correto
    console.log(
      "LOGIN REALIZADO:",
      user.usuario,
      "| tipo:",
      user.tipo
    );


    return res.status(200).json({

      sucesso: true,

      usuario: user.usuario,

      tipo: user.tipo

    });


  } catch (error) {

    console.error(
      "ERRO NO LOGIN:",
      error
    );


    return res.status(500).json({

      sucesso: false,

      erro:
        "Erro interno no servidor."

    });

  }

});


// =====================================================
// ATENDIMENTO
// =====================================================

app.post("/atendimento", (req, res) => {

  try {

    const db = readDB();

    const paciente = {

      id: Date.now(),

      nome: req.body.nome || "",

      cpf: req.body.cpf || "",

      tipo: req.body.tipo || "Particular",

      status: "triagem",

      createdAt:
        new Date().toISOString()

    };


    db.pacientes.push(paciente);


    if (!writeDB(db)) {

      return res.status(500).json({

        erro:
          "Não foi possível salvar o paciente."

      });

    }


    res.status(201).json(paciente);


  } catch (error) {

    console.error(
      "Erro no atendimento:",
      error
    );

    res.status(500).json({

      erro:
        "Erro interno no servidor."

    });

  }

});


// =====================================================
// TRIAGEM
// =====================================================

app.post("/triagem", (req, res) => {

  try {

    const db = readDB();

    let risco = req.body.risco;

    const temperatura =
      Number(req.body.temperatura);


    if (temperatura >= 39) {

      risco = "vermelho";

    } else if (temperatura >= 38) {

      risco = "amarelo";

    } else if (!risco) {

      risco = "verde";

    }


    const triagem = {

      id: Date.now(),

      nome: req.body.nome || "",

      sintoma: req.body.sintoma || "",

      temperatura:
        req.body.temperatura || "",

      alergia:
        req.body.alergia || "",

      observacao:
        req.body.observacao || "",

      risco,

      status:
        "aguardando_medico",

      createdAt:
        new Date().toISOString()

    };


    db.triagens.push(triagem);


    if (!writeDB(db)) {

      return res.status(500).json({

        erro:
          "Não foi possível salvar a triagem."

      });

    }


    res.status(201).json(triagem);


  } catch (error) {

    console.error(
      "Erro na triagem:",
      error
    );

    res.status(500).json({

      erro:
        "Erro interno no servidor."

    });

  }

});


// =====================================================
// LISTAR TRIAGENS
// =====================================================

app.get("/triagens", (req, res) => {

  const db = readDB();

  res.json(db.triagens || []);

});


// =====================================================
// LISTA DE MEDICAÇÕES
// =====================================================

app.get("/lista-medicacoes", (req, res) => {

  res.json([

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

});


// =====================================================
// CONSULTA
// =====================================================

app.post("/consulta", (req, res) => {

  try {

    const db = readDB();

    const consulta = {

      id: Date.now(),

      paciente:
        req.body.paciente || "",

      diagnostico:
        req.body.diagnostico || "",

      medicacao:
        req.body.medicacao || "",

      obs:
        req.body.obs || "",

      createdAt:
        new Date().toISOString()

    };


    db.consultas.push(consulta);


    if (!writeDB(db)) {

      return res.status(500).json({

        erro:
          "Não foi possível salvar a consulta."

      });

    }


    res.status(201).json(consulta);


  } catch (error) {

    console.error(
      "Erro na consulta:",
      error
    );

    res.status(500).json({

      erro:
        "Erro interno no servidor."

    });

  }

});


// =====================================================
// MEDICAÇÕES / CONSULTAS
// =====================================================

app.get("/medicacoes", (req, res) => {

  const db = readDB();

  res.json(db.consultas || []);

});


// =====================================================
// ROTA NÃO ENCONTRADA
// =====================================================

app.use((req, res) => {

  res.status(404).json({

    erro: "Rota não encontrada",

    rota: req.originalUrl

  });

});


// =====================================================
// INICIALIZAÇÃO
// =====================================================

const PORT =
  process.env.PORT || 10000;


app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `Sentinela rodando na porta ${PORT}`
    );

  }
);
