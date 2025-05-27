import express from 'express';
import mysql from 'mysql2/promise';
import nunjucks from 'nunjucks';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'pass1234',
  database: 'paneldb_dump'
});

const servidor = express();
const PUERTO = 3000;

servidor.use(express.json());
servidor.use(express.urlencoded({ extended: true }));
servidor.use(express.static('public'));

nunjucks.configure('views', {
  autoescape: true,
  express: servidor
});

servidor.set('view engine', 'njk');
servidor.set('views', './views');

servidor.get('/', (req, res) => {
  res.render('index.njk', { title: 'Inicio' });
});

servidor.get('/users', async (req, res) => {
  try {
    const [usuarios] = await pool.query('SELECT * FROM users');
    res.render('users.njk', { title: 'Listado de Usuarios', users: usuarios });
  } catch (error) {
    console.error(error);
    res.status(500).send('No se pudieron obtener los usuarios');
  }
});

servidor.get('/chats', async (req, res) => {
  try {
    const [mensajes] = await pool.query(`
      SELECT u.id AS user_id, u.login AS usuario, c.content AS mensaje, c.created_at AS fecha
      FROM users u
      LEFT JOIN chats c ON u.id = c.clientid
      ORDER BY u.id, c.created_at
    `);

    res.render('chats.njk', { title: 'Usuarios y Mensajes', chats: mensajes });
  } catch (error) {
    console.error(error);
    res.status(500).send('No se pudieron obtener los mensajes');
  }
});

servidor.get('/query', (req, res) => {
  res.render('query.njk', { title: 'Consulta SQL' });
});

servidor.post('/query', async (req, res) => {
  const consulta = req.body.sql;
  if (!consulta) {
    return res.status(400).json({ error: 'No se recibió ninguna consulta SQL' });
  }

  try {
    const [resultado] = await pool.query(consulta);
    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al ejecutar la consulta', details: error.message });
  }
});

servidor.listen(PUERTO, () => {
  console.log(`Servidor activo en http://localhost:${PUERTO}`);
});