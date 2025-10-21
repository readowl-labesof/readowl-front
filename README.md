# 🦉 Readowl

Uma plataforma web para publicação e leitura de livros, com foco em promover a literatura amadora no Brasil e conectar leitores a escritores iniciantes.
Desenvolvida com **Next.js**, **TypeScript** e **Tailwind CSS**.

-----

## 📋 Sobre o Projeto

O **Readowl** foi criado para oferecer um espaço acolhedor a novos escritores e fortalecer a cultura literária no Brasil.
A plataforma busca resolver problemas comuns encontrados em outros sistemas, como divulgação ineficiente e interfaces confusas, oferecendo um ambiente confiável para que autores publiquem suas obras gratuitamente e recebam feedback.

### 👥 Equipe do Projeto

| Nome | Função |
|---|---|
| Luiz Alberto Cury Andalécio | Desenvolvedor |
| Alexandre Monteiro Londe | Desenvolvedor |
| Gabriel Lucas Silva Seabra | Desenvolvedor |
| Jussie Lopes da Silva | Desenvolvedor |
| Vitor Gabriel Resende Lopes Oliveira | Desenvolvedor |


### 🎯 Principais Funcionalidades

- Cadastro e login de usuários com autenticação segura e recuperação de senha.
- Criar, ver, editar e excluir livros, volumes e capítulos.
- Sistema de busca avançada com filtros por gênero, popularidade e data.
- Biblioteca pessoal para favoritar obras e receber notificações.
- Interação por meio de avaliações, curtidas e comentários em livros e capítulos.
- Contagem de visualizações por capítulo com soma total por livro, com proteção contra bots e deduplicação (janela de 2 minutos). Requer usuário autenticado.
- Painel administrativo para gestão de usuários e moderação de conteúdo.

### 🛠️ Tecnologias Utilizadas

#### Frontend
- **Next.js**: Framework React para renderização no servidor (SSR), roteamento e rotas de API.
- **Next Router**: Roteamento nativo para navegação (Home, Livro, Perfil etc.).
- **Tailwind CSS**: Estilização rápida e responsiva seguindo a identidade visual.
- **TanStack Query**: Comunicação com backend, cache e atualização de dados.
- **React Hook Form**: Todos os formulários (login, cadastro, publicação).
- **TipTap**: Editor de texto rico para autores escreverem capítulos.

#### Backend

- **Node.js (Rotas de API do Next.js)**: Lógica de servidor e endpoints.
- **TypeScript**: Segurança de tipos e redução de bugs.
- **Prisma**: ORM para integração com PostgreSQL.
- **Zod**: Validação de dados unificada no frontend e no backend.
- **JWT + Bcrypt.js**: Autenticação segura e hash de senhas.
- **Gerenciamento de Sessão**: Suporte a "Lembrar de mim" com JWT e NextAuth, oferecendo sessões padrão de 8 horas ou 30 dias quando habilitado. O TTL da sessão é aplicado via middleware usando flags do token (`remember`, `stepUpAt`).
- **Upload de Arquivos**: Multer e Cloudinary para armazenar capas de livros e imagens de perfil.
- **Serviço de Email**: Nodemailer para recuperação de senha, com templates HTML e fallback em texto simples. O fluxo de redefinição usa tokens SHA-256 de uso único (expiração de 30 minutos) e invalidação de sessão via `credentialVersion`.
- **Segurança**: Cooldown por usuário (120s) e rate limiting por IP (5 requisições/15min) em pedidos de recuperação de senha.
- **Configuração de SMTP**: Defina `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` e `MAIL_FROM` no `.env`. Em desenvolvimento, se o SMTP não estiver configurado, os emails são logados no console.
- **Redis (Opcional)**: Para rate limiting distribuído, configure `REDIS_URL` ou variáveis do Upstash; por padrão usa memória local se não definido.
- **Output File Tracing Root (Monorepo)**: Para evitar warnings de root em workspaces com múltiplos lockfiles, definimos `outputFileTracingRoot` no `next.config.ts` apontando para a raiz do workspace.
- **Métricas de Visualizações (Views)**: Registro de visualizações por capítulo e total por livro com:
        - Deduplicação por janela de 2 minutos por usuário autenticado.
        - Exclusão de visualizações do próprio autor do livro.
        - Filtro simples de bots com base no `User-Agent`.
        - Rate limit leve e dedupe preferencial via Redis (SET NX PX) com fallback em memória local quando Redis não está configurado.
        - Sem suporte a usuários anônimos: nenhuma lógica de IP é usada/armazenada.
- **Melhorias de UX**: Página de sucesso após redefinição de senha e mensagens de feedback aprimoradas.
- **Força da Senha**: `PasswordStrengthBar` usa heurística local e opcionalmente carrega `zxcvbn` para feedback avançado.
- **Variáveis de Ambiente**: Consulte `.env.example` para as configurações necessárias.

#### Banco de Dados
- **PostgreSQL**: Armazenamento de dados.
        - Nova tabela: `ChapterView` para registrar visualizações de capítulos, com campos: `id`, `chapterId`, `userId`, `createdAt`. Índices para consultas por `chapterId` e por intervalo de tempo.

#### Ambiente
- **Docker**: Containerização para desenvolvimento e deploy.
- **Git**: Controle de versão.
- **VS Code**: Editor recomendado.

**Extensões VS Code:** Prisma, ESLint, Prettier - Code formatter, Tailwind CSS IntelliSense, EchoAPI

-----

## 🚀 Começando (do zero)

Este guia leva você do zero até rodar a aplicação localmente com um PostgreSQL via Docker dedicado a este projeto Next.js. Se você já usa o pgAdmin do projeto React (container: `readowl_pgadmin`), continue usando; não subiremos um segundo pgAdmin aqui. Também cobre login com Google OAuth e SMTP para recuperação de senha.

### 1) Pré-requisitos

- Node.js 18+ e pnpm ou npm
- Docker Desktop ou Docker Engine
- Uma instância PostgreSQL (local/nativa ou em Docker). Se já tiver uma, você pode reutilizá-la.
- Opcional: Projeto no Google Cloud para OAuth2 (fornecemos credenciais de exemplo para dev local)

### 2) Clonar e instalar dependências

```bash
git clone <sua-url-do-repo>
cd readowl-next
npm install
```

### 3) Variáveis de ambiente

Copie `.env.example` para `.env` e preencha os valores. Para desenvolvimento local, um exemplo:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/readowl-next_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<um-segredo-aleatório-forte>"

# Google OAuth
GOOGLE_CLIENT_ID="<google-client-id>"
GOOGLE_CLIENT_SECRET="<google-client-secret>"

# SMTP (Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="<seu-gmail>@gmail.com"
SMTP_PASS="<app-password>"
MAIL_FROM="Readowl <no-reply@readowl.dev>"

# Redis (opcional para rate limit/dedupe distribuído)
# Exemplo Redis local
# REDIS_URL="redis://localhost:6379"
# Exemplo Upstash (HTTP)
# UPSTASH_REDIS_REST_URL="https://<id>.upstash.io"
# UPSTASH_REDIS_REST_TOKEN="<seu-token>"
```

Observações:
- Para SMTP do Gmail, use uma Senha de App (não sua senha normal). Ative a verificação em duas etapas e crie uma Senha de App.
- O projeto inclui um template em `credentials/google-oauth.json`. A pasta `credentials/` é ignorada no Git para evitar vazamento de segredos.
- Redis é opcional, mas recomendado em produção para deduplicação/rate limit distribuídos. Sem Redis, a aplicação usa memória local (adequado para dev/single‑instance).

### 4) Banco de dados

Fornecemos um serviço Postgres dedicado via Docker Compose. Ele expõe a porta `5433` no host, evitando conflito com outras instâncias.

Suba o serviço:

```bash
docker compose up -d postgres
```

Detalhes:
- Nome do container: `readowl_next_db`
- Banco: `readowl`
- Usuário/Senha: `readowl` / `readowl`
- Porta no host: 5433 (container 5432)

Seu `.env` deve apontar `DATABASE_URL` para `postgresql://readowl:readowl@localhost:5433/readowl?schema=public`.

Se quiser gerenciar o DB por GUI, há duas opções:

- Reutilizar o pgAdmin existente do projeto React (container `readowl_pgadmin`) em http://localhost:5050; ou
- Usar o pgAdmin incluído neste projeto em http://localhost:5051.

#### Usando o pgAdmin embutido (Opção 3)

Incluímos um serviço `pgadmin` no `docker-compose.yml`. Para iniciá-lo junto ao Postgres:

```bash
docker compose up -d postgres pgadmin
```

Acesse http://localhost:5051 e autentique com as credenciais definidas no `.env`:

```env
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin
```

Observações:
- Essas variáveis são opcionais; se não definidas, os valores acima são usados.
- No Linux, mapeamos `host.docker.internal` dentro do container para alcançar o Postgres exposto nas portas do host.

Crie o servidor dentro do pgAdmin:
1. Clique com o direito em “Servers” > Create > Server…
2. Aba General: Name: `readowl-local`
3. Aba Connection:
        - Host: `host.docker.internal` (de dentro do container do pgAdmin)
        - Port: `5433`
        - Maintenance DB: `readowl`
        - Username: `readowl`
        - Password: `readowl`
4. Salve

#### Criar um servidor no pgAdmin (passos GUI)

1. Abra http://localhost:5051 e faça login.
2. Click direito em “Servers” > Create > Server…
3. Aba General: Name: `readowl-local`
4. Aba Connection:
   - Host: Se o pgAdmin estiver em Docker e o Postgres no host, use o IP do host (Linux) ou `host.docker.internal` (Mac/Windows). Se ambos estiverem no Docker, `host.docker.internal` também funciona em muitos setups.
   - Port: `5433`
   - Maintenance DB: `readowl`
   - Username: `readowl`
   - Password: `readowl`
   - Save
5. Expanda o servidor > Databases. O DB padrão `readowl` deve existir. Se não existir, crie-o.

### 5) Configuração do Prisma

Gere e aplique o schema ao banco:

```bash
npx prisma generate
npx prisma migrate deploy
# Para o primeiro setup de dev (opcional) use:
# npx prisma migrate dev
```

### 6) Configuração do Google OAuth

No Google Cloud Console (APIs & Services > Credentials), crie um Client ID OAuth 2.0 para aplicação Web:
- Authorized JavaScript origins: `http://localhost:3000`
- Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

Copie o Client ID e o Secret para o `.env` (`GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`).

### 7) SMTP (recuperação de senha)

Se for usar Gmail:
- Ative a verificação em duas etapas (2FA)
- Crie uma Senha de App e defina em `.env` como `SMTP_PASS`
- Mantenha `SMTP_HOST=smtp.gmail.com` e `SMTP_PORT=587`

### 8) Rodar a aplicação

```bash
npm run dev
```

Abra http://localhost:3000

### 9) Solução de Problemas

- Verifique os valores do `.env` e a conectividade com o banco.
- Se usar Postgres via Docker, confirme se o mapeamento de portas bate com sua `DATABASE_URL`.
- Prisma não conecta: confira se o DB existe e as credenciais estão corretas.
- Gmail EAUTH/535: use uma Senha de App, não a senha normal. Considere a porta 465 com `SMTP_PORT=465` para SSL.

### 10) Reset completo (Docker + Prisma)

Use estes passos se quiser zerar containers, volumes e o estado de migrações do Prisma apenas para este projeto Next.js.

1. Pare e remova containers (pgAdmin e Postgres):

        ```bash
        docker rm -f readowl_next_pgadmin readowl_next_db 2>/dev/null || true
        ```

2. Remova volumes (apaga os dados):

        ```bash
        docker volume rm -f readowl-next_readowl_next_pgdata 2>/dev/null || true
        ```

3. Limpe as migrações do Prisma (squash para um baseline novo):

        ```bash
        rm -rf prisma/migrations/*
        ```

4. Suba o Postgres novamente e recrie migrações:

        ```bash
        docker compose up -d postgres
        npx prisma generate
        npx prisma migrate dev --name init
        ```

5. (Opcional) Suba o pgAdmin novamente:

        ```bash
        docker compose up -d pgadmin
        ```

6. Faça login no pgAdmin (http://localhost:5051) com as credenciais do `.env`:

        ```env
        PGADMIN_DEFAULT_EMAIL=admin@example.com
        PGADMIN_DEFAULT_PASSWORD=admin
        ```

Se o login falhar com "incorrect password", remova o container existente do pgAdmin para permitir que as novas credenciais tenham efeito e inicie novamente (passo 1 e depois 5).

-----

## 🧰 Notas de Desenvolvimento

- Stack: Next.js (App Router), TypeScript, Tailwind CSS, Prisma, NextAuth, Zod, Nodemailer.
- Adicionamos uma entrada `docker-compose.yml` para pgAdmin e simplificar o gerenciamento do DB em desenvolvimento.

### ✅ Validações rápidas de runtime (Views)

Para inspecionar o comportamento das rotas de views:
- Usuário não autor: ao abrir um capítulo, a contagem do capítulo deve aumentar no máximo 1 vez dentro de 2 minutos.
- Autor do livro: ao abrir seu próprio capítulo, o POST de view deve ser ignorado (não incrementa).
- Bot User-Agent: requisições com user-agents de bots devem ser filtradas/ignoradas.
- Rate limit: headers de rate limit aparecem nas respostas quando aplicável.

### 📑 Telas: Concluídas & A Fazer

| ✅ **Telas Concluídas** | Detalhes |
|---|---|
| 🏠 Landing Page | Header, termos e informações |
| 🔐 Login & Cadastro | Login/cadastro simples com recuperação de senha e opção de login com Google |
| 📖 Índice de Livro | Detalhes do livro, seguir, avaliação, volumes com lista de capítulos |
| 📄 Índice de Capítulo | Conteúdo principal e botões de CRUD |
| 📚 Biblioteca | Carrossel de livros criados |
| 📝 CRUD de Livro | Criar, ver, editar, excluir |
| 📦 CRUD de Volume & Capítulo | Criar, editar, excluir volumes e capítulos |
| ⚠️ Páginas de Erro | 403, 404, 500 e erros genéricos |

| 🚧 **Telas a Fazer** | Detalhes |
|---|---|
| 🏡 Home | Carrossel de banners, carrosséis de destaques, lista de capítulos recentes |
| 🔎 Busca de Livros | Com filtros |
| 📚 Carrossel de Seguidos | Na biblioteca |
| 💬 Aba de Comentários | Na página do livro |
| 📄 Índice de Capítulo | Avaliação por reações e comentários |
| 🔔 Notificações | Para livros criados e seguidos |
| 👤 Edição de Perfil | Tela de autoedição do usuário |
| 🛠️ Edição de Usuário (Admin) | Gestão geral de usuários para admins |

> 62% concluído

### 📁 Estrutura de Projeto Sugerida

- `docs/` – Documentação e diagramas do projeto.
- `prisma/` – Schema do Prisma e migrações do banco.
- `public/` – Assets estáticos servidos como estão (imagens, ícones, fontes, SVGs).
- `src/` – Código-fonte da aplicação.
        - `app/` – Next.js App Router: páginas, layouts e rotas de API em `app/api`.
        - `components/` – Componentes reutilizáveis de UI e features (ex.: book, ui, sections).
        - `lib/` – Bibliotecas e utilitários da aplicação (cliente Prisma, auth, mailer, rate limiters, helpers de slug).
        - `types/` – Tipos globais do TypeScript e ampliações de módulos (ex.: NextAuth, zxcvbn).

-----

## 📓 Convenção de Commits

Este repositório segue uma variação do padrão [Conventional Commits](https://www.conventionalcommits.org/). Essa abordagem ajuda a manter o histórico de commits claro e organizado, contribuindo para automação de versionamento e geração de changelog.

### ✔️ Formato

```bash
<tipo>(escopo):<ENTER>
<mensagem curta descrevendo o que o commit faz>
```

### 📍 O que é o "tipo"?

    * `feat`: Nova funcionalidade
    * `fix`: Correção de bug
    * `docs`: Mudanças na documentação
    * `style`: Ajustes de estilo (css, cores, imagens, etc.)
    * `refactor`: Refatoração de código sem alteração de comportamento
    * `perf`: Melhorias de performance
    * `test`: Criação ou modificação de testes
    * `build`: Mudanças que afetam o build (dependências, scripts)
    * `ci`: Configurações de integração contínua

### 📍 O que é o "escopo"?

Define a parte do projeto afetada pelo commit, como um módulo (`encryption`), uma página (`login-page`) ou uma feature (`carousel`).

### 📝 Exemplo

```bash
git commit -am "refactor(encryption):
> Melhora identação."

git commit -am "fix(login-page):
> Corrige bug de login nulo."

git commit -am "feat(carousel):
> Implementa carrossel na página inicial."
```

-----

## 🪢 Convenção de Branches

Este documento descreve o padrão de versionamento e organização de branches para o projeto Readowl, usando Git para um fluxo mais organizado e rastreável.

### 1. Nomenclatura de Branch

Toda nova branch criada para desenvolvimento de tarefas deve seguir estritamente o padrão abaixo para garantir consistência e clareza sobre o propósito de cada branch.

**Padrão:** `<descricao-curta-em-minusculas-com-hifens>`

A descrição deve ser curta e usar hífens para separar palavras.

**Exemplos de nomes de branch:**

- `landing-page`
- `backend-configuration`
- `login-form`

**Comando para criar uma branch:**

Para criar uma nova branch a partir de `dev` e mudar para ela:

```bash
git checkout -b landing-page
```

### 2. Branches Locais vs. Remotas (Origin)

É importante entender a diferença entre uma branch na sua máquina (local) e a branch no repositório remoto (origin).

- **Branch Local:** Versão do repositório que existe apenas no seu computador. Onde você trabalha, desenvolve, testa e faz commits.
- **Branch Remota (origin):** Versão da branch armazenada no servidor central (GitHub, GitLab etc.). Serve como ponto de sincronização para o time.

Embora sua branch local e a remota correspondente tenham o **mesmo nome** (ex.: `landing-page`), elas são entidades diferentes. Você desenvolve na branch local e, quando quiser compartilhar o progresso ou fazer backup, faz push dos seus commits para a branch remota com `git push`.

**Fluxo básico:**

1. Você cria a branch `landing-page` **localmente**.
2. Você desenvolve e comita nessa branch local.
3. Você envia seu trabalho ao repositório remoto com `git push`.

> Observação: O parâmetro `-u` (ou `--set-upstream`) vincula sua branch local à branch remota recém-criada, facilitando futuros `git push` e `git pull`.

### 3. Fluxo de Desenvolvimento

1. **Sincronize sua `dev` local:**
        ```bash
        git checkout dev
        git pull origin dev
        ```
2. **Crie a branch da sua tarefa:**
        Crie sua branch local a partir da `dev` atualizada, seguindo a convenção de nomes.
        ```bash
        git checkout -b login-form
        ```
3. **Desenvolva e faça commits:**
        Trabalhe no código e faça commits claros e concisos. Lembre de seguir a convenção de commits.
        ```bash
        git add .
        git commit -m "feat(login-form):
        > Adiciona validação de campos"
        ```
4. **Envie seu trabalho ao repositório remoto:**
        Faça push dos seus commits para a branch remota com o mesmo nome.
        ```bash
        git push origin -u login-form
        ```

### 4. Siga a Convenção de Commits

[Veja a convenção detalhada acima](#-convenção-de-commits) para garantir que suas mensagens sejam claras, rastreáveis e sempre referenciem a parte relevante do projeto.

### 5. Processo de Pull Request (PR)

Um Pull Request (PR) é o mecanismo para revisar e integrar código de uma branch em outra.

- **Ao finalizar uma tarefa:**
        Quando o desenvolvimento na sua branch (ex.: `login-form`) estiver concluído e testado, você deve abrir um **Pull Request** da sua branch para a branch `dev`.
        Isso serve para:
        1. Permitir revisão de código por outros membros do time.
        2. Manter um histórico de todas as mudanças integradas.
        3. Disponibilizar o código da tarefa em `dev` para outros desenvolvedores, se necessário.

- **Ao final de um Sprint:**
        A branch `main` é a de produção e deve conter apenas código estável e testado. Atualizações em `main` ocorrem apenas ao final de cada ciclo de desenvolvimento (Sprint).
        Ao final do sprint, será aberto um **Pull Request** da branch `dev` para a `main`, contendo todas as funcionalidades e correções desenvolvidas no período.

-----
