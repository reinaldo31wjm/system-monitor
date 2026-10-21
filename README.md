# System Monitor

> Painel de observabilidade de servidor em tempo real, com interface **Chuva Cyberpunk**, desenvolvido em Node.js nativo.

[![Node.js](https://img.shields.io/badge/Node.js-18.15%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render&logoColor=111827)](https://render.com/)
[![Licença](https://img.shields.io/badge/licença-projeto%20acadêmico-6366f1)](#licença)

O **System Monitor** apresenta indicadores do ambiente em que está sendo executado, permitindo acompanhar CPU, memória, armazenamento, carga do sistema, uptime e informações do processo Node.js. O projeto foi construído sem Express ou outras dependências de runtime, usando apenas módulos nativos do Node.js.

**Acesso público:** [sistemas-operacionais-pfph.onrender.com](https://sistemas-operacionais-pfph.onrender.com/)

---

## Sumário

- [Visão geral](#visão-geral)
- [Recursos](#recursos)
- [Tecnologias e requisitos](#tecnologias-e-requisitos)
- [Executando localmente](#executando-localmente)
- [Configuração](#configuração)
- [API e health check](#api-e-health-check)
- [Arquitetura e estrutura](#arquitetura-e-estrutura)
- [Documentação técnica](#documentação-técnica)
- [Deploy no Render](#deploy-no-render)
- [Métricas e limitações](#métricas-e-limitações)
- [Documentação da disciplina](#documentação-da-disciplina)
- [Segurança](#segurança)
- [Contribuição](#contribuição)
- [Licença](#licença)

## Visão geral

O sistema foi pensado como um painel simples para diagnóstico e observabilidade. A aplicação coleta métricas no servidor, disponibiliza os dados em JSON e atualiza a interface automaticamente a cada três segundos.

A interface classifica os indicadores em três níveis:

| Nível | Faixa | Interpretação |
| --- | ---: | --- |
| Normal | menor que 60% | Operação dentro do esperado |
| Atenção | de 60% a 84% | Requer acompanhamento |
| Crítico | 85% ou mais | Pode indicar sobrecarga |

> Em serviços hospedados, as métricas representam o contêiner ou ambiente onde o app está rodando — não o computador de quem acessa o painel.

## Recursos

- Monitoramento de CPU, incluindo uso por núcleo e média geral.
- Uso de memória RAM e memória do processo Node.js.
- Armazenamento disponível e percentual utilizado quando o ambiente oferece essa informação.
- Carga do sistema nos intervalos de 1, 5 e 15 minutos.
- Uptime do servidor e da aplicação.
- Informações do host, sistema operacional, arquitetura, versão do Node.js e PID.
- Interfaces de rede e endereços IPv4.
- Aba **Diagnóstico**, com histórico dos últimos três minutos e registro de mudanças de nível.
- Atualização automática, botão de atualização manual, pausa e aviso de falha de conexão.
- Navegação por teclado e suporte a `prefers-reduced-motion`.
- Tema visual Chuva Cyberpunk com chuva em canvas, paralaxe, respingos e cores associadas ao nível de carga.
- Controle de chuva com os modos Garoa, Chuva, Tempestade e Sincronizado.
- Clima do servidor no cabeçalho e anéis de medição com pulso luminoso.

## Tecnologias e requisitos

- **Node.js:** 18.15 ou superior.
- **JavaScript:** CommonJS e APIs nativas do Node.js.
- **Frontend:** HTML, CSS e JavaScript sem framework.
- **Servidor HTTP:** módulo nativo `http`.
- **Deploy:** Render, configurado por `render.yaml`.
- **Dependências externas:** nenhuma para execução da aplicação.

## Executando localmente

Clone o repositório e entre na pasta do projeto:

```bash
git clone <URL_DO_REPOSITÓRIO>
cd Sistemas-Operacionais
```

Como o projeto não possui dependências externas, não é necessário executar `npm install`. Inicie o servidor com:

```bash
npm start
```

Para desenvolvimento, usando o modo de observação do Node.js:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador. Para usar outra porta, defina a variável `PORT`:

```bash
PORT=8080 npm start
```

No Windows PowerShell:

```powershell
$env:PORT=8080; npm start
```

## Configuração

| Variável | Padrão | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `PORT` | `3000` | Não | Porta HTTP usada pelo servidor. O Render fornece esse valor automaticamente. |
| `SHOW_HOST_DETAILS` | `false` | Não | Habilita detalhes adicionais do host. Use apenas em ambientes privados, pois essas informações ficam visíveis aos visitantes. |

Não publique senhas, tokens, chaves de API ou arquivos `.env` com valores reais.

## API e health check

### `GET /`

Entrega o painel web.

### `GET /api/stats`

Retorna as métricas atuais em JSON. Entre os campos disponíveis estão `load1`, `load5`, `load15`, `cores`, `loadPercent`, `usedMem`, `freeMem`, `totalMem`, `memUsagePercent`, `processMem`, `rss`, `uptime` e `disk`.

Exemplo:

```bash
curl http://localhost:3000/api/stats
```

### `GET /healthz`

Verifica se o processo está disponível. É utilizado pelo Render como health check.

```bash
curl http://localhost:3000/healthz
# {"status":"ok"}
```

Os métodos aceitos são `GET` e `HEAD`. Outros métodos retornam `405 Method Not Allowed`.

## Arquitetura e estrutura

A aplicação segue uma arquitetura pequena, modular e orientada a responsabilidades:

```text
Sistemas-Operacionais/
├── server.js                         # Servidor HTTP, rotas e segurança
├── lib/
│   ├── metrics.js                    # Coleta e cache de métricas
│   └── page.js                       # Renderização da página HTML
├── public/
│   ├── css/style.css                 # Identidade visual e layout responsivo
│   └── js/
│       ├── app.js                    # Interface, abas, gráficos e atualizações
│       └── rain.js                   # Animação da chuva em canvas
├── docs/
│   ├── ARQUITETURA.md                # Visão técnica e fluxo de dados
│   ├── DOCUMENTACAO-DE-PROJETO.md    # Objetivo, escopo e requisitos
│   ├── API.md                         # Contrato da API e exemplos
│   ├── PROCESSO-DEVOPS.md            # Validação, revisão e deploy
│   ├── CHECKLIST.md                  # Lista de revisão
│   └── aulas/
│       ├── Aula08-Documentacao-de-Software.pdf
│       └── resumo-aula-08-documentacao-de-software.md
├── package.json                      # Scripts e metadados
├── package-lock.json                 # Integridade do projeto npm
└── render.yaml                       # Blueprint de implantação no Render
```

Para uma descrição técnica do fluxo de dados e das decisões de implementação, consulte [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

## Documentação técnica

Os documentos complementares foram separados por finalidade para facilitar a manutenção e a revisão:

- [`docs/DOCUMENTACAO-DE-PROJETO.md`](docs/DOCUMENTACAO-DE-PROJETO.md): contexto, escopo, requisitos funcionais, requisitos não funcionais e critérios de aceitação.
- [`docs/API.md`](docs/API.md): rotas, métodos, status, campos e exemplos de resposta.
- [`docs/PROCESSO-DEVOPS.md`](docs/PROCESSO-DEVOPS.md): fluxo de desenvolvimento, validação local, revisão e publicação.
- [`docs/CHECKLIST.md`](docs/CHECKLIST.md): conferência antes de integrar ou publicar alterações.

Os documentos distinguem o que está implementado do que permanece fora do escopo. No momento, o projeto não possui suíte automatizada de testes, banco de dados, autenticação ou alertas persistentes.

## Deploy no Render

### Opção A — Blueprint

1. No painel do Render, selecione **New > Blueprint**.
2. Conecte o repositório do GitHub.
3. Confirme o serviço definido em `render.yaml`.
4. Clique em **Apply**.

### Opção B — Web Service manual

1. Crie um **Web Service** e selecione o repositório.
2. Use o runtime **Node**.
3. Utilize `npm start` como comando de inicialização.
4. Defina `/healthz` como **Health Check Path**.
5. Não fixe manualmente a variável `PORT`; o Render fornece esse valor.

Após a publicação, confira os logs e acesse a URL `.onrender.com` gerada pela plataforma.

## Métricas e limitações

- A CPU é calculada a partir de leituras em segundo plano a cada dois segundos.
- As métricas gerais são reaproveitadas por até um segundo; o disco, por até quinze segundos.
- A memória usa o limite do contêiner quando disponível e aplica alternativas compatíveis com Linux e outros ambientes.
- A carga do sistema não está disponível no Windows, pois a API do Node.js retorna zero nesse ambiente.
- O disco pode aparecer como indisponível em contêineres restritos ou versões antigas do Node.js.
- Em ambientes hospedados, a quantidade de núcleos exibida pode corresponder ao host da plataforma.
- O canvas interrompe a animação quando a aba está em segundo plano, quando o usuário solicita redução de movimento ou quando a chuva está em 0%.

## Documentação da disciplina

Os materiais usados para documentar este projeto estão disponíveis em [`docs/aulas/`](docs/aulas/):

- [Aula 08 — Documentação de Software (PDF)](docs/aulas/Aula08-Documentacao-de-Software.pdf)
- [Resumo da Aula 08 (Markdown)](docs/aulas/resumo-aula-08-documentacao-de-software.md)

Esses materiais orientam a documentação do objetivo, escopo, tecnologias, arquitetura, instalação, testes, variáveis de ambiente e deploy do projeto.

## Segurança

O servidor aplica medidas básicas de segurança, incluindo Content Security Policy, `X-Content-Type-Options`, `Referrer-Policy`, proteção contra path traversal, validação de arquivos estáticos, ETag e cache controlado.

Informações sensíveis não devem ser incluídas neste repositório. Em especial, não faça commit de senhas, tokens, chaves de API, arquivos `.env` preenchidos ou detalhes restritos de infraestrutura.

## Contribuição

1. Crie uma branch para sua alteração.
2. Faça a mudança mantendo o escopo do projeto.
3. Execute o servidor localmente e valide `/`, `/api/stats` e `/healthz`.
4. Atualize a documentação quando alterar comportamento, configuração ou estrutura.
5. Abra um Pull Request descrevendo o problema, a solução e como validar.

## Licença

Este repositório é um projeto acadêmico. A reutilização do código deve respeitar a finalidade educacional e os termos definidos pelos responsáveis pelo projeto.
