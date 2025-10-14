# 🦉 Readowl (Frontend)

-----

Projeto web de uma plataforma de publicação e leitura de livros, focado em fomentar a literatura amadora no Brasil e aproximar leitores de escritores iniciantes.  
Desenvolvido utilizando **React**, **Vite** e **Tailwind CSS**.

-----

## 📋 Sobre o Projeto

O **Readowl** nasce da necessidade de criar um espaço para acolher escritores iniciantes e fortalecer a cultura literária no Brasil.  
A plataforma busca solucionar problemas comuns em outros sistemas, como a divulgação ineficiente e interfaces confusas, oferecendo um ambiente confiável para autores publicarem suas obras gratuitamente e receberem feedback.

### 👥 Equipe do Projeto

| Nome | Função |
|---|---|
| Alexandre Monteiro Londe | Desenvolvedor |
| Gabriel Lucas Silva Seabra | Desenvolvedor |
| Jussie Lopes da Silva | Desenvolvedor |
| Luiz Alberto Cury Andalécio | Desenvolvedor |
| Vitor Gabriel Resende Lopes Oliveira | Desenvolvedor |

*Tabela adaptada do documento "PP - LabESOF"*

### 🎯 Funcionalidades Principais (fase atual)

        * Autenticação: login, registro, remember-me, recuperação de senha.
        * Login com Google (fluxo OAuth) – botão na tela de login.
        * Visualização de detalhes de livro (sinopse sanitizada, volumes, capítulos avulsos).
        * Leitura de capítulo (breadcrumb, navegação prev/next, tema claro/escuro).
        * Seguir / deixar de seguir livros + exibir estado.
        * Avaliação (rating) de livros + resumo (média e distribuição) com interação.
        * Breadcrumb reutilizável (componente compartilhado) igualado ao estilo do projeto Next.
        * Ícones unificados via lucide-react.
        * Fontes personalizadas (Yusei Magic / PT Serif) integradas ao Tailwind.
        * Estrutura preparada para CRUD avançado (edição rico-text) a ser implementado.

Planejado / Próximo:
        * Editor TipTap para criação/edição de capítulos.
        * Reordenação interativa de volumes/capítulos.
        * Páginas de gerenciamento de perfil avançado e administração.

### 🛠️ Tecnologias Utilizadas

    * **Interface e Estrutura**:
            * React (com Vite)
            * React Router DOM
            * TypeScript
    * **Estilização**:
            * Tailwind CSS
    * **Gerenciamento de Dados e Formulários**:
            * TanStack Query
            * React Hook Form
    * **Editor de Texto**:
            * TipTap
    * **Ambiente**:
            * Git
            * npm
            * VS Code

### 📁 Estrutura do Projeto (Sugestão)

    * `public/` – Imagens, fontes e arquivos estáticos.
    * `src/` – Código-fonte da aplicação.
            * `assets/` – Arquivos de mídia e estilos globais.
            * `global/` – Componentes React reutilizáveis.
            * `pages/` – Páginas da aplicação.
                * `pages/components` – Componentes exclusivas da página da aplicação.
            * `hooks/` – Hooks personalizados.
            * `services/` – Lógica de comunicação com a API.
            * `styles/` – CSS das páginas da aplicação.
            * `utils/` – Funções utilitárias.

-----

## 📈 Status do Projeto

> **Concluído recentemente**: Migração de ícones, auth com Google e reset de senha, componente Breadcrumb, página de detalhe de livro (follow + rating), leitor de capítulo com tema, remoção total de mocks (json-server).

> **Em andamento**: Interfaces CRUD (editor TipTap) e testes.

> **Próximos passos**: Implementar criação/edição de capítulos, reordenação drag-and-drop, testes E2E leves e documentação final.

-----

## ⚙️ Como rodar localmente

1. Clone o repositório do projeto.

2. Certifique-se de que o Node.js está instalado na versão **20 ou superior**. Recomenda-se utilizar o [nvm](https://github.com/nvm-sh/nvm) para gerenciar versões do Node:

        ```bash
        command -v nvm || curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        source ~/.bashrc
        nvm install 20
        nvm use 20
        ```

3. Instale as dependências do projeto (os pacotes do `node_modules`):

        ```bash
        npm install
        ```

4. Configure o arquivo `.env` com as variáveis de ambiente necessárias.

### 🔐 Variáveis de Ambiente (Frontend)
```
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com # usado se houver fluxo direto no cliente no futuro
```
Observações:
1. O frontend usa `VITE_API_URL` para montar requisições (fallback: http://localhost:3000).
2. Tokens de sessão são armazenados em `localStorage` (ou sessionStorage para sessões sem remember-me).

5. Na pasta raiz do projeto, execute:

        ```bash
        npm run dev
        ```

6. A aplicação estará disponível em `http://localhost:5173` (ou outra porta informada pelo Vite).

-----

## 🔗 Integração com Backend

Consumo principal via cliente em `src/lib/api.ts` (fetch + wrappers). Principais grupos:
        * auth: login, register, me, forgot/reset, googleAuthUrl
        * books: getBook, getChapters, getVolumes
        * follow: followStatus, follow/unfollow
        * rating: ratingSummary, rate

Estrutura de dados tipada (DTOs) evita `any` e centraliza contratos. Atualizar esse arquivo ao adicionar novas rotas.

## 📓 Padrão de Commits

Este repositório adota uma variação do padrão [Conventional Commits](https://www.conventionalcommits.org/), adaptada para integração com o Jira. Essa abordagem facilita a rastreabilidade das tarefas, mantém o histórico de commits claro e organizado, e contribui para a automação de versões e geração de changelogs.

### ✔️ Formato

```bash
<ID da task no Jira> <tipo>(escopo):<ENTER>
<mensagem breve sobre o que o commit faz>
```

### 📍 O que é o "tipo"?

    * `feat`: Nova funcionalidade
    * `fix`: Correção de bugs
    * `docs`: Alterações na documentação
    * `style`: Ajustes de estilização (css, cores, imagens, etc.)
    * `refactor`: Refatoração de código sem mudança de comportamento
    * `perf`: Melhorias de performance
    * `test`: Criação ou modificação de testes
    * `build`: Mudanças que afetam o build (dependências, scripts)
    * `ci`: Configurações de integração contínua

### 📍 O que é o "escopo"?

Define o título do commit referente à parte do projeto afetada, como um módulo (`criptografia`), uma página (`login-page`), ou uma feature (`carrossel`).

### 📝 Exemplo

```bash
git commit -am "RO-25 refactor(criptografia):
> Aprimora a indentação."

git commit -am "RO-12 fix(login-page):
> Corrige bug de login nulo."

git commit -am "RO-47 feat(carrossel):
> Implementa o carrossel na página inicial."
```

-----
## 🧭 Breadcrumb

Componente reutilizável em `src/components/ui/Breadcrumb.tsx` inspirado na versão Next.js. Recursos:
        * Suporte a prefixo "Início" e itens dinâmicos.
        * Envelopado em `<nav aria-label="Breadcrumb">` com acessibilidade.
        * Estilos responsivos com wrap de linha em telas menores.

Uso exemplo:
```tsx
<Breadcrumb showHome items={[{ label: book.title }, { label: 'Editar', href: `/books/${book.id}/edit` }]} />
```

## ⭐ Rating e Follow

Componentes:
        * `FollowButton` (toggle otimista com invalidação de cache).
        * `RatingSummary` (média, distribuição e interação de envio de nota).

## 📚 Leitor de Capítulo

Página `ChapterReader` com:
        * Tema claro/escuro (toggle adiciona classe `dark` no `<html>`).
        * Navegação prev/next calculada em memória após fetch da lista de capítulos.
        * Conteúdo sanitizado previamente no backend.

## 🔄 Próximas Implementações (CRUD Avançado)

Planejamento para editor (TipTap):
        * Componente `RichChapterEditor` (toolbar: bold, italic, heading, list, code, quote, link).
        * Serialização HTML -> salva sanitized no backend.
        * Preview modo leitura inline.

## 🧪 Testes (Plano)

Após finalizar CRUD:
        * Smoke de rotas (frontend) com Playwright ou Cypress leve.
        * Testes de hooks (useAuth) e componentes críticos (FollowButton, RatingSummary).
        * Snapshot shallow de Breadcrumb.

-----

## 🪢 Padrão de Branches

Este documento descreve o padrão de versionamento e a organização das branches do projeto Readowl, utilizando Git em conjunto com o Jira para um fluxo de trabalho mais organizado e rastreável.

## Índice

1.  [Integração com o Jira](https://www.google.com/search?q=%231-integra%C3%A7%C3%A3o-com-o-jira)
2.  [Padrão para Nomenclatura de Branches](https://www.google.com/search?q=%232-padr%C3%A3o-para-nomenclatura-de-branches)
3.  [Branches Locais vs. Remotas (Origin)](https://www.google.com/search?q=%233-branches-locais-vs-remotas-origin)
4.  [Fluxo de Desenvolvimento](https://www.google.com/search?q=%234-fluxo-de-desenvolvimento)
5.  [Padrão de Commits](https://www.google.com/search?q=%235-padr%C3%A3o-de-commits)
6.  [Processo de Pull Request (PR)](https://www.google.com/search?q=%236-processo-de-pull-request-pr)

-----

### 1. Integração com o Jira

Para garantir que nosso trabalho no código-fonte esteja sempre conectado às tarefas planejadas no Jira, utilizamos um sistema de rastreamento simples. Cada tarefa no Jira possui um identificador único (ID), como `RO-17`, `RO-25`, etc.

É **obrigatório** que cada branch e commit relacionado a uma tarefa comece com o ID correspondente, pois isso permite que o Jira identifique e vincule automaticamente as branches e os commits à tarefa, facilitando o acompanhamento do progresso e a revisão do trabalho realizado.

### 2. Padrão para Nomenclatura de Branches

Toda nova branch criada para o desenvolvimento de uma tarefa deve seguir estritamente o padrão abaixo para garantir consistência e clareza sobre o propósito de cada branch.

**Padrão:** `<ID da task>-<nome descritivo em minusculo>`

O nome descritivo deve ser curto e usar hífens para separar as palavras.

**Exemplos de nomes de branch:**

- `RO-17-landing-page`
- `RO-12-configuracao-de-backend`
- `RO-25-formulario-de-login`

**Comando para criar a branch:**

Para criar uma nova branch a partir da `dev` e já mudar para ela, utilize o comando:

```bash
git checkout -b RO-17-landing-page
```

### 3. Branches Locais vs. Remotas (Origin)

É fundamental entender a diferença entre uma branch em sua máquina (local) e a branch no repositório remoto (origin).

- **Branch Local:** É uma versão do repositório que reside exclusivamente no seu computador. É nela que você trabalha, desenvolve o código, testa e faz commits.
- **Branch Remota (origin):** É a versão da branch que está armazenada no servidor central (como GitHub, GitLab, etc.). Ela serve como um ponto de sincronização para todos os membros da equipe.

Embora a sua branch local e a branch remota correspondente tenham o **mesmo nome** (ex: `RO-17-landing-page`), elas são entidades diferentes. Você desenvolve na sua branch local, e quando deseja compartilhar seu progresso ou fazer um backup, você envia seus commits para a branch remota com o comando `git push`.

**Fluxo básico:**

1. Você cria a branch `RO-17-landing-page` **localmente**.
2. Você desenvolve e faz seus commits nessa branch local.
3. Você envia suas alterações para o servidor remoto com `git push -u origin RO-17-landing-page`.

> OBS: O parâmetro `-u` (ou `--set-upstream`) faz com que sua branch local seja vinculada à branch remota recém-criada, facilitando futuros comandos `git push` e `git pull` sem precisar especificar o nome da branch.

### 4. Fluxo de Desenvolvimento

1. **Sincronize sua branch `dev` local:**
        ```bash
        git checkout dev
        git pull origin dev
        ```
2. **Crie a branch da sua tarefa:**
        Crie sua branch local a partir da `dev` atualizada, seguindo o padrão de nomenclatura.
        ```bash
        git checkout -b RO-25-formulario-de-login
        ```
3. **Desenvolva e faça commits:**
        Trabalhe no código e faça commits claros e concisos. Lembre-se de seguir o padrão de commits.
        ```bash
        git add .
        git commit -m "RO-25 feat(login-form):
        > Adiciona validação de campos"
        ```
4. **Envie seu trabalho para o repositório remoto:**
        Faça o push dos seus commits para a branch remota de mesmo nome.
        ```bash
        git push origin -u RO-25-formulario-de-login
        ```

### 5. Mantenha o Padrão de Commits

[Consulte o padrão de commits detalhado acima](#padrão-de-commits) para garantir que suas mensagens estejam claras, rastreáveis e referenciem sempre o ID da task correspondente.

### 6. Processo de Pull Request (PR)

O Pull Request (PR) é o mecanismo para revisar e integrar o código de uma branch em outra.

- **Ao finalizar uma tarefa:**
        Quando o desenvolvimento na branch da sua tarefa (ex: `RO-25-formulario-de-login`) estiver concluído e testado, você deve abrir um **Pull Request** da sua branch para a branch `dev`.
        Isso serve para:
        1. Permitir a revisão do código (Code Review) por outros membros da equipe.
        2. Manter um registro histórico de todas as alterações integradas.
        3. Disponibilizar o código da tarefa na `dev` para que outros desenvolvedores possam acessá-lo, caso necessário.

- **Ao final de uma Sprint:**
        A branch `main` é a nossa branch de produção e deve conter apenas código estável e testado. Portanto, as atualizações na `main` ocorrem apenas no final de cada ciclo de desenvolvimento (Sprint).
        Ao final da sprint, um **Pull Request** será aberto da branch `dev` para a branch `main`, contendo todas as funcionalidades e correções desenvolvidas durante o ciclo.

-----
