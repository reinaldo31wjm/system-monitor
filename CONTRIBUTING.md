# Como contribuir

Contribuições para o System Monitor podem incluir correções no servidor, melhorias no painel, ajustes de acessibilidade, melhorias de desempenho e atualizações da documentação das Aulas 7 e 8.

## Antes de começar

Leia o `README.md` da raiz e o [README técnico](README.md) desta pasta. Confirme se a alteração pertence ao escopo do projeto e verifique se já existe uma rota, métrica ou componente responsável pelo comportamento que será modificado.

## Fluxo recomendado

1. Leia `README.md` na raiz do repositório e `docs/README.md`.
2. Crie uma branch descritiva, como `docs/melhora-api`, `fix/health-check` ou `feat/metricas-memoria`.
3. Faça uma mudança pequena e focada, preservando a separação entre servidor, coleta, renderização e frontend.
4. Atualize a documentação quando mudar uma rota, métrica, variável ou comportamento visual.
5. Execute a validação local documentada em `docs/README.md`.
6. Abra um Pull Request informando problema, solução, arquivos alterados, riscos e forma de validação.

## Validação mínima

```bash
npm start
curl -fsS http://localhost:3000/healthz
curl -fsS http://localhost:3000/api/stats
curl -fsSI http://localhost:3000/
```

Quando houver alteração na interface, verifique também atualização automática, pausa, atualização manual, abas, histórico, teclado, responsividade e `prefers-reduced-motion`.

## Checklist do Pull Request

- [ ] As instruções continuam reproduzíveis.
- [ ] Rotas, campos e exemplos correspondem ao código.
- [ ] A alteração foi validada localmente.
- [ ] Não foram incluídos segredos, dados pessoais ou detalhes desnecessários do host.
- [ ] Os documentos relacionados foram atualizados.
- [ ] Funcionalidades não implementadas não foram descritas como prontas.
- [ ] A validação de arquivos estáticos e os headers de segurança foram preservados.
- [ ] Alterações visuais consideram teclado e redução de movimento.

O projeto não possui suíte automatizada de testes, build de frontend ou pipeline CI/CD. Por isso, o Pull Request deve registrar os comandos executados e o resultado da inspeção manual do painel.

## Mensagem do Pull Request

Descreva o problema, a solução, os arquivos afetados, riscos conhecidos e comandos usados na validação. Se o comportamento depender de cloud, informe claramente se houve deploy real ou apenas preparação local.
