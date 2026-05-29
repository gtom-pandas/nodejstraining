const http = require('node:http');
const path = require('node:path');
const { readJson } = require('./utils/readJson');
const { writeJson } = require('./utils/writeJson');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function sendText(res, statusCode, message) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(message);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (error) {
        reject(new Error('JSON invalide'));
      }
    });

    req.on('error', (error) => {
      reject(error);
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;
  const method = req.method;

  try {
    if (method === 'GET' && pathname === '/') {
      return sendJson(res, 200, {
        message: 'Bienvenue sur mon API Node.js',
        routes: ['GET /', 'GET /about', 'GET /products', 'GET /products/:id', 'POST /products'],
      });
    }

    if (method === 'GET' && pathname === '/about') {
      return sendJson(res, 200, {
        project: 'Mini API Node.js',
        author: 'toi',
        stack: ['Node.js', 'http', 'fs/promises'],
      });
    }

    if (method === 'GET' && pathname === '/products') {
      const products = await readJson(DATA_FILE);
      return sendJson(res, 200, products);
    }

    if (method === 'GET' && pathname.startsWith('/products/')) {
      const id = Number(pathname.split('/')[2]);
      const products = await readJson(DATA_FILE);
      const product = products.find((item) => item.id === id);

      if (!product) {
        return sendJson(res, 404, { error: 'Produit introuvable' });
      }

      return sendJson(res, 200, product);
    }

    if (method === 'POST' && pathname === '/products') {
      const body = await parseBody(req);

      if (!body.name || typeof body.price !== 'number' || !body.category) {
        return sendJson(res, 400, {
          error: 'Champs requis: name, price(number), category',
        });
      }

      const products = await readJson(DATA_FILE);

      const newProduct = {
        id: products.length ? products[products.length - 1].id + 1 : 1,
        name: body.name,
        price: body.price,
        category: body.category,
      };

      products.push(newProduct);
      await writeJson(DATA_FILE, products);

      return sendJson(res, 201, newProduct);
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