const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Reescribir rutas para API
server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/product/:resource/:id/show': '/:resource/:id',
}));

// Middleware para búsqueda global
server.get('/global-search', (req, res) => {
    const { q } = req.query; // Término de búsqueda
    if (!q) {
        return res.status(400).json({ error: 'El parámetro de búsqueda "q" es obligatorio.' });
    }

    const db = router.db; // Acceso a la base de datos
    const productos = db.get('productos').value(); // Datos de la tabla productos
    const accesorios = db.get('accesorios').value(); // Datos de la tabla accesorios

    // Combinar y filtrar resultados
    const resultados = [
        ...productos.map(item => ({ ...item, tipo: 'producto' })),
        ...accesorios.map(item => ({ ...item, tipo: 'accesorio' })),
    ].filter(item =>
        item.title?.toLowerCase().includes(q.toLowerCase()) ||
        item.categoria?.toLowerCase().includes(q.toLowerCase())
    );

    res.json(resultados);
});

// Usar el enrutador estándar
server.use(router);

// Iniciar el servidor
server.listen(3000, () => {
    console.log('JSON Server is running');
});

// Exportar el servidor
module.exports = server;
