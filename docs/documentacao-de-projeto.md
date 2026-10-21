# Documentação de Projeto

## Contexto e objetivo

O System Monitor é um painel web para observar recursos do ambiente em que o servidor está executando. A aplicação coleta métricas do sistema operacional e do processo Node.js, disponibiliza os dados em JSON e apresenta um painel visual com atualização periódica.

O projeto tem finalidade acadêmica e prática: demonstrar como um serviço web pode coletar, organizar e comunicar indicadores operacionais sem depender de um framework de servidor.

## Escopo

### Incluído

- Coleta de CPU, memória, disco, carga do sistema e uptime.
- Exibição da memória usada pelo processo Node.js.
- Consulta das métricas por `GET /api/stats`.
- Painel web responsivo com atualização periódica.
- Histórico de diagnóstico no cliente.
- Endpoint de saúde em `GET /healthz`.
- Servimento de arquivos estáticos com validações básicas.
- Execução local e implantação no Render por `render.yaml`.

### Fora do escopo

- Autenticação e autorização de usuários.
- Armazenamento histórico em banco de dados.
- Alertas por e-mail, webhook ou mensageria.
- Controle remoto do servidor monitorado.
- Garantia de que os dados representem o host físico da plataforma de hospedagem.

## Requisitos funcionais

| ID | Requisito | Critério de aceitação |
| --- | --- | --- |
| RF-01 | Exibir o painel principal | `GET /` retorna uma página HTML com os indicadores do sistema. |
| RF-02 | Disponibilizar métricas em JSON | `GET /api/stats` retorna JSON com timestamp, CPU, memória, uptime e disco. |
| RF-03 | Atualizar a interface | O navegador consulta a API periodicamente e atualiza os indicadores. |
| RF-04 | Permitir atualização manual | O usuário consegue solicitar uma nova atualização pela interface. |
| RF-05 | Permitir pausar atualizações | O usuário consegue pausar e retomar o ciclo automático. |
| RF-06 | Exibir diagnóstico | A aba de diagnóstico apresenta histórico recente de CPU e memória. |
| RF-07 | Informar saúde do serviço | `GET /healthz` retorna `{"status":"ok"}` quando o servidor está ativo. |
| RF-08 | Servir recursos estáticos | CSS e JavaScript de `public/` são entregues com MIME type adequado. |

## Requisitos não funcionais

| ID | Requisito | Critério de aceitação |
| --- | --- | --- |
| RNF-01 | Compatibilidade | A execução requer Node.js 18.15 ou superior. |
| RNF-02 | Reprodutibilidade | A instalação local deve funcionar apenas com o código do repositório e Node.js. |
| RNF-03 | Desempenho | A coleta usa amostragem em segundo plano e cache de curta duração. |
| RNF-04 | Acessibilidade | A interface oferece navegação por teclado e respeita `prefers-reduced-motion`. |
| RNF-05 | Segurança | O servidor aplica CSP, valida caminhos estáticos e não deve expor segredos. |
| RNF-06 | Operação | O serviço aceita a porta fornecida pela variável `PORT` e possui health check. |

## Cenários de uso

### Diagnóstico rápido

Uma pessoa acessa o painel e verifica os níveis de CPU, memória e disco. Em seguida, abre a aba de diagnóstico para observar a evolução recente dos indicadores.

### Integração com hospedagem

A plataforma inicia o serviço com `npm start`, fornece `PORT` e consulta `/healthz` para verificar a disponibilidade da aplicação.

### Integração por script

Um consumidor interno pode consultar `/api/stats` para obter dados atuais em JSON. O projeto não promete retenção histórica; quem precisar de séries temporais deve armazená-las externamente.

## Critérios de qualidade documental

A documentação deve acompanhar alterações de código. Quando uma rota, variável, métrica, requisito ou procedimento de deploy mudar, o README e os documentos relacionados devem ser atualizados.

Nenhuma funcionalidade deve ser descrita como implementada sem evidência no código. Testes automatizados, banco de dados, autenticação e alertas não devem ser adicionados à documentação como se já existissem.

## Relação com a estrutura do repositório

Os artefatos principais do projeto estão organizados da seguinte forma:

- `server.js`: ponto de entrada da aplicação.
- `lib/metrics.js`: coleta e cache das métricas.
- `lib/page.js`: geração do HTML do painel.
- `public/`: assets do frontend.
- `docs/`: documentação técnica e materiais complementares.
- `render.yaml`: configuração de deploy.

