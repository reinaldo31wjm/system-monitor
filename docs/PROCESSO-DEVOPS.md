# Processo de Desenvolvimento e Deploy

## Fluxo recomendado

```text
Branch de trabalho
        │
        ▼
Alteração de código e documentação
        │
        ▼
Validação local
        │
        ▼
Pull Request e revisão
        │
        ▼
Integração na branch principal
        │
        ▼
Deploy no Render
        │
        ▼
Health check e inspeção dos logs
```

## Desenvolvimento

As alterações devem ser pequenas e manter a separação entre servidor, coleta de métricas, renderização e frontend. Mudanças de comportamento precisam atualizar o README ou um documento específico em `docs/`.

## Git e Pull Requests

Recomenda-se criar uma branch por alteração, usar commits com mensagens objetivas e abrir um Pull Request com quatro informações: problema, solução, arquivos afetados e forma de validação.

Antes da integração, a revisão deve conferir se:

- as instruções continuam reproduzíveis;
- os endpoints documentados existem;
- variáveis de ambiente estão corretas;
- não há segredos ou dados sensíveis;
- mudanças de interface foram refletidas na documentação;
- o escopo do Pull Request está claro.

## Validação local

O projeto não possui uma suíte automatizada de testes configurada. A validação mínima atual é executar o servidor e verificar as rotas principais:

```bash
npm start
curl -fsS http://localhost:3000/healthz
curl -fsS http://localhost:3000/api/stats
curl -fsSI http://localhost:3000/
```

Também é recomendado abrir o painel no navegador e verificar atualização automática, pausa, navegação pelas abas e comportamento com redução de movimento.

## Build e dependências

Não há etapa de compilação nem dependências externas de runtime. O comando `npm start` executa diretamente `server.js`. O `package-lock.json` mantém a estrutura do projeto npm, mesmo sem pacotes adicionais.

## Deploy

O arquivo `render.yaml` descreve o serviço para implantação no Render. O processo deve usar `npm start`, aceitar a variável `PORT` fornecida pela plataforma e configurar `/healthz` como health check.

Depois do deploy, a validação deve incluir:

1. Conferência dos logs de inicialização.
2. Acesso à página principal.
3. Consulta de `/healthz`.
4. Consulta de `/api/stats`.
5. Verificação visual do painel.

## Evidências e limites

Um deploy só deve ser descrito como realizado quando houver uma URL ou registro de execução que o comprove. A documentação deste projeto descreve o procedimento e o endpoint configurado, mas não substitui os registros da plataforma de hospedagem.
