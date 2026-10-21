# Checklist de Revisão

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

