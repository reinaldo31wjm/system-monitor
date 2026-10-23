# Resumo das Aulas 7 e 8

Este documento relaciona as duas etapas do projeto de Sistemas Operacionais: a **Aula 7**, dedicada à implementação, e a **Aula 8**, dedicada à documentação do software.

## Repositórios das aulas

- [Aula 7 — Implementação](https://github.com/reinaldo31wjm/sistemas-operacionais-1/tree/main/Aula7)
- [Aula 8 — Documentação](https://github.com/reinaldo31wjm/sistemas-operacionais-1/tree/main/Aula8)
- [Projeto implementado — System Monitor](https://github.com/reinaldo31wjm/system-monitor)

## Aula 7 — Implementação

A Aula 7 apresenta a implementação prática de um painel de observabilidade chamado **System Monitor**. O sistema é executado com Node.js e coleta informações do ambiente em que o processo está rodando.

### Objetivos principais

- criar um servidor HTTP funcional;
- relacionar conceitos de Sistemas Operacionais com uma aplicação web;
- coletar dados de CPU, memória, disco, carga, uptime, processo e rede;
- disponibilizar as métricas por uma API JSON;
- construir um painel visual atualizado automaticamente;
- compreender a execução local e em ambientes de cloud;
- preparar o serviço para deploy no Render;
- aplicar validação de caminhos e headers básicos de segurança.

### Implementação realizada

O servidor usa o módulo `http` nativo do Node.js, sem Express e sem dependências externas de runtime. O arquivo `server.js` controla o servidor, as rotas, os métodos HTTP, os arquivos estáticos e o encerramento do processo.

O módulo `lib/metrics.js` coleta e normaliza os dados do sistema. A CPU é calculada por comparação entre amostras sucessivas de `os.cpus()`. A memória considera limites de contêiner quando disponíveis e possui fallbacks para diferentes ambientes. O disco é consultado quando a API do sistema permite essa operação.

A API principal é disponibilizada em `/api/stats`. O endpoint `/healthz` informa se o processo está ativo. A rota `/` entrega o painel HTML, que usa os arquivos de `public/` para atualizar os indicadores, exibir o histórico e controlar a interface.

### Conceitos relacionados a Sistemas Operacionais

A implementação permite observar, na prática:

- uso de CPU por núcleo;
- diferença entre memória do sistema e memória do processo;
- uptime do sistema e uptime da aplicação;
- carga média de 1, 5 e 15 minutos;
- diferenças entre ambiente local e contêiner;
- interfaces de rede e endereços internos;
- limites de memória definidos por cgroup;
- limitações de acesso ao disco em plataformas hospedadas.

## Aula 8 — Documentação de Software

A Aula 8 trata da documentação como parte essencial do ciclo de vida do software. O objetivo é permitir que outra pessoa compreenda, execute, valide, mantenha e evolua o projeto sem depender de explicações informais.

### Objetivos principais

- documentar o objetivo e o escopo do sistema;
- registrar requisitos funcionais e não funcionais;
- explicar arquitetura, componentes e fluxo de dados;
- documentar instalação, configuração e execução;
- descrever rotas, métodos, respostas e limitações da API;
- registrar validação local e processo de deploy;
- orientar contribuição, segurança e convivência;
- preservar decisões e limites técnicos do projeto.

### Documentação produzida

A documentação consolidada do System Monitor está na pasta `docs` do repositório do projeto. O arquivo `README.md` reúne arquitetura, API, métricas, configuração, validação, deploy, limitações, checklist e o conteúdo aplicado das aulas.

Os arquivos complementares possuem responsabilidades específicas:

- `CONTRIBUTING.md`: fluxo de contribuição, branches, Pull Requests e revisão;
- `SECURITY.md`: controles de segurança, exposição da API e relato de vulnerabilidades;
- `CODE_OF_CONDUCT.md`: regras de colaboração e comunicação;
- `LICENSE`: licença distribuída com o material;
- `RESUMO_AULAS.md`: síntese conjunta das Aulas 7 e 8.

### Relação entre implementação e documentação

A Aula 7 produz o código e as evidências técnicas. A Aula 8 transforma esse conhecimento em documentação reutilizável. Quando uma rota, métrica, variável, requisito ou comportamento visual muda, a documentação deve ser revisada junto com o código.

O PDF original da disciplina apresenta exemplos gerais, incluindo uma API com Express e CORS. O System Monitor entregue neste projeto foi implementado com o módulo HTTP nativo do Node.js, sem Express, sem CORS e sem dependências externas de runtime. A fonte de verdade sobre o funcionamento atual é o código do projeto e sua documentação consolidada.

## Fluxo completo do trabalho

```text
Aula 7 — implementar
        ↓
coletar métricas e criar a API
        ↓
construir e validar o painel
        ↓
Aula 8 — documentar
        ↓
registrar arquitetura, API, execução e limites
        ↓
organizar contribuição, segurança e licença
```

A implementação responde **como o sistema funciona**. A documentação responde **como outra pessoa pode entendê-lo, executá-lo, validar seu comportamento e contribuir com segurança**.
