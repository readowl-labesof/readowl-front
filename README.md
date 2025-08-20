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

### 🎯 Funcionalidades Principais

    * Cadastro e login de usuários com autenticação segura e recuperação de senha.
    * Criação, visualização, edição e exclusão de livros, volumes e capítulos.
    * Sistema de busca avançada e filtros por gênero, popularidade e data.
    * Biblioteca pessoal para favoritar obras e receber notificações.
    * Interação através de avaliações, curtidas e comentários em livros e capítulos.
    * Painel de administração para gerenciamento de usuários e moderação de conteúdo.

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
            * `components/` – Componentes React reutilizáveis.
            * `pages/` – Componentes que representam as páginas da aplicação.
            * `hooks/` – Hooks personalizados.
            * `services/` – Lógica de comunicação com a API.
            * `utils/` – Funções utilitárias.

-----

## 📈 Status do Projeto

> **Progresso atual**: Em fase de planejamento e desenvolvimento.

> **Próximos passos**: Implementar os épicos de "Estrutura Básica e Acesso" conforme o Product Backlog.

-----

## ⚙️ Como rodar localmente

1.  Clone o repositório do projeto.

2.  Instale as dependências necessárias no seu sistema:

        ```bash
        npm install
        ```

3.  Configure o arquivo `.env` com as variáveis de ambiente necessárias (ex: URL do backend).

4.  No terminal, acesse a pasta raiz do projeto e execute:

        ```bash
        npm run dev
        ```

5.  A aplicação estará disponível no endereço `http://localhost:5173` (ou outra porta indicada pelo Vite).

-----

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
