const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router(require('./index.js')()); // Importuje dane z index.js
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(router);

const PORT = 3000; // Port serwera
server.listen(PORT, () => {
    console.log(`JSON Server is running on http://localhost:${PORT}`);
});
