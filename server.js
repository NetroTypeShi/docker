const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'diego',
    password: 'secret1234',
    database: 'mydb'
});

app.use(express.urlencoded({ extended: false }));

// Conexión a la base de datos
db.connect(error => {
    if (error) {
        console.error('No se pudo conectar a la base de datos:', error.message);
        process.exit(1);
    }
    console.log('Base de datos conectada correctamente');
});

// Página principal
app.get('/', (_req, res) => {
    res.send(`
        <h2>Bienvenido al sistema de mensajes</h2>
        <nav>
            <a href="/mensaje/nuevo">Crear mensaje</a> |
            <a href="/mensajes/lista">Ver mensajes</a>
        </nav>
    `);
});

// Formulario para crear un mensaje
app.get('/mensaje/nuevo', (_req, res) => {
    res.send(`
        <h3>Nuevo mensaje</h3>
        <form method="POST" action="/mensaje/guardar">
            <textarea name="mensaje" rows="5" cols="40" placeholder="Escribe tu mensaje aquí..." required></textarea><br>
            <input type="submit" value="Enviar">
        </form>
        <a href="/">Volver al inicio</a>
    `);
});

// Guardar mensaje en la base de datos
app.post('/mensaje/guardar', (req, res) => {
    const texto = req.body.mensaje;
    if (!texto || texto.trim() === '') {
        return res.status(400).send('Por favor, escribe un mensaje antes de enviar.<br><a href="/mensaje/nuevo">Volver</a>');
    }
    const sql = 'INSERT INTO mensajes (mensaje) VALUES (?)';
    db.query(sql, [texto], (err) => {
        if (err) {
            console.error('No se pudo guardar el mensaje:', err.message);
            return res.status(500).send('Error al guardar el mensaje');
        }
        res.send('¡Mensaje guardado! <a href="/mensaje/nuevo">Agregar otro</a> | <a href="/mensajes/lista">Ver todos</a>');
    });
});

// Mostrar todos los mensajes
app.get('/mensajes/lista', (_req, res) => {
    const sql = 'SELECT * FROM mensajes ORDER BY fecha DESC';
    db.query(sql, (err, filas) => {
        if (err) {
            console.error('Error al recuperar los mensajes:', err.message);
            return res.status(500).send('No se pudieron obtener los mensajes');
        }
        let tabla = `
            <h2>Listado de mensajes</h2>
            <table border="1" cellpadding="5">
                <tr><th>ID</th><th>Mensaje</th><th>Fecha</th></tr>
        `;
        filas.forEach(fila => {
            tabla += `<tr><td>${fila.id}</td><td>${fila.mensaje}</td><td>${fila.fecha}</td></tr>`;
        });
        tabla += `</table><br><a href="/">Inicio</a> | <a href="/mensaje/nuevo">Nuevo mensaje</a>`;
        res.send(tabla);
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});