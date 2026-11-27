const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const semilla = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed.json'), 'utf8'));

const PORT = process.env.PORT || config.puerto;
const MONGODB_URI = process.env.MONGODB_URI || `mongodb://localhost:27017/${config.baseDeDatos}`;
const CLAVE_INTERNA = process.env.CLAVE_INTERNA || '';

// Modelo de la entidad principal del servicio (esquema flexible en este esqueleto inicial)
const esquema = new mongoose.Schema(
  {},
  { strict: false, timestamps: { createdAt: 'creado_en', updatedAt: 'actualizado_en' } }
);
const Modelo = mongoose.model(config.recurso, esquema, config.recurso);

const app = express();
app.use(express.json());

// Comprobacion rapida: el servicio esta vivo
app.get('/ping', (req, res) => {
  res.json({ servicio: config.nombre, estado: 'ok' });
});

// Comprobacion profunda: ademas verifica la conexion con la base de datos
app.get('/health', async (req, res) => {
  try {
    await mongoose.connection.db.command({ ping: 1 });
    res.json({ servicio: config.nombre, estado: 'ok', baseDeDatos: 'ok', fecha: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ servicio: config.nombre, estado: 'error', baseDeDatos: 'sin conexion' });
  }
});

// Si se define CLAVE_INTERNA, solo se atienden peticiones que la envien (ver ADR-0013)
app.use((req, res, next) => {
  if (!CLAVE_INTERNA || req.get('x-clave-interna') === CLAVE_INTERNA) return next();
  res.status(401).json({ error: 'Clave interna invalida' });
});

function baseLista(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Base de datos no disponible todavia' });
  }
  next();
}

app.get(`/${config.recurso}`, baseLista, async (req, res) => {
  try {
    const datos = await Modelo.find({}).sort({ _id: 1 }).limit(100).lean();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar' });
  }
});

app.get(`/${config.recurso}/:id`, baseLista, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Identificador invalido' });
  }
  try {
    const dato = await Modelo.findById(req.params.id).lean();
    if (!dato) return res.status(404).json({ error: 'No encontrado' });
    res.json(dato);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar' });
  }
});

app.post(`/${config.recurso}`, baseLista, async (req, res) => {
  const faltantes = config.camposRequeridos.filter(
    (campo) => req.body[campo] === undefined || req.body[campo] === ''
  );
  if (faltantes.length > 0) {
    return res.status(400).json({ error: 'Faltan campos obligatorios', campos: faltantes });
  }
  try {
    const creado = await Modelo.create(req.body);
    res.status(201).json(creado.toObject());
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar' });
  }
});

async function conectar() {
  for (let intento = 1; intento <= 30; intento++) {
    try {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      return;
    } catch (error) {
      console.log(`Esperando la base de datos (${intento}/30)`);
      await new Promise((resolver) => setTimeout(resolver, 2000));
    }
  }
  throw new Error('No se pudo conectar a la base de datos');
}

async function cargarDatosIniciales() {
  if ((await Modelo.countDocuments()) === 0 && semilla.length > 0) {
    await Modelo.insertMany(semilla);
    console.log(`Datos iniciales cargados en ${config.recurso}`);
  }
}

app.listen(PORT, () => console.log(`${config.nombre} escuchando en el puerto ${PORT}`));

conectar()
  .then(cargarDatosIniciales)
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
