# Namu — Aplicativo de Hábitos Saudáveis

## Sobre o projeto

O **Namu** é uma aplicação para gerenciamento e acompanhamento de hábitos saudáveis. O objetivo é permitir que o usuário cadastre seus hábitos, acompanhe sua frequência de realização e visualize seu progresso por meio de check-ins e sequências de dias consecutivos.

O projeto é composto por um aplicativo mobile e uma API responsável pelo gerenciamento e armazenamento dos dados.

## Funcionalidades implementadas

### Aplicativo mobile
- Listagem de hábitos cadastrados.
- Cadastro de novos hábitos.
- Edição de hábitos existentes.
- Exclusão de hábitos.
- Registro de check-ins diários.
- Visualização dos detalhes de cada hábito.
- Calendário mensal com indicação dos dias em que houve check-in.
- Exibição da sequência de dias consecutivos (streak).
- Integração com a API para persistência dos dados.

### Backend
- API REST desenvolvida com Node.js e Express.
- Cadastro, consulta, edição e exclusão de hábitos.
- Registro e consulta de check-ins.
- Dashboard com resumo dos hábitos e suas sequências.
- Validação de dados com Zod.
- Persistência dos dados em MySQL.
- Tratamento de erros e validação de identificadores.

## Tecnologias utilizadas

| Camada | Tecnologias |
|---|---|
| Mobile | React Native, TypeScript |
| Backend | Node.js, Express, TypeScript |
| Banco de dados | MySQL |
| ORM | Sequelize |
| Validação | Zod |
| Testes | Jest |

## Estrutura do projeto

```text
namu-habits/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── tests/
│   │   └── validators/
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/
│   └── Namu/
│       ├── android/
│       ├── ios/
│       ├── src/
│       │   └── services/
│       ├── App.tsx
│       └── package.json
│
├── .gitignore
└── README.md
```

## Como executar o projeto

### 1. Pré-requisitos

- Node.js
- npm
- MySQL
- Android Studio
- Emulador Android ou dispositivo compatível

### 2. Configuração do backend

Entre na pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente no arquivo `.env`, conforme a configuração do banco de dados local.

Crie o banco de dados MySQL utilizado pela aplicação.

Inicie o servidor:

```bash
npm run dev
```

O servidor será iniciado na porta `3333`.

### 3. Configuração do aplicativo mobile

Entre na pasta:

```bash
cd mobile/Namu
```

Instale as dependências:

```bash
npm install
```

Configure o ambiente Android e inicie o emulador.

Para executar o Metro:

```bash
npm start
```

Em outro terminal, execute o aplicativo Android:

```bash
npm run android
```

### 4. Comunicação entre mobile e backend

Para execução utilizando o emulador Android, a aplicação utiliza:

```text
http://10.0.2.2:3333
```

O endereço `10.0.2.2` permite que o emulador Android acesse o servidor executado na máquina host.

Para execução em dispositivo físico, o endereço da API deve ser ajustado para o IP da máquina na rede local.

## Endpoints da API

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/habits` | Lista os hábitos |
| POST | `/habits` | Cadastra um hábito |
| PUT | `/habits/:id` | Atualiza um hábito |
| DELETE | `/habits/:id` | Exclui um hábito |
| POST | `/habits/:habitId/checkins` | Registra um check-in |
| GET | `/habits/:habitId/checkins` | Consulta os check-ins |
| GET | `/habits/dashboard` | Consulta o dashboard |

## Testes e validações

Foram realizados testes e validações nas funcionalidades do backend e do aplicativo mobile.

**Backend**
- 3 suítes de testes aprovadas.
- 14 testes aprovados.
- Build TypeScript executado com sucesso.

**Mobile**
- Verificação de tipos TypeScript executada com sucesso.
- Testes manuais de cadastro, edição e exclusão de hábitos.
- Validação do registro e persistência de check-ins.
- Verificação do calendário mensal e das sequências de dias consecutivos.
- Integração com a API validada no emulador Android.

## Observações

- O arquivo `.env` contém configurações locais e não deve ser versionado.
- Dependências, arquivos de build e arquivos temporários são ignorados pelo Git.
- O endereço `10.0.2.2` é específico para comunicação com o computador host pelo emulador Android.
- O projeto utiliza MySQL como banco de dados.


## Demonstração
Vídeo demonstrativo do aplicativo Namu:

[Assistir ao vídeo de demonstração]( https://drive.google.com/file/d/1hQxFUkxnvIxMCkSt9SglaCNIxn0Hj-ru/view )
---
