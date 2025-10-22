# Quick Reference

## Project Structure After Migration

```
client/                          # React Frontend
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── lib/
│   ├── contexts/
│   └── ...
├── public/
├── index.html
└── package.json

server/                          # Node.js Backend
├── middleware/
│   ├── postValidation.mjs
│   ├── protectAdmin.mjs
│   └── protectUser.mjs
├── index.js
└── package.json
```

## Command Cheat Sheet

| Command | What it does |
|---------|------------|
| `npm install` | Install dependencies for both client & server |
| `npm run dev` | Start both client (port 5173) and server (port 3000) |
| `npm run client:dev` | Start React dev server only |
| `npm run server:dev` | Start Node.js server only (with --watch) |
| `npm run build` | Build both client and server |
| `npm run lint` | Run ESLint on client code |

## URL References

- **Client**: http://localhost:5173 (Vite dev server)
- **Server**: http://localhost:3000 (Express server)
- **API Health Check**: http://localhost:3000/api/health

## Environment Variables

**Client** (client/.env):
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_KEY=...
VITE_API_URL=http://localhost:3000/api
```

**Server** (server/.env):
```
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

## Initial Setup Steps

1. `npm install` - Install all dependencies
2. Copy `.env.example` → `.env` in both folders
3. Update `.env` files with your configuration
4. `npm run dev` - Start development

## File Organization

- **Don't touch**: `src/` and `public/` at root (duplicates now in client/)
- **Edit instead**: Files in `client/src/` and `server/`
- **Server code**: Stays in `server/` folder
- **Client code**: Stays in `client/src/` folder

## After Migration Cleanup (Optional)

You can delete the old root-level files since they've been copied:
- `src/` (keep `client/src/`)
- `public/` (keep `client/public/`)
- `vite.config.js` (keep `client/vite.config.js`)
- `tailwind.config.js` (keep `client/tailwind.config.js`)
- `eslint.config.js` (keep `client/eslint.config.js`)
- Other root config files that are now in `client/`

## Next: Server Development

Create API routes in `server/index.js`:
```javascript
// Example
app.get('/api/posts', (req, res) => {
  // Handle request
});
```

Update client API calls to use `VITE_API_URL`
