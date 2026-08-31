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

      console.error("❌ db.json não encontrado:", DB_FILE);

      return {
        usuarios: [],
        pacientes: [],
        triagens: [],
        consultas: [],
        tv_chamada: null,
        tv_historico: []
      };
    }


    const conteudo = fs.readFileSync(
      DB_FILE,
      "utf8"
    );


    const db = JSON.parse(conteudo);


    // Garante que os campos existam
    if (!Array.isArray(db.usuarios)) {
      db.usuarios = [];
    }

    if (!Array.isArray(db.pacientes)) {
      db.pacientes = [];
    }

    if (!Array.isArray(db.triagens)) {
      db.triagens = [];
    }

    if (!Array.isArray(db.consultas)) {
      db.consultas = [];
    }

    if (!Array.isArray(db.tv_historico)) {
      db.tv_historico = [];
    }

    if (!("tv_chamada" in db)) {
      db.tv_chamada = null;
    }


    return db;

  } catch (error) {

    console.error(
      "❌ Erro ao ler db.json:",
      error
    );


    return {
      usuarios: [],
      pacientes: [],
      triagens: [],
      consultas: [],
      tv_chamada: null,
      tv_historico: []
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
      "❌ Erro ao salvar db.json:",
      error
    );

    return false;
  }
}


// =====================================================
// PÁGINA INICIAL
// =====================================================

app.get("/", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "../frontend/index.html"
    )
  );

});


// =====================================================
// TESTE DO SERVIDOR
// =====================================================

app.get("/api", (req, res) => {

  res.json({
    sistema: "Sentinela",
    status: "online",
    servidor: "Render"
  });

});


// =====================================================
// LOGIN
// =====================================================

app.post("/login", (req, res) => {

  try {

    console.log("================================");
    console.log("🔐 TENTATIVA DE LOGIN");
    console.log("================================");


    const db = readDB();


    const usuarioRecebido =
      String(req.body?.usuario || "")
        .trim()
        .toLowerCase();


    const senhaRecebida =
      String(req.body?.senha || "")
        .trim();


    console.log(
      "Usuário recebido:",
      usuarioRecebido
    );

    console.log(
      "Quantidade de usuários:",
      db.usuarios.length
    );


    if (!usuarioRecebido || !senhaRecebida) {

      return res.status(400).json({

        sucesso: false,

        erro:
          "Digite a identificação e o código de acesso."

      });

    }


    const usuarioEncontrado =
      db.usuarios.find((usuario) => {

        const nomeBanco =
          String(usuario.usuario || "")
            .trim()
            .toLowerCase();


        const senhaBanco =
          String(usuario.senha || "")
            .trim();


        return (
          nomeBanco === usuarioRecebido &&
          senhaBanco === senhaRecebida
        );

      });


    if (!usuarioEncontrado) {

      console.log(
        "❌ LOGIN INVÁLIDO:",
        usuarioRecebido
      );


      return res.status(401).json({

        sucesso: false,

        erro:
          "Identificação ou código de acesso inválido."

      });

    }


    console.log(
      "✅ LOGIN REALIZADO:",
      usuarioEncontrado.usuario,
      "|",
      usuarioEncontrado.tipo
    );


    return res.status(200).json({

      sucesso: true,

      usuario:
        usuarioEncontrado.usuario,

      tipo:
        usuarioEncontrado.tipo

    });


  } catch (error) {

    console.error(
      "❌ ERRO NO LOGIN:",
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

      tipo:
        req.body.tipo || "Particular",

      status: "triagem",

      createdAt:
        new Date().toISOString()

    };


    db.pacientes.push(paciente);


    if (!writeDB(db)) {

      return res.status(500).json({

        erro:
          "Erro ao salvar paciente."

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
// LISTAR PACIENTES
// =====================================================

app.get("/pacientes", (req, res) => {

  const db = readDB();

  res.json(db.pacientes);

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

      nome:
        req.body.nome || "",

      sintoma:
        req.body.sintoma || "",

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
          "Erro ao salvar triagem."

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

  res.json(db.triagens);

});


// =====================================================
// TV - CHAMAR PACIENTE
// =====================================================

app.post("/tv/chamar", (req, res) => {

  try {

    const db = readDB();


    const chamada = {

      id:
        Date.now().toString(),

      localTipo:
        req.body.localTipo || "",

      localNumero:
        req.body.localNumero || "",

      paciente:
        req.body.paciente || "",

      hora:
        new Date().toLocaleTimeString(
          "pt-BR",
          {
            hour: "2-digit",
            minute: "2-digit"
          }
        )

    };


    db.tv_chamada = chamada;

    db.tv_historico.unshift(
      chamada
    );


    if (
      db.tv_historico.length > 5
    ) {

      db.tv_historico.pop();

    }


    if (!writeDB(db)) {

      return res.status(500).json({

        erro:
          "Erro ao salvar chamada."

      });

    }


    res.json(chamada);


  } catch (error) {

    console.error(
      "Erro na chamada da TV:",
      error
    );


    res.status(500).json({

      erro:
        "Erro interno no servidor."

    });

  }

});


// =====================================================
// TV - CONSULTAR CHAMADA
// =====================================================

app.get("/tv/chamada", (req, res) => {

  const db = readDB();


  res.json({

    chamada:
      db.tv_chamada,

    historico:
      db.tv_historico

  });

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


    db.consultas.push(
      consulta
    );


    if (!writeDB(db)) {

      return res.status(500).json({

        erro:
          "Erro ao salvar consulta."

      });

    }


    res.status(201).json(
      consulta
    );


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

  res.json(db.consultas);

});


// =====================================================
// ROTA NÃO ENCONTRADA
// =====================================================

app.use((req, res) => {

  res.status(404).json({

    erro:
      "Rota não encontrada",

    rota:
      req.originalUrl

  });

});


// =====================================================
// INICIAR SERVIDOR
// =====================================================

const PORT =
  process.env.PORT || 3000;


app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `🏥 Sentinela rodando na porta ${PORT}`
    );

    console.log(
      `📁 Banco: ${DB_FILE}`
    );

  }
);
