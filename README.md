# Documentação do System Monitor

Esta pasta contém a documentação técnica e as políticas do **System Monitor**, um painel web de observabilidade executado com Node.js nativo. O material foi reorganizado para concentrar assuntos técnicos em um único documento e manter políticas independentes nos arquivos padronizados do repositório.

**Sistema principal:** [System Monitor em produção](https://system-monitor-i16u.onrender.com)

## Índice

- [1. Visão geral](#1-visão-geral)
- [2. Escopo](#2-escopo)
- [3. Requisitos e execução](#3-requisitos-e-execução)
- [4. Configuração](#4-configuração)
- [5. Arquitetura](#5-arquitetura)
- [6. API HTTP](#6-api-http)
- [7. Métricas e interpretação](#7-métricas-e-interpretação)
- [8. Interface](#8-interface)
- [9. Validação](#9-validação)
- [10. Deploy](#10-deploy)
- [11. Segurança e limites](#11-segurança-e-limites)
- [12. Conteúdo das aulas](#12-conteúdo-das-aulas)
- [13. Checklist de revisão](#13-checklist-de-revisão)
- [14. Políticas complementares](#14-políticas-complementares)
- [15. Resumo conjunto das aulas](RESUMO_AULAS.md)

## 1. Visão geral

O System Monitor observa o ambiente no qual o processo Node.js está executando e apresenta os dados em um painel web atualizado automaticamente. O sistema foi desenvolvido como um estudo prático de Sistemas Operacionais aplicado a um serviço HTTP.

O servidor coleta dados do sistema operacional, do processo Node.js e das interfaces de rede. A aplicação também informa o contexto de execução — local ou cloud — e disponibiliza uma API JSON para inspeção manual ou integração com outro consumidor.

O projeto utiliza o módulo `http` nativo do Node.js. Não utiliza Express, CORS, banco de dados ou dependências externas de runtime.

## 2. Escopo

### 2.1 Funcionalidades incluídas

- página principal do painel em `/`;
- API de métricas em `/api/stats`;
- endpoint de disponibilidade em `/healthz`;
- coleta de CPU por núcleo e média geral;
- médias de carga de 1, 5 e 15 minutos;
- memória total, usada, disponível e origem do cálculo;
- memória do processo Node.js, incluindo heap e RSS;
- armazenamento quando `fs.statfsSync()` está disponível;
- uptime do sistema e do processo;
- sistema operacional, versão, arquitetura, endianness e versão do Node.js;
- hostname, IP principal e interfaces IPv4 visíveis;
- quantidade de arquivos do projeto, excluindo `.git` e `node_modules`;
- atualização automática, manual e pausável no navegador;
- histórico recente e diagnóstico visual;
- configuração declarativa de deploy no Render por `render.yaml`.

### 2.2 Fora do escopo

O projeto não fornece autenticação, autorização, banco de dados, retenção histórica no servidor, alertas por e-mail ou webhook, controle remoto, gestão de processos, correção automática de falhas ou garantia de que os dados representem o hardware físico completo da hospedagem.

## 3. Requisitos e execução

### 3.1 Requisitos

- Node.js 18.15 ou superior;
- Git para clonar o repositório;
- terminal compatível com o sistema operacional;
- navegador moderno para acessar o painel.

Não há etapa obrigatória de `npm install`, porque o projeto não possui dependências externas de execução. O `package-lock.json` permanece no repositório para preservar a estrutura npm do projeto.

### 3.2 Execução local

```bash
git clone https://github.com/reinaldo31wjm/system-monitor.git
cd system-monitor
npm start
```

A aplicação escuta em `0.0.0.0` e utiliza a porta `3000` quando `PORT` não foi definida. Acesse <http://localhost:3000>.

Para desenvolvimento, com reinicialização automática do Node.js:

```bash
npm run dev
```

Para usar outra porta:

```bash
PORT=8080 npm start
```

No Windows PowerShell:

```powershell
$env:PORT=8080; npm start
```

## 4. Configuração

| Variável | Padrão | Obrigatória | Finalidade |
|---|---:|:---:|---|
| `PORT` | `3000` | Não | Porta HTTP do processo. Em hospedagem, a plataforma fornece o valor. |
| `NODE_ENV` | `development` | Não | Identifica o ambiente do Node.js. |
| `SHOW_HOST_DETAILS` | `false` | Não | Quando `true`, exibe usuário, diretório home e MAC no painel. |

`SHOW_HOST_DETAILS` deve permanecer desativada em serviços públicos, pois pode revelar informações desnecessárias do ambiente. Nenhuma variável de segredo é necessária para executar a aplicação.

## 5. Arquitetura

```text
Sistema operacional
        │
        ▼
lib/metrics.js ── coleta, normalização e cache
        │
        ▼
server.js ─────── HTTP, roteamento, estáticos e headers
        │
        ├── /api/stats ── objeto JSON
        ├── /healthz ─── status de disponibilidade
        └── / ─────────── HTML inicial
                              │
                              ├── lib/page.js
                              ├── public/js/app.js
                              ├── public/js/rain.js
                              └── public/css/style.css
```

### 5.1 Componentes

**`server.js`** é o ponto de entrada. Cria o servidor HTTP, aceita apenas `GET` e `HEAD`, interpreta a URL, encaminha as rotas, entrega arquivos estáticos e adiciona headers de segurança. Também trata encerramento por `SIGTERM` e `SIGINT`, importante em ambientes de hospedagem.

**`lib/metrics.js`** concentra a coleta. Mantém amostras anteriores de CPU, calcula o uso por núcleo, consulta memória e disco, identifica rede e ambiente e aplica caches de curta duração para evitar leituras excessivas.

**`lib/page.js`** gera o HTML inicial com os dados disponíveis no momento da abertura. A atualização posterior ocorre no navegador por meio de `/api/stats`.

**`public/js/app.js`** atualiza os indicadores, controla abas, histórico, diagnóstico, pausa, atualização manual, estados de conexão e controles do efeito visual.

**`public/js/rain.js`** desenha a chuva em canvas, respeitando visibilidade da aba e `prefers-reduced-motion`.

**`public/css/style.css`** define layout responsivo, cores, indicadores, estados de atenção e foco de teclado.

### 5.2 Cache e amostragem

A CPU é calculada por comparação entre leituras sucessivas de `os.cpus()`, aproximadamente a cada dois segundos. As métricas gerais são reutilizadas por até um segundo; disco e quantidade de arquivos são reutilizados por até quinze segundos. Esses limites reduzem custo sem transformar o painel em um sistema de séries temporais.

## 6. API HTTP

A API é destinada à consulta atual do ambiente. Os dados não são persistidos pelo servidor.

### 6.1 Regras gerais

- `GET` e `HEAD` são aceitos;
- métodos diferentes retornam `405 Method Not Allowed`;
- rotas inexistentes retornam `404 Not Found`;
- respostas JSON usam `application/json; charset=utf-8`;
- `/api/stats` usa `Cache-Control: no-store`;
- arquivos estáticos possuem MIME type, ETag e cache de um dia.

### 6.2 Rotas

| Método | Rota | Resultado |
|---|---|---|
| `GET`, `HEAD` | `/` | Página HTML do painel. |
| `GET`, `HEAD` | `/api/stats` | Métricas atuais em JSON. |
| `GET`, `HEAD` | `/healthz` | `{"status":"ok"}` quando o processo está ativo. |
| `GET`, `HEAD` | `/css/*` | Arquivos CSS permitidos de `public/`. |
| `GET`, `HEAD` | `/js/*` | Arquivos JavaScript permitidos de `public/`. |

### 6.3 Exemplos

```bash
curl -i http://localhost:3000/healthz
curl -i http://localhost:3000/api/stats
curl -I http://localhost:3000/
curl -i -X POST http://localhost:3000/healthz
```

O último comando deve retornar `405` e informar `Allow: GET, HEAD`.

### 6.4 Contrato de `/api/stats`

Os campos principais são:

- `timestamp`: instante da coleta em milissegundos desde Unix Epoch;
- `serverTime`: data e hora formatadas pelo servidor;
- `uptime` e `processUptime`: tempo do sistema e do processo;
- `loadSupported`, `load1`, `load5`, `load15`: suporte e médias de carga;
- `cores`: percentual aproximado por núcleo;
- `loadPercent`: média aproximada do uso dos núcleos;
- `usedMem`, `freeMem`, `totalMem`, `memUsagePercent`: memória em MB e percentual;
- `memSource`: `cgroup`, `meminfo` ou `os`;
- `processMem` e `rss`: heap utilizado e memória residente do processo;
- `disk`: disponibilidade, capacidade, uso e percentual do armazenamento;
- `projectFileCount`: arquivos do projeto, excluindo `.git` e `node_modules`;
- `hostname`, `primaryIp`, `osType`, `osRelease`, `architecture`, `endianness` e `nodeVersion`;
- `environment`: objeto com `mode`, `provider`, `nodeEnv` e `port`.

Quando o sistema não permite consultar o disco, `disk.available` é `false` e os valores de capacidade são nulos. Isso significa indisponibilidade da medição, não uso igual a zero.

## 7. Métricas e interpretação

A CPU depende de duas ou mais leituras. Uma leitura isolada não informa percentual de uso; por isso, o coletor compara tempos ocupado e ocioso entre amostras.

A memória pode usar limites de cgroup e, em Linux, `MemAvailable` de `/proc/meminfo`. Se essas fontes não estiverem disponíveis, o código usa as APIs do módulo `os`. Em contêineres, `totalMem` pode ser o limite do contêiner e não a memória física do host.

`processMem` representa o heap utilizado pelo processo Node.js. `rss` representa a memória residente total do processo e não deve ser confundido com a memória total da máquina.

`load1`, `load5` e `load15` são médias de carga do sistema. No Windows, a carga é marcada como indisponível porque a semântica de `os.loadavg()` não é equivalente nesse ambiente.

O IP principal é o primeiro endereço IPv4 não interno encontrado pelo processo. Em cloud, ele pode ser um endereço interno do contêiner e não o endereço público do serviço.

## 8. Interface

O navegador carrega os dados iniciais na página e consulta `/api/stats` aproximadamente a cada três segundos. O usuário pode solicitar uma atualização manual ou pausar o ciclo automático. A aba de diagnóstico mantém uma janela curta de histórico no cliente e registra mudanças entre os níveis Normal, Atenção e Crítico.

O efeito de chuva é visual e não representa precipitação real. Seus modos controlam densidade e intensidade da animação; o modo sincronizado relaciona o efeito aos indicadores do painel. A animação é reduzida ou interrompida quando o usuário solicita redução de movimento, quando a aba fica em segundo plano ou quando a intensidade está zerada.

## 9. Validação

O projeto não possui suíte automatizada de testes, build de frontend ou pipeline CI/CD configurada. A verificação mínima local é:

```bash
npm start
curl -fsS http://localhost:3000/healthz
curl -fsS http://localhost:3000/api/stats
curl -fsSI http://localhost:3000/
```

Verifique também, manualmente, a página principal, atualização automática, pausa, atualização manual, abas, histórico, navegação por teclado, responsividade e `prefers-reduced-motion`.

Antes de abrir um Pull Request, confira o checklist deste documento e leia [CONTRIBUTING.md](CONTRIBUTING.md).

## 10. Deploy

O arquivo `render.yaml` descreve um serviço web Node no Render com:

- runtime Node;
- comando de inicialização `npm start`;
- `NODE_ENV=production`;
- `SHOW_HOST_DETAILS=false`;
- `/healthz` como health check.

### Deploy por Blueprint

1. Abra o painel do Render.
2. Selecione **New > Blueprint**.
3. Conecte o repositório do GitHub.
4. Confirme o serviço descrito em `render.yaml`.
5. Aplique a configuração.

### Deploy manual

1. Crie um **Web Service** e selecione o repositório.
2. Escolha o runtime Node.
3. Use `npm start` como comando de inicialização.
4. Defina `/healthz` como Health Check Path.
5. Não fixe manualmente `PORT`; o Render fornece essa variável.

Depois da publicação, confira logs, URL pública, `/`, `/healthz` e `/api/stats`. Esta documentação não declara um deploy como realizado sem URL ou evidência de execução. A comparação com Railway é apenas técnica e não representa um segundo deploy nesta entrega.

## 11. Segurança e limites

O servidor aplica Content Security Policy, `X-Content-Type-Options`, `Referrer-Policy`, validação de caminhos e proteção contra path traversal. A abertura de arquivos usa proteção contra symlink quando suportada pelo sistema.

A aplicação não possui autenticação. Como o painel e a API expõem informações do ambiente, serviços públicos devem evitar `SHOW_HOST_DETAILS=true` e revisar quais métricas podem ser divulgadas.

CORS não é necessário na implementação atual porque o painel consulta a API no mesmo domínio. Se a API for aberta a outro domínio, a origem permitida deve ser definida explicitamente.

Consulte [SECURITY.md](SECURITY.md) para a política de segurança e não publique senhas, tokens, chaves, arquivos `.env` preenchidos, dados pessoais ou detalhes restritos de infraestrutura.

## 12. Conteúdo das aulas

A Aula 7 trata da implementação: coleta de métricas, servidor HTTP, API, interface, execução local e preparação para deploy. O material original da disciplina apresenta uma abordagem geral com Express e CORS, mas a implementação real deste repositório usa o módulo HTTP nativo, sem Express, sem CORS e sem dependências externas de runtime.

A Aula 8 trata da documentação de software: objetivo, escopo, requisitos, arquitetura, API, configuração, processo de validação, deploy, segurança e colaboração. Esses conteúdos foram aplicados ao System Monitor e consolidados nesta pasta.

O PDF original da Aula 8 foi preservado na raiz do repositório como `Aula08-Documentacao-de-Software.pdf`. Ele é material didático de referência; a fonte de verdade sobre o código atual é o repositório e esta documentação consolidada.

## 13. Checklist de revisão

Antes de integrar ou publicar uma alteração, confirme:

- objetivo e escopo correspondem ao código;
- Node.js, comandos, variáveis e porta estão atualizados;
- rotas, métodos, status e campos da API existem;
- limites de CPU, memória, disco e contêiner estão descritos;
- validação local e deploy podem ser reproduzidos;
- nenhuma funcionalidade inexistente aparece como concluída;
- não foram incluídos segredos ou dados sensíveis;
- alterações nos arquivos estáticos preservam as validações do servidor;
- README e esta documentação foram revisados junto com o código;
- o Pull Request registra a validação executada.

## 14. Políticas complementares

- [CONTRIBUTING.md](CONTRIBUTING.md): contribuições, branches, Pull Requests e revisão.
- [SECURITY.md](SECURITY.md): controles, cuidados e relato de vulnerabilidades.
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md): convivência e comunicação.
- [LICENSE](LICENSE): licença do material.

## 15. Resumo conjunto das aulas

O resumo com os objetivos, conteúdos e links oficiais das duas aulas está em [RESUMO_AULAS.md](RESUMO_AULAS.md).
