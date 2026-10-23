# Política de segurança

O System Monitor expõe métricas operacionais do ambiente de execução. Qualquer problema de segurança deve ser tratado com responsabilidade, sem publicar dados sensíveis.

## Controles existentes

- Content Security Policy;
- `X-Content-Type-Options`;
- `Referrer-Policy`;
- validação de caminhos para arquivos estáticos;
- abertura de arquivos com proteção contra symlink quando disponível;
- `SHOW_HOST_DETAILS=false` por padrão;
- ausência de autenticação, credenciais e persistência no código.

Esses controles reduzem riscos, mas não substituem autenticação, firewall, revisão de dependências ou configuração segura da plataforma de hospedagem.

## Cuidados no uso

- não inclua senhas, tokens, chaves ou arquivos `.env` no repositório;
- avalie o uso de `SHOW_HOST_DETAILS` em serviços públicos;
- não exponha detalhes de infraestrutura sem necessidade;
- não teste vulnerabilidades em sistemas sem autorização;
- não divulgue publicamente detalhes exploráveis antes de uma correção.

A API é consumida pelo painel no mesmo domínio. Se for necessário acesso a partir de outro domínio, defina uma política CORS restrita antes de habilitá-lo.

## Como relatar

Abra um relato privado pelo recurso de segurança do GitHub ou entre em contato com a pessoa responsável pelo repositório. Inclua impacto, ambiente afetado e passos seguros para reproduzir o problema, sem enviar credenciais reais.

## Escopo

Esta política cobre o código, a documentação e a configuração de deploy do System Monitor. Ambientes derivados devem definir sua própria política e revisar seus riscos antes de uso em produção.
