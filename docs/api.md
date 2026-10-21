# Documentação da API

A API do System Monitor é HTTP, não possui autenticação e foi desenhada para uso local, integração com o painel e verificações básicas de disponibilidade.

## Regras gerais

- Métodos aceitos: `GET` e `HEAD`.
- Respostas JSON usam `Content-Type: application/json; charset=utf-8`.
- Rotas desconhecidas retornam `404`.
- Métodos diferentes de `GET` e `HEAD` retornam `405`.
- As métricas não são persistidas pelo servidor.

## `GET /healthz`

Indica se o processo está ativo.

### Resposta de sucesso — `200 OK`

```json
{"status":"ok"}
```

## `GET /api/stats`

Retorna um retrato das métricas disponíveis no momento da consulta.

### Resposta de sucesso — `200 OK`

Exemplo reduzido:

```json
{
  "timestamp": 1720000000000,
  "serverTime": "03/07/2024, 12:00:00 BRT",
  "uptime": "0h 12m 34s",
  "processUptime": "0h 12m 30s",
  "loadSupported": true,
  "load1": "0.42",
  "load5": "0.37",
  "load15": "0.31",
  "cores": [12, 8, 10],
  "loadPercent": 10,
  "usedMem": 512,
  "freeMem": 1536,
  "totalMem": 2048,
  "memUsagePercent": 25,
  "memSource": "cgroup",
  "processMem": "18.20",
  "rss": "42.5",
  "disk": {
    "available": true,
    "totalGB": "10.7",
    "usedGB": "2.1",
    "percent": 20
  }
}
```

### Campos principais

- `timestamp`: instante da coleta em milissegundos desde Unix Epoch.
- `serverTime`: data e hora formatadas no servidor.
- `uptime`: tempo de atividade do sistema operacional.
- `processUptime`: tempo de atividade do processo Node.js.
- `loadSupported`: indica se a carga do sistema é suportada pelo ambiente.
- `load1`, `load5`, `load15`: médias de carga nos últimos 1, 5 e 15 minutos.
- `cores`: percentual aproximado de uso de cada núcleo.
- `loadPercent`: média aproximada do uso dos núcleos.
- `usedMem`, `freeMem`, `totalMem`: memória em MB.
- `memUsagePercent`: percentual de memória utilizada.
- `memSource`: origem usada para calcular a memória, como `cgroup`, `meminfo` ou `os`.
- `processMem`: heap utilizado pelo processo Node.js, em MB.
- `rss`: Resident Set Size do processo, em MB.
- `disk`: disponibilidade, capacidade, uso e percentual do armazenamento.

Quando não é possível obter dados do disco, `disk.available` é `false` e os campos de capacidade ficam nulos.

## Exemplos de verificação

```bash
curl -i http://localhost:3000/healthz
curl -i http://localhost:3000/api/stats
curl -I http://localhost:3000/
```

## Limites de interpretação

A API informa o ambiente de execução do processo. Em contêineres, os valores podem refletir limites do contêiner ou características do host da plataforma. Os dados são observacionais e não devem ser tratados como medição de hardware físico.

A documentação do sistema deve ser consultada junto com o código para compreender melhor o contexto de cada métrica.

