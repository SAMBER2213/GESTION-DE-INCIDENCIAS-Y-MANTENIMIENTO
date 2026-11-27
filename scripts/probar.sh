#!/usr/bin/env bash
# Prueba rapida del entorno completo a traves del proxy (puerto 9080).
BASE="${BASE:-http://localhost:9080}"
fallos=0

probar() {
  descripcion="$1"; ruta="$2"
  codigo=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$ruta")
  if [ "$codigo" = "200" ]; then
    echo "OK     $descripcion  ($ruta)"
  else
    echo "FALLO  $descripcion  ($ruta) -> HTTP $codigo"
    fallos=$((fallos + 1))
  fi
}

probar "api-bff ping"                 /api/ping
probar "api-bff health (todos)"       /api/health
probar "api-bff resumen compuesto"    /api/resumen
probar "ms-usuarios ping"             /ms-usuarios/ping
probar "ms-usuarios health"           /ms-usuarios/health
probar "ms-usuarios lista"            /ms-usuarios/usuarios
probar "ms-incidencias ping"          /ms-incidencias/ping
probar "ms-incidencias health"        /ms-incidencias/health
probar "ms-incidencias lista"         /ms-incidencias/incidencias
probar "ms-proveedores ping"          /ms-proveedores/ping
probar "ms-proveedores health"        /ms-proveedores/health
probar "ms-proveedores lista"         /ms-proveedores/proveedores
probar "ms-finanzas ping"             /ms-finanzas/ping
probar "ms-finanzas health"           /ms-finanzas/health
probar "ms-finanzas lista"            /ms-finanzas/gastos
probar "ms-comunicaciones ping"       /ms-comunicaciones/ping
probar "ms-comunicaciones health"     /ms-comunicaciones/health
probar "ms-comunicaciones lista"      /ms-comunicaciones/avisos

echo
if [ "$fallos" -eq 0 ]; then echo "Todas las pruebas pasaron"; else echo "$fallos prueba(s) fallaron"; exit 1; fi
