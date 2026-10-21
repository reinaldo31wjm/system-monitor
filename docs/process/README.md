# Processo de desenvolvimento e deploy

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

As alterações devem ser pequenas e manter a separação entre servidor, coleta de métricas, renderização e frontend. Mudanças de comportamento precisam atualizar a documentação relevante.

## Git e pull requests

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

Não há etapa de compilação nem dependências externas de runtime. O comando `npm start` executa diretamente `server.js`. O `package-lock.json` mantém a estrutura do projeto npm, mesmo sem pacotes externos de aplicação.

## Deploy

O arquivo `render.yaml` descreve o serviço para implantação no Render. O processo deve usar `npm start`, aceitar a variável `PORT` fornecida pela plataforma e configurar `/healthz` como health check.

Depois do deploy, a validação deve incluir:

1. Conferência dos logs de inicialização.
2. Acesso à página principal.
3. Consulta de `/healthz`.
4. Consulta de `/api/stats`.
5. Verificação visual do painel.

## Evidências e limites

Um deploy só deve ser descrito como realizado quando houver uma URL ou registro de execução que o comprove. A documentação deste projeto descreve o procedimento e o endpoint configurado, mas não substitui a verificação real da implantação.

# Checklist de revisão

Use esta lista antes de integrar alterações ou publicar uma nova versão.

## Projeto e requisitos

- [ ] O objetivo do sistema está explicado em linguagem direta.
- [ ] O escopo informa o que está incluído e o que está fora do projeto.
- [ ] Os requisitos funcionais possuem critérios verificáveis.
- [ ] Os requisitos não funcionais estão relacionados a decisões reais do código.
- [ ] Funcionalidades não implementadas não são apresentadas como concluídas.

## Execução

- [ ] A versão mínima do Node.js está informada.
- [ ] Os comandos de instalação e execução podem ser copiados.
- [ ] As variáveis de ambiente possuem descrição, padrão e finalidade.
- [ ] O comportamento da porta em hospedagem está explicado.

## API e operação

- [ ] As rotas documentadas existem no servidor.
- [ ] Métodos, status e exemplos de resposta estão coerentes.
- [ ] O health check está documentado.
- [ ] As limitações das métricas estão registradas.
- [ ] O procedimento de validação local foi atualizado.

## Segurança

- [ ] Não há senhas, tokens, chaves privadas ou dados pessoais reais.
- [ ] Exemplos de configuração usam valores fictícios.
- [ ] Informações de host são tratadas como potencialmente sensíveis.
- [ ] Alterações em arquivos estáticos preservam as validações do servidor.

## Deploy e manutenção

- [ ] O procedimento de deploy corresponde ao `render.yaml`.
- [ ] Logs, health check e URL de produção são verificados quando aplicável.
- [ ] O README aponta para os documentos complementares.
- [ ] A estrutura de diretórios está atualizada.
- [ ] A documentação foi revisada junto com o código alterado.

## Documentação relacionada

- [Visão geral do projeto](../overview/README.md)
- [Arquitetura do sistema](../architecture/README.md)
- [Documentação da API](../api/README.md)
