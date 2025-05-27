const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// Configuración de la conexión a MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'diego',
  password: 'secret1234',
  database: 'mydb'
});

// Middleware para procesar datos POST
app.use(express.urlencoded({ extended: true }));

// Conexión a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1);
  }
  console.log('Conexión exitosa a la base de datos');
});

// Ruta para el endpoint raíz
app.get('/', (req, res) => {
    res.send(`
        <h1>Bienvenido al servidor de mensajes</h1>
        <p>Usa los siguientes enlaces para navegar:</p>
        <ul>
            <li><a href="/nuevo-mensaje">Escribir un nuevo mensaje</a></li>
            <li><a href="/mensajes">Ver todos los mensajes</a></li>
        </ul>
    `);
});

// Ruta para mostrar el formulario
app.get('/nuevo-mensaje', (req, res) => {
    res.send(`
        <form action="/guardar-mensaje" method="POST">
            <label for="mensaje">Escribe tu mensaje:</label><br>
            <textarea id="mensaje" name="mensaje" rows="4" cols="50" required></textarea><br><br>
            <button type="submit">Guardar mensaje</button>
        </form>
    `);
});

// Ruta para guardar mensajes
app.post('/guardar-mensaje', (req, res) => {
    const { mensaje } = req.body;

    if (!mensaje) {
        return res.status(400).send('El mensaje no puede estar vacío');
    }

    const query = 'INSERT INTO mensajes (mensaje) VALUES (?)';
    connection.query(query, [mensaje], (err, result) => {
        if (err) {
            console.error('Error al guardar el mensaje:', err);
            return res.status(500).send('Error al guardar el mensaje');
        }

        res.send('Mensaje guardado exitosamente. <a href="/nuevo-mensaje">Escribir otro mensaje</a>');
    });
});

// Ruta para mostrar los mensajes
app.get('/mensajes', (req, res) => {
    const query = 'SELECT * FROM mensajes ORDER BY fecha DESC';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los mensajes:', err);
            return res.status(500).send('Error al obtener los mensajes');
        }

        let html = `
            <h1>Mensajes</h1>
            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Mensaje</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
        `;

        results.forEach(row => {
            html += `
                <tr>
                    <td>${row.id}</td>
                    <td>${row.mensaje}</td>
                    <td>${row.fecha}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
            <br>
            <a href="/nuevo-mensaje">Escribir un nuevo mensaje</a>
        `;

        res.send(html);
    });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Express escuchando en http://localhost:${port}`);
});