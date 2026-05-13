# ALTHR Terminal Backend
Centrally managed API orchestration and data normalization layer.

## Setup
1. `npm install`
2. Create/edit `.env` with your API keys.
3. `npm start`

## Endpoints
- `GET /api/crypto/top`: Normalized crypto prices.
- `GET /api/forex/latest`: Latest currency exchange rates.
- `GET /api/news`: Aggregated financial news feed.
- `GET /api/equities/quote?symbol=AAPL`: Stock price quote.
- `GET /api/macro/indicator`: World Bank economic data.
- `GET /api/portfolio`: Persistent wealth tracking.
- `GET /api/stats`: Real-time API budget monitor.

## Architecture
- **Services**: Each file handles a specific API provider or sector.
- **Lib**: Core logic for caching (TTL), rate-limiting (daily budgets), and persistence (JSON DB).
- **Security**: All external keys are kept on the server and never leaked to the client.
