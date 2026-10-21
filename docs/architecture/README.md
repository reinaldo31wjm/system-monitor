# Arquitetura do System Monitor

## Objetivo

O System Monitor é uma aplicação web compacta para observar recursos do ambiente de execução. O servidor coleta métricas do sistema operacional e do processo Node.js, enquanto o navegador organiza e comunica esses dados visualmente.

## Fluxo principal

```text
Sistema operacional
        │
        ▼
lib/metrics.js ── coleta, normalização e cache
        │
        ▼
server.js ─────── rotas HTTP e headers de segurança
        │
        ├── GET /api/stats ──► JSON de métricas
        ├── GET /healthz ────► status do serviço
        └── GET / ───────────► página HTML
                                  │
                                  ▼
                         public/js/app.js
                                  │
                                  ├── atualização periódica
                                  ├── histórico e diagnóstico
                                  └── gráficos e indicadores

                         public/js/rain.js
                                  │
                                  ▼
                         animação visual em canvas
```

## Responsabilidades dos módulos

### `server.js`

É o ponto de entrada da aplicação. Cria o servidor HTTP nativo, valida métodos e URLs, encaminha as rotas, entrega arquivos estáticos e aplica cabeçalhos como Content Security Policy, `X-Content-Type-Options` e `Referrer-Policy`.

### `lib/metrics.js`

Centraliza a coleta das métricas. Calcula uso de CPU por núcleo, memória, carga do sistema, armazenamento, uptime, memória do processo e interfaces de rede. A coleta da CPU acontece em segundo plano, com cache de curta duração para reduzir a sobrecarga do sistema.

### `lib/page.js`

Gera o HTML inicial do painel. A separação da renderização permite que o servidor entregue a página sem depender de um framework frontend.

### `public/js/app.js`

Controla a experiência do usuário no navegador: chamadas à API, atualização automática, pausa, abas, histórico de diagnóstico, classificação dos níveis e renderização dos indicadores.

### `public/js/rain.js`

Implementa o efeito visual da chuva em `canvas`, com camadas de paralaxe, velocidade, densidade, vento e sincronização com a carga observada.

### `public/css/style.css`

Define a identidade visual Chuva Cyberpunk, o layout responsivo, estados de normalidade, atenção e criticidade, além dos estados de foco para navegação por teclado.

## Decisões técnicas

- **Node.js nativo:** reduz a superfície de dependências e facilita a execução em ambientes educacionais e de hospedagem.
- **API JSON simples:** separa coleta de dados e apresentação, permitindo testar as métricas sem abrir a interface.
- **Cache curto:** evita que cada visitante provoque uma nova leitura do sistema.
- **Servidor vinculado a `0.0.0.0`:** permite execução local e publicação em plataformas como o Render.
- **Arquivos estáticos com validação:** reduz riscos de path traversal e evita servir arquivos fora de `public/`.
- **Acessibilidade e desempenho:** a interface respeita teclado e `prefers-reduced-motion`; a animação é interrompida quando não é necessária.

## Contrato mínimo da API

- `GET /api/stats` retorna um objeto JSON com timestamp, uptime, carga, CPU, memória, processo e disco.
- `GET /healthz` retorna `{"status":"ok"}` quando o processo está ativo.

## Segurança e privacidade

O projeto não utiliza credenciais para coletar as métricas. Ainda assim, detalhes do host podem revelar informações do ambiente e, por isso, `SHOW_HOST_DETAILS` permanece desativado por padrão. O servidor também aplica restrições de arquivo estático e cabeçalhos que reduzem a exposição de conteúdo e a execução de scripts em contextos indevidos.

## Observações de operação

A coleta é dependente do ambiente de execução. Em contêineres, por exemplo, a memória e a CPU podem refletir limites do próprio ambiente e não necessariamente o host físico.

Esse comportamento é parte da interpretação das métricas e da operação do serviço.

## Documentação relacionada

- [Visão geral do projeto](../overview/README.md)
- [Documentação da API](../api/README.md)
- [Processo de desenvolvimento](../process/README.md)
