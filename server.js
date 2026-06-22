const http = require('node:http');
const path = require('node:path');
const { readJson } = require('./utils/readJson');

const PORT = process.env.PORT || 3000;
const SUPPLIERS_FILE = path.join(process.cwd(), 'data', 'suppliers.json');
const DOCUMENTS_FILE = path.join(process.cwd(), 'data', 'documents.json');
const REQUIREMENTS_FILE = path.join(process.cwd(), 'data', 'requirements.json');

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;
  const method = req.method;

  try {
    if (method === 'GET' && pathname === '/') {
      return sendJson(res, 200, {
        message: 'Supplier Docs API',
        routes: ['GET /', 'GET /about', 'GET /suppliers'],
      });
    }

    if (method === 'GET' && pathname === '/about') {
      return sendJson(res, 200, {
        project: 'Supplier documentation training API',
        stack: ['Node.js', 'http', 'fs/promises'],
      });
    }

    if (method === 'GET' && pathname === '/suppliers') {
      const suppliers = await readJson(SUPPLIERS_FILE);
      return sendJson(res, 200, suppliers);
    }
    if (method === 'GET' && pathname === '/documents') {
      const documents = await readJson(DOCUMENTS_FILE);
      const supplierId = url.searchParams.get('supplierId');
    
      if (supplierId) {
        const filteredDocuments = documents.filter(
          (doc) => doc.supplierId === Number(supplierId)
        );
        return sendJson(res, 200, filteredDocuments);
      }
      return sendJson(res, 200, documents);
    }
    return sendJson(res, 404, { error: 'Route introuvable' });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return sendJson(res, 500, { error: 'Erreur interne du serveur' });
  }
});

server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});