# Resumo da Aula 08 — Documentação de Software

## 1. Conceito de documentação de software

Documentação de software é o conjunto de informações que ajuda as pessoas a **compreender, utilizar, desenvolver, testar e manter** um sistema.

Uma documentação adequada deve responder, de forma clara:

- O que é o projeto?
- Qual problema ele resolve e para que serve?
- Como instalar e configurar o sistema?
- Como executar a aplicação?
- Como testar o projeto?
- Como contribuir e realizar alterações?

O principal objetivo é reduzir a dependência de explicações informais e permitir que outras pessoas compreendam e executem o projeto sem precisar perguntar tudo aos desenvolvedores originais.

## 2. Problemas causados pela falta de documentação

Quando um projeto não é documentado, podem ocorrer:

- Dependência excessiva de desenvolvedores específicos;
- Dificuldade para integrar novos membros à equipe;
- Configurações esquecidas ou realizadas de maneira incorreta;
- Aumento do tempo necessário para manutenção e correção de problemas;
- Perda de conhecimento quando alguém deixa a equipe;
- Repetição de dúvidas sobre instalação, execução e publicação do sistema.

## 3. Importância da documentação

A documentação atende principalmente a quatro necessidades:

- **Comunicação:** compartilha conhecimento entre as pessoas.
- **Manutenção:** facilita correções, atualizações e evolução do sistema.
- **Colaboração:** permite que várias pessoas trabalhem no projeto de forma organizada.
- **Continuidade:** diminui a dependência de indivíduos específicos.

Documentar não significa apenas registrar informações, mas tornar o conhecimento **reutilizável**.

## 4. Usuários da documentação

A documentação pode ser utilizada por diferentes participantes do projeto:

- **Desenvolvedores:** iniciam o trabalho com menor dependência da equipe.
- **Testadores:** aprendem a executar e validar os testes.
- **DevOps:** configuram ambientes, pipelines e processos de deploy.
- **Gestores:** acompanham decisões, processos, escopo e entregas.
- **Usuários:** aprendem a utilizar o produto.

## 5. Combinação de áreas

A documentação de software envolve várias áreas da tecnologia e da gestão:

- **Engenharia de Software:** requisitos, arquitetura, código e testes.
- **Gestão de Projetos:** escopo, cronograma, riscos e entregas.
- **DevOps:** integração contínua, entrega contínua, infraestrutura, deploy e monitoramento.
- **Segurança da Informação:** vulnerabilidades, políticas, acessos e incidentes.
- **Qualidade de Software (QA):** testes, critérios de aceitação, evidências e qualidade.
- **Produto e UX:** necessidades dos usuários, jornadas, regras de negócio e usabilidade.

## 6. Tipos de documentação

### Documentação técnica

Descreve os aspectos internos e tecnológicos do sistema, como:

- Arquitetura;
- APIs;
- Banco de dados;
- Componentes;
- Configurações;
- Tecnologias e versões utilizadas.

### Documentação de projeto

Registra informações de planejamento e organização, como:

- Objetivos;
- Problema a ser resolvido;
- Escopo;
- Requisitos funcionais e não funcionais;
- Decisões do projeto;
- Organização das atividades e entregas.

### Documentação de processo

Explica como o trabalho é realizado, incluindo:

- Branches e commits;
- Pull Requests;
- Revisões de código;
- Testes;
- Pipelines;
- Build;
- Deploy.

## 7. README do GitHub

O arquivo `README.md` geralmente é o primeiro documento consultado em um repositório. Ele deve permitir que uma pessoa entenda rapidamente o projeto e saiba como utilizá-lo.

Um README completo deve conter:

- Propósito do projeto;
- Principais tecnologias;
- Pré-requisitos;
- Instruções de instalação;
- Configuração;
- Execução;
- Testes;
- Estrutura do projeto;
- Como contribuir;
- Links importantes;
- Informações sobre API, banco de dados e deploy, quando aplicável.

### Tecnologias e pré-requisitos

É importante informar a stack necessária para executar o sistema, incluindo:

- Linguagem e versão;
- Framework;
- Banco de dados;
- Gerenciador de pacotes;
- Git;
- Docker, quando utilizado;
- Outras ferramentas necessárias.

Quando fizer diferença, devem ser indicadas as versões mínimas ou recomendadas.

### Instalação e execução

As instruções precisam ser reproduzíveis e organizadas em uma sequência lógica, por exemplo:

1. Clonar o repositório;
2. Acessar a pasta do projeto;
3. Instalar as dependências;
4. Configurar as variáveis de ambiente;
5. Iniciar a aplicação;
6. Acessar o sistema;
7. Executar os testes.

### Configuração e variáveis de ambiente

A documentação deve explicar:

- Quais variáveis existem;
- Para que serve cada variável;
- Quais são obrigatórias;
- Como criar o arquivo de configuração;
- Quais valores de exemplo podem ser utilizados.

Exemplo:

```env
PORT=3000
DATABASE_URL=sua_url_aqui
API_KEY=sua_chave_aqui
```

Os valores reais de chaves, senhas e tokens nunca devem ser publicados.

### Execução e testes

O README deve mostrar como verificar se o projeto está funcionando, incluindo, quando existirem, comandos para:

- Iniciar a aplicação;
- Executar testes unitários;
- Executar testes de integração;
- Executar testes de performance;
- Conferir resultados;
- Identificar e interpretar falhas.

### Estrutura do projeto

Também é útil apresentar as principais pastas e suas responsabilidades. Um exemplo é:

```text
src/                  # Código da aplicação
tests/                # Testes
docs/                 # Documentação adicional
.github/workflows/    # Pipelines de CI/CD
```

Não é necessário descrever todos os arquivos; devem ser explicadas as partes relevantes para compreender e operar o sistema.

## 8. Documentação do processo DevOps

A documentação do fluxo DevOps deve registrar as etapas pelas quais o código passa:

1. **Desenvolvimento:** implementação de funcionalidades e correções.
2. **Git:** controle de versão e histórico das alterações.
3. **Pull Request:** solicitação de revisão e integração das mudanças.
4. **Build:** compilação ou preparação do software.
5. **Testes:** validação do funcionamento e identificação de falhas.
6. **Pipeline CI/CD:** automação da integração, validação e entrega.
7. **Deploy:** publicação da aplicação em um ambiente de execução.

Também devem ser descritos os ambientes, as ferramentas, as versões e os procedimentos necessários para reproduzir o processo.

## 9. O que não deve ser colocado na documentação

Nunca devem ser publicados:

- Senhas;
- Chaves de API;
- Tokens de acesso;
- Dados pessoais ou confidenciais de clientes;
- Arquivos `.env` com informações reais;
- Configurações sigilosas;
- Informações restritas da infraestrutura;
- Dados que possam facilitar acessos indevidos ou comprometer a segurança.

A documentação deve explicar como configurar esses itens sem revelar seus valores reais.

## 10. Atividade proposta na aula

A atividade consiste em escolher um projeto de software e elaborar sua documentação, apresentando:

- Objetivo do projeto;
- Problema que pretende resolver;
- Escopo;
- Requisitos funcionais e não funcionais;
- Tecnologias utilizadas;
- Arquitetura da aplicação;
- Organização dos principais componentes;
- Pré-requisitos;
- Instruções de instalação, configuração e execução;
- APIs e banco de dados, quando aplicável;
- Variáveis de ambiente;
- Procedimentos de testes;
- Processo de deploy.

Por fim, deve ser criado ou atualizado o arquivo `README.md` do repositório no GitHub.

## Conclusão

Uma boa documentação é parte essencial de um projeto de software. Ela facilita a comunicação, a manutenção, a colaboração e a continuidade do sistema. O README deve funcionar como um guia inicial completo, enquanto as documentações técnica, de projeto e de processo detalham os aspectos necessários para que diferentes pessoas consigam entender, executar, testar e evoluir o projeto com segurança.
