# Komodo SSR Composer Service

High-performance Vue 3 Server-Side Rendering (SSR) API for the Komodo platform, powered by Bun.serve.

## Architecture

- **Bun.serve**: Native Bun HTTP server for maximum performance
- **Bun**: Ultra-fast JavaScript runtime
- **Vue 3**: Modern reactive framework for component hydration
- **S3/CloudFront**: Static asset delivery (planned integration)

## Features

- **Blazing Fast**: Bun.serve for optimal performance
- **Vue 3 SSR**: Server-side rendering with hydration support
- **Native Bun**: Built-in HTTP server with no build step required
- **TypeScript**: Full type safety across the codebase
- **Docker Support**: Single-stage builds with Bun runtime
- **Linting**: Biome for code quality

## Installation

```bash
bun install
```

## Development

```bash
bun run dev
```

Server runs at `http://localhost:3000`

## Build

No build step required - Bun.serve runs TypeScript directly.

## Preview Production Build

```bash
bun run preview
```

## Docker

### Build and run with Docker Compose

```bash
docker-compose up --build
```

### Build Docker image manually

```bash
docker build -t komodo-ssr-engine-vue .
```

### Run Docker container

```bash
docker run -p 3000:3000 komodo-ssr-engine-vue
```

## Linting

```bash
# Check code
bun run lint

# Fix issues
bun run lint:fix
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: 0.0.0.0)

## Project Structure

```
komodo-ssr-engine-vue/
├── server.ts            # Bun.serve entry point with Vue SSR
├── routes/              # Route handlers (for future expansion)
│   └── index.ts          # Hello World example
├── public/              # Static assets directory
├── docs/                # Documentation
├── tests/               # Test files
├── openapi.yaml         # OpenAPI specification template
├── Dockerfile           # Docker configuration
├── docker-compose.yaml  # Docker Compose configuration
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── biome.json           # Biome linting configuration
```

## License

MIT
