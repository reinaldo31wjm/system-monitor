# Documentação do projeto

Esta documentação foi reorganizada em pastas com `README.md` para facilitar navegação, revisão e manutenção do projeto.

## Índice rápido

- [Visão geral do projeto](overview/README.md)
- [Arquitetura do sistema](architecture/README.md)
- [Documentação da API](api/README.md)
- [Processo de desenvolvimento e deploy](process/README.md)
- [Checklist de revisão](process/README.md#checklist-de-revisão)
- [Materiais de referência](references/README.md)

## Estrutura sugerida

```text
system-monitor/
├── README.md
├── docs/
│   ├── README.md
│   ├── overview/
│   │   └── README.md
│   ├── architecture/
│   │   └── README.md
│   ├── api/
│   │   └── README.md
│   ├── process/
│   │   └── README.md
│   └── references/
│       ├── README.md
│       └── aulas/
│           └── README.md
└── ...
```

## Como usar

- Comece pelo [README principal](../README.md) para ter visão geral do projeto.
- Use a pasta `overview` para contexto, escopo e requisitos.
- Use a pasta `architecture` para fluxo de dados, módulos e decisões técnicas.
- Use a pasta `api` para rotas, parâmetros e exemplos de uso.
- Use a pasta `process` para desenvolvimento, validação, deploy e revisão.
- Use a pasta `references` para materiais de apoio e documentação da disciplina.

A organização por pasta evita que o repositório fique com uma única página muito longa e facilita futuras expansões.
