# ms-finanzas

**Bounded Context:** Finanzas y Presupuesto

## Responsabilidades

- Gastos de las reparaciones (repuestos o mano de obra) y presupuesto anual de mantenimiento.
- Un solo presupuesto vigente por año; el anterior queda como histórico (RNF-17).
- Permite que los gastos superen el presupuesto: Q-13 muestra un porcentaje ejecutado mayor a 100 (H-06).

## Datos

Base de datos lógica: `finanzas_db` (MongoDB Atlas, ADR-0006). Colecciones:

- `gastos`: gasto con referencia a la incidencia
- `presupuestos`: presupuesto por año con indicador de vigencia

El detalle de campos e índices está en la sección «Modelado de datos» de [Event Storming](../../docs/EventStorming/event-storming-completo.md).

## Operaciones

Contratos funcionales en [queries-actions.md](../../docs/queries-actions.md). Los endpoints son internos: solo `api-bff` los llama.

| Operación | Endpoint interno |
|-----------|------------------|
| A-16 Registrar gasto de una reparación | `POST /gastos` |
| A-17 Definir presupuesto anual | `PUT /presupuestos/{anio}` |
| Q-13 Comparar gastos con el presupuesto anual | `GET /presupuestos/{anio}/ejecucion` |
| Q-14 Consultar gastos de mantenimiento | `GET /gastos` (acepta una lista de incidencias) |

## Dependencias

No llama a ningún otro servicio.

## Variables de entorno

- `PORT`
- `MONGODB_URI` (de `finanzas_db`)

Cada servicio publica un `.env.example` y los archivos `.env` se excluyen con `.gitignore` (RNF-06).
