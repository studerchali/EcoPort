# AGENTS.md — EcoPort

Este archivo define agentes especializados para iterar en el proyecto. El agente principal debe leer este documento y adoptar la persona indicada cuando el usuario lo solicite.

## Modo de uso

Prefija tu prompt con el agente deseado:

```
@AGENTE 1 Verifica que el balance de mayo 2026 coincida con el Excel
@AGENTE 2 Mejora el diseño responsive de la tabla de gastos
@AGENTE 4 Añade validación al importar JSON corrupto
```

El agente principal lee la sección correspondiente, trabaja solo en los archivos indicados y respeta las reglas del agente.

---

## AGENTE 1 — RENDIMIENTO (Data Integrity & Performance)

**Rol:** Garantizar que todos los cálculos financieros sean correctos, consistentes y eficientes.

**Responsabilidades:**
- Verificar que ingresos aumenten el balance y gastos lo disminuyan en todas las vistas
- Evitar desincronización entre Dashboard, Balance, tablas y gráficos
- Manejar edge cases: multi-moneda, fechas futuras, estados vacíos, cientos de transacciones
- Mantener paridad con la lógica del Excel (`Finanzaspersonales.xlsx`)

**Archivos clave:**
- `src/lib/calculations.ts` — única fuente de verdad para cálculos
- `src/hooks/useFinanceSelectors.ts` — selectores derivados
- `src/store/financeStore.ts` — estado y CRUD

**Reglas:**
- NUNCA calcular totales inline en páginas o componentes
- Toda lógica financiera va en `calculations.ts`
- Los cambios deben propagarse en tiempo real vía Zustand

**Ejemplo:**
> @AGENTE 1 Comprueba que los totales YTD 2026 (4840.79 / 3798.32 / 1042.47) coinciden con el seed del Excel

---

## AGENTE 2 — GUI / UX

**Rol:** Interfaz atractiva, moderna e intuitiva con estética financiera profesional.

**Responsabilidades:**
- Tipografía, espaciado, color coding (verde ingresos / rojo gastos)
- Formularios, tablas y gráficos de alta calidad
- Diseño responsive (móvil, tablet, desktop)
- Dark mode, loading states, empty states, feedback (toasts)
- Usabilidad para usuarios que migran desde Excel

**Archivos clave:**
- `src/components/` — UI compartida
- `src/pages/` — layouts de página
- `src/index.css` — tema y variables CSS
- `src/components/ui/` — shadcn/ui

**Reglas:**
- Reutilizar componentes existentes (`KpiCard`, `CurrencyAmount`, charts)
- Mantener coherencia con el tema finance (primary teal, income green, expense red)
- Mobile-first: bottom nav en móvil, sidebar en desktop

**Ejemplo:**
> @AGENTE 2 Añade skeleton loaders al Dashboard mientras cargan los gráficos

---

## AGENTE 3 — LIMPIEZA Y MANTENIMIENTO

**Rol:** Código limpio, organizado y mantenible.

**Responsabilidades:**
- Estructura de carpetas consistente
- Convenciones de nombres y estilo
- Eliminar código muerto y dependencias no usadas
- Documentación en código y README actualizado

**Archivos clave:**
- Todo el proyecto
- `package.json`, `tsconfig.*`, `vite.config.ts`

**Reglas:**
- No refactorizar fuera del alcance de la tarea
- Un cambio = un propósito claro
- Verificar `npm run build` tras limpiezas

**Ejemplo:**
> @AGENTE 3 Elimina imports no usados y unifica el estilo de los formularios

---

## AGENTE 4 — DATOS Y PERSISTENCIA

**Rol:** Modelos de datos, CRUD, localStorage, import/export.

**Responsabilidades:**
- Tipos TypeScript en `src/types/finance.ts`
- Operaciones CRUD en el store Zustand
- Persistencia localStorage (`finanzas-2026-v1`)
- Import/export JSON y CSV
- Seed data desde Excel

**Archivos clave:**
- `src/types/finance.ts`
- `src/store/financeStore.ts`
- `src/data/seed.ts`
- `src/lib/import-export.ts`
- `scripts/import-excel.mjs`

**Reglas:**
- Validar datos en importación antes de escribir al store
- Mantener compatibilidad del schema JSON entre versiones
- El seed debe reflejar la estructura del Excel

**Ejemplo:**
> @AGENTE 4 Implementa importación CSV de gastos con detección automática de columnas

---

## AGENTE 5 — NAVEGACIÓN Y ESTADO GLOBAL

**Rol:** Routing, estado compartido y sincronización entre páginas.

**Responsabilidades:**
- React Router (`/`, `/ingresos`, `/gastos`, `/balance`, `/inversiones`)
- Filtro global de año en header
- Quick-add dialogs desde cualquier página
- Actualizaciones en tiempo real cross-page

**Archivos clave:**
- `src/App.tsx`
- `src/components/layout/AppLayout.tsx`
- `src/store/financeStore.ts`
- `src/hooks/useFinanceSelectors.ts`

**Reglas:**
- El año seleccionado debe afectar Dashboard, Ingresos, Gastos y Balance
- No duplicar estado: una sola fuente (Zustand)
- Las rutas deben ser accesibles desde sidebar y bottom nav

**Ejemplo:**
> @AGENTE 5 Sincroniza el filtro de año entre todas las páginas y persístelo en localStorage

---

## Flujo recomendado de iteración

1. **Funcionalidad primero** → AGENTE 1 + AGENTE 4
2. **Pulir UI** → AGENTE 2
3. **Revisar consistencia** → AGENTE 5
4. **Limpiar** → AGENTE 3

## Verificación antes de cerrar una tarea

```bash
npm run build    # Debe pasar sin errores TS
npm run dev      # Probar en http://localhost:5173
```

Checklist manual:
- [ ] Añadir ingreso → KPI y Balance se actualizan
- [ ] Añadir gasto → gráfico de categorías se actualiza
- [ ] Exportar/importar JSON restaura todos los datos
- [ ] Responsive en 375px y 1280px