# Personal Blog - Monorepo Setup Guide

This project is now organized as a monorepo with separate `client` and `server` folders.

## Project Structure

```
personal-blog/
├── client/              # React frontend (Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── server/              # Node.js backend
│   ├── middleware/
│   ├── package.json
│   └── ...
├── package.json         # Root workspace config
└── ...
```

## Quick Start

### Install Dependencies

```bash
npm install
```

This will install dependencies for both client and server workspaces.

### Development

Run both client and server in development mode:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1: Run only client
npm run client:dev

# Terminal 2: Run only server
npm run server:dev
```

### Build

```bash
npm run build
```

### Client Commands

Navigate to the client folder or use workspace commands:

```bash
npm run client:dev
npm run client:build
npm run lint
```

### Server Commands

```bash
npm run server:dev
npm run server:start
```

## Dependencies

### Client
- React 18.3.1
- React Router DOM
- Tailwind CSS
- Supabase JS
- Vite

### Server
- Express
- CORS
- dotenv

## File Organization

- **Middleware**: All Express middleware files are in `server/middleware/`
- **Services**: Client-side services remain in `client/src/services/`
- **Components**: React components remain in `client/src/components/`

## Next Steps

1. Set up the server entry point (`server/index.js`)
2. Configure environment variables (`.env` files)
3. Move any server-side services from client/src/services to server/services
4. Update API client to point to the correct server endpoint

## Notes

- The project uses npm workspaces for monorepo management
- Both client and server run independently but can be started together
- The root `package.json` contains shared scripts for convenience
