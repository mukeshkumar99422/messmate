import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawBackendUrl = import.meta.env.VITE_BACKEND_URL;
const backendOrigin = rawBackendUrl ? new URL(rawBackendUrl).origin : '';
if (!backendOrigin) {
  console.warn('VITE_BACKEND_URL not set — CSP connect-src will only allow same-origin.');
}

//setting up content security policy header for vercel.json
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
  "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
  "img-src 'self' data: https:",
  `connect-src 'self' ${backendOrigin || ''}`.trim(),
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join('; ');

const configPath = path.join(__dirname, '..', 'vercel.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

config.headers[0].headers.find(h => h.key === 'Content-Security-Policy').value = csp;

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));