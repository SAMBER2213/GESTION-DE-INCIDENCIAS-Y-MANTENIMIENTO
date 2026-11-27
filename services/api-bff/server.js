const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const CLAVE_INTERNA = process.env.CLAVE_INTERNA || '';

const SERVICIOS = {
  usuarios: process.env.URL_MS_USUARIOS || 'http://ms-usuarios:3001',
  incidencias: process.env.URL_MS_INCIDENCIAS || 'http://ms-incidencias:3002',
  proveedores: process.env.URL_MS_PROVEEDORES || 'http://ms-proveedores:3003',
  finanzas: process.env.URL_MS_FINANZAS || 'http://ms-finanzas:3004',
  comunicaciones: process.env.URL_MS_COMUNICACIONES || 'http://ms-comunicaciones:3005',
};

const app = express();
app.use(express.json());

async function pedir(servicio, ruta) {
  const cabeceras = CLAVE_INTERNA ? { 'x-clave-interna': CLAVE_INTERNA } : {};
  const respuesta = await fetch(SERVICIOS[servicio] + ruta, { headers: cabeceras, signal: AbortSignal.timeout(3000) });
  if (!respuesta.ok) throw new Error(`${servicio} respondio ${respuesta.status}`);
  return respuesta.json();
}

app.get('/api/ping', (req, res) => {
  res.json({ servicio: 'api-bff', estado: 'ok' });
});

// Revisa la salud de todos los microservicios
app.get('/api/health', async (req, res) => {
  const nombres = Object.keys(SERVICIOS);
  const resultados = await Promise.allSettled(nombres.map((nombre) => pedir(nombre, '/health')));
  const servicios = {};
  nombres.forEach((nombre, i) => {
    servicios[nombre] = resultados[i].status === 'fulfilled' ? 'ok' : 'error';
  });
  const todoBien = Object.values(servicios).every((estado) => estado === 'ok');
  res.status(todoBien ? 200 : 503).json({ servicio: 'api-bff', estado: todoBien ? 'ok' : 'degradado', servicios });
});

// Lectura simple: reenvia la consulta al microservicio dueño del dato
app.get('/api/incidencias', async (req, res) => {
  try {
    res.json(await pedir('incidencias', '/incidencias'));
  } catch (error) {
    res.status(502).json({ error: 'No se pudo consultar ms-incidencias' });
  }
});

// Lectura compuesta: junta datos de tres microservicios (los microservicios no se llaman entre si)
app.get('/api/resumen', async (req, res) => {
  const [incidencias, gastos, avisos] = await Promise.allSettled([
    pedir('incidencias', '/incidencias'),
    pedir('finanzas', '/gastos'),
    pedir('comunicaciones', '/avisos'),
  ]);
  const valor = (r) => (r.status === 'fulfilled' ? r.value : null);
  const i = valor(incidencias);
  const g = valor(gastos);
  const a = valor(avisos);
  res.json({
    total_incidencias: i ? i.length : null,
    incidencias_pendientes: i ? i.filter((x) => x.estado === 'Pendiente').length : null,
    gasto_total: g ? g.reduce((suma, x) => suma + Number(x.monto || 0), 0) : null,
    avisos_publicados: a ? a.length : null,
  });
});

// El frontend se sirve como archivos estaticos (carpeta public)
const publico = path.join(__dirname, 'public');
if (fs.existsSync(publico)) app.use(express.static(publico));

app.listen(PORT, () => console.log(`api-bff escuchando en el puerto ${PORT}`));
