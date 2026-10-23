# Política de segurança

O System Monitor expõe métricas operacionais do ambiente de execução. Essas informações podem revelar características do host, da rede ou do processo e devem ser tratadas como potencialmente sensíveis. Qualquer problema deve ser tratado com responsabilidade, sem publicar dados sensíveis.

## Controles existentes

- Content Security Policy;
- `X-Content-Type-Options`;
- `Referrer-Policy`;
- validação de caminhos para arquivos estáticos;
- proteção contra path traversal e symlink quando suportada pelo sistema;
- `Cache-Control: no-store` na API;
- `SHOW_HOST_DETAILS=false` por padrão;
- ausência de credenciais embutidas no código.

Esses controles reduzem riscos, mas não substituem autenticação, firewall, revisão de dependências ou configuração segura da plataforma de hospedagem.

## Dados que merecem cuidado

O painel pode mostrar hostname, IP, interfaces, sistema operacional, arquitetura, porta, PID e informações de memória do processo. Em cloud, alguns valores podem ser internos do contêiner, mas ainda assim devem ser divulgados somente quando necessário.

Não inclua senhas, tokens, chaves, arquivos `.env` preenchidos, dados pessoais ou detalhes restritos de infraestrutura no repositório. Avalie com cuidado o uso de `SHOW_HOST_DETAILS` em serviços públicos. Não teste vulnerabilidades em sistemas sem autorização.

## API e exposição pública

A API não possui autenticação e foi projetada para uso local, integração com o painel e verificações simples de disponibilidade. Como `/api/stats` pode revelar informações operacionais, avalie a exposição pública antes de usar o serviço em produção.

CORS não está habilitado porque o painel e a API usam o mesmo domínio. Se um consumidor externo for necessário, defina uma lista restrita de origens, métodos e headers antes de liberar o acesso. Não adicione `Access-Control-Allow-Origin: *` sem avaliar o impacto.

## Como relatar

Não publique detalhes exploráveis ou credenciais em Issues, Pull Requests ou discussões abertas. Use um relato privado pelo recurso de segurança do GitHub ou entre em contato com a pessoa responsável pelo repositório.

Inclua, quando possível, impacto, ambiente afetado, versão ou commit, passos seguros para reproduzir e uma sugestão de correção. Remova tokens, senhas e dados pessoais antes de enviar evidências.

Após a correção, registre a mudança sem expor detalhes que facilitem exploração antes que os ambientes derivados sejam atualizados.

## Escopo e limitações

Esta política cobre o código, o frontend, a API, a documentação e a configuração de deploy do System Monitor. Ela não garante a segurança da conta do GitHub, do Render, da rede ou de ambientes derivados. Cada implantação deve revisar seus próprios riscos e controles.
