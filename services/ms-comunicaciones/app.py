import json
import os
import time
from datetime import datetime, timezone

import redis
from flask import Flask, jsonify, request

NOMBRE = "ms-comunicaciones"
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
CLAVE_INTERNA = os.environ.get("CLAVE_INTERNA", "")

app = Flask(__name__)
r = redis.Redis.from_url(REDIS_URL, decode_responses=True)


def ahora():
    return datetime.now(timezone.utc).isoformat()


def guardar_aviso(datos):
    nuevo_id = r.incr("avisos:contador")
    aviso = {"id": str(nuevo_id), "creado_en": ahora()}
    for campo, valor in datos.items():
        aviso[campo] = "" if valor is None else str(valor)
    r.hset(f"aviso:{nuevo_id}", mapping=aviso)
    r.rpush("avisos:ids", nuevo_id)
    return aviso


def cargar_datos_iniciales():
    ruta = os.path.join(os.path.dirname(__file__), "seed.json")
    with open(ruta, encoding="utf-8") as archivo:
        semilla = json.load(archivo)
    for _ in range(30):
        try:
            # SET con NX: solo el primer arranque carga los datos de ejemplo
            if r.set("avisos:semilla", "1", nx=True):
                for aviso in semilla:
                    guardar_aviso(aviso)
                print("Datos iniciales cargados en avisos", flush=True)
            return
        except redis.exceptions.ConnectionError:
            print("Esperando a Redis", flush=True)
            time.sleep(2)


@app.before_request
def revisar_clave():
    if request.path in ("/ping", "/health"):
        return None
    if CLAVE_INTERNA and request.headers.get("x-clave-interna") != CLAVE_INTERNA:
        return jsonify({"error": "Clave interna invalida"}), 401
    return None


@app.get("/ping")
def ping():
    return jsonify({"servicio": NOMBRE, "estado": "ok"})


@app.get("/health")
def health():
    try:
        r.ping()
        return jsonify({"servicio": NOMBRE, "estado": "ok", "baseDeDatos": "ok", "fecha": ahora()})
    except redis.exceptions.RedisError:
        return jsonify({"servicio": NOMBRE, "estado": "error", "baseDeDatos": "sin conexion"}), 503


@app.get("/avisos")
def listar_avisos():
    ids = r.lrange("avisos:ids", 0, 99)
    return jsonify([r.hgetall(f"aviso:{i}") for i in ids])


@app.get("/avisos/<aviso_id>")
def ver_aviso(aviso_id):
    aviso = r.hgetall(f"aviso:{aviso_id}")
    if not aviso:
        return jsonify({"error": "No encontrado"}), 404
    return jsonify(aviso)


@app.post("/avisos")
def publicar_aviso():
    datos = request.get_json(silent=True) or {}
    faltantes = [c for c in ("titulo", "mensaje") if not datos.get(c)]
    if faltantes:
        return jsonify({"error": "Faltan campos obligatorios", "campos": faltantes}), 400
    return jsonify(guardar_aviso(datos)), 201


try:
    cargar_datos_iniciales()
except redis.exceptions.RedisError as error:
    print(f"No se cargaron los datos iniciales: {error}", flush=True)
