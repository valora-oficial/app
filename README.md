# VALORA 🇻🇪 — Calculadora Inteligente de Valores para Venezuela

<div align="center">

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-100%25_Offline-10B981?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/Licencia-MIT-000000?style=flat-square)](LICENSE)
[![Website](https://img.shields.io/badge/Sitio_Web-mayfrend--app-black?style=flat-square&logo=github)](https://mayfrend-app.github.io/ve/)

**"Tu valor, actualizado."**  
Una Progressive Web App (PWA) de alto rendimiento, precisión matemática y diseño de alto contraste, diseñada para el día a día en Venezuela con tasas oficiales en tiempo real del **Banco Central de Venezuela (BCV)**.

[🌐 Visitar Sitio Web](https://mayfrend-app.github.io/ve/) • [📲 Cómo Instalar en Móvil](#-instalación-en-móviles-pwa--apk-directa) • [☕ Donar y Apoyar](#-donaciones-y-apoyo) • [🛠️ Comenzar](#-desarrollo-local)

</div>

---

## 📋 Tabla de Contenidos

- [Visión General](#-visión-general)
- [Características Principales](#-características-principales)
- [Instalación en Móviles (PWA / APK directa)](#-instalación-en-móviles-pwa--apk-directa)
- [Arquitectura de Redundancia BCV (4 Niveles)](#-arquitectura-de-redundancia-bcv-4-niveles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Desarrollo Local](#-desarrollo-local)
- [Suite de Pruebas Unitarias](#-suite-de-pruebas-unitarias)
- [Despliegue en Producción](#-despliegue-en-producción)
- [Donaciones y Apoyo](#-donaciones-y-apoyo)
- [Autor y Licencia](#-autor-y-licencia)

---

## 🌟 Visión General

En la economía venezolana, calcular precios, presupuestos y conversiones en bolívares (VES), dólares (USD) y euros (EUR) requiere inmediatez, exactitud y fiabilidad. 

**VALORA** nace como una herramienta web y móvil ligera (< 1 MB), limpia y sin distracciones:
- **Cero Publicidad:** Sin anuncios invasivos ni rastreadores comerciales.
- **Sin Registro:** No solicita correos, datos personales ni números bancarios para operar.
- **Diseño Monocromático de Alto Contraste:** Interfaz limpia en fondo blanco (`#ffffff`) y texto negro (`#000000`) pensada para máxima legibilidad bajo la luz solar en la calle o locales comerciales.
- **100% Funcional Offline:** Continúa calculando y convirtiendo incluso en zonas sin cobertura celular gracias a su Service Worker y memoria local.

---

## ✨ Características Principales

### 1. 🏛️ Tasas Oficiales BCV en Vivo (USD y EUR)
- **Extracción precisa:** Tasa oficial de Dólar (USD) y Euro (EUR) según el Banco Central de Venezuela.
- **Fecha Valor & Horario de Caracas:** Muestra la fecha valor oficial y el momento exacto de la última consulta.
- **Indicadores de estado claros:**
  - 🟢 **BCV actualizado:** Conectado y al día con la tasa bancaria.
  - 🟡 **Actualizando tasa...:** Verificando cambios en la red.
  - ⚪ **Última tasa guardada:** Modo sin conexión / lectura de caché offline.
  - 🔴 **Tasa no disponible:** Alerta clara ante fallos de red.
- **Botón `↻ Actualizar tasa`:** Permite refrescar bajo demanda en cualquier instante.

### 2. 💱 Conversor Bidireccional Inteligente
- Conversión instantánea a medida que el usuario escribe (**USD ⇄ VES** y **EUR ⇄ VES**).
- Botón de inversión de divisas (`⇅`) con micro-animación fluida.
- Atajos de montos frecuentes ($1, $5, $10, $20, $50, $100, $500, $1.000).
- Botón de **Copiar Resultado** con feedback visual ("¡Copiado!").
- Integración con la **Web Share API** nativa para compartir cotizaciones por WhatsApp, Telegram o SMS en un toque.

### 3. 🧮 Calculadora Matemática Financiera Segura
- Parser matemático tokenizado seguro (cero llamadas a `eval()` o `new Function`).
- Soporte completo para operadores aritméticos (`+`, `-`, `×`, `÷`), decimales y paréntesis anidados.
- **Porcentajes intuitivos:**
  - `100 + 20% = 120` (aumento de precio o recargo)
  - `100 - 20% = 80` (descuento comercial)
  - `500 * 10% = 50` (proporción)
- Atajos de porcentaje rápido (`+5%`, `+10%`, `+16%`, `+20%`, `-5%`, `-10%`, etc.).
- Memoria clásica de calculadora (`MC`, `MR`, `M+`, `M-`).
- Botón de acción directa **«Convertir a Bs. / USD»** para trasladar el cálculo a la tasa activa.

### 4. 🛠️ Herramientas Financieras Integradas
- **Cálculo de IVA:** 16% (general en Venezuela), 8% (reducido), 0% (exento) y tasa personalizada.
- **Descuentos Comerciales:** Monto original, porcentaje de rebaja, ahorro neto y precio a pagar.
- **Propinas:** Estimación sugerida (5%, 10%, 12%, 15%, 20%) y total de cuenta.
- **Cálculo Multi-artículo:** Precio unitario × cantidad con desglose simultáneo en divisas y bolívares.

### 5. 📊 Historial y Métricas
- Gráfico interactivo y visual de evolución histórica de la tasa oficial (7 y 30 días).
- Registro de últimos cálculos realizados en el dispositivo (`localStorage` privado).

---

## 📲 Instalación en Móviles (PWA / APK Directa)

VALORA está construida bajo el estándar **Progressive Web App (PWA)**, lo que permite instalarla directamente en tu teléfono sin pasar por tiendas de aplicaciones pesadas:

### 🚀 Sugerencia Automática
Al ingresar a la webapp desde cualquier móvil, verás una **tarjeta de sugerencia interactiva** con el botón **«⚡ Instalar Ahora»**.

### 🤖 En Android (Chrome, Brave, Samsung Internet, Edge):
1. Toca el botón **«Instalar app»** en la barra superior o en la sugerencia inicial.
2. Si tu navegador no abre el instalador directo, presiona el menú de tres puntos (**⋮**) del navegador.
3. Selecciona **«Instalar aplicación»** o **«Agregar a la pantalla principal»**.
4. ¡Listo! Se generará el ícono en tu cajón de aplicaciones y abrirá a pantalla completa.

### 🍏 En iPhone / iPad (Safari):
1. Abre la webapp en **Safari**.
2. Toca el botón de **Compartir** (`⎋` cuadrado con la flecha hacia arriba) en la barra inferior.
3. Desliza hacia abajo y selecciona **«Agregar a la pantalla de inicio»** (`+`).
4. Pulsa **«Agregar»** en la esquina superior derecha.

#### Ventajas frente a una APK tradicional:
- **Ultraligera:** Ocupa menos de 1 MB de almacenamiento.
- **Actualizaciones invisibles:** Siempre estás en la versión más reciente sin reinstalar archivos `.apk`.
- **Modo Fuera de Línea:** Abre y calcula aun sin megas o en zonas sin señal.

---

## 🏛️ Arquitectura de Redundancia BCV (4 Niveles)

Para garantizar que la tasa nunca falle, VALORA dispone de un sistema tolerante a fallos:

```
                  ┌──────────────────────────────┐
                  │   Usuario / Frontend VALORA  │
                  └──────────────┬───────────────┘
                                 │
  ┌──────────────────────────────▼──────────────────────────────┐
  │ Nivel 1: Backend Express /api/bcv-rate                      │
  │ • Scraping directo a https://www.bcv.org.ve/               │
  │ • Agente HTTPS con TLS tolerante y User-Agent rotativo     │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ (Falla / Timeout / 403 / 500)
  ┌──────────────────────────────▼──────────────────────────────┐
  │ Nivel 2: Fallback Backend a API Verificada                  │
  │ • Consulta a https://ve.dolarapi.com/v1/dolares/oficial     │
  │ • Validación estricta de estructura y valor numérico        │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ (Servidor no responde o hosting estático)
  ┌──────────────────────────────▼──────────────────────────────┐
  │ Nivel 3: Fetch Directo desde el Navegador (Frontend)        │
  │ • Petición cliente directa a réplica oficial de respaldo    │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ (Sin conexión a internet)
  ┌──────────────────────────────▼──────────────────────────────┐
  │ Nivel 4: Caché Local Inteligente (localStorage)             │
  │ • Almacena la última tasa válida con timestamp y fecha      │
  │ • Etiqueta la interfaz como "Modo sin conexión"             │
  └─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```text
├── public/                     # Recursos públicos, íconos PWA y favicons
│   ├── favicon.ico
│   ├── icon.svg
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   └── pwa-maskable-512x512.png
├── src/
│   ├── components/             # Componentes modulares
│   │   ├── Calculator.tsx      # Calculadora matemática con memoria y porcentajes
│   │   ├── Converter.tsx       # Conversor interactivo USD/EUR a VES
│   │   ├── DonateModal.tsx     # Ventana de donaciones (Pago Móvil & Binance Pay)
│   │   ├── Header.tsx          # Cabecera con selector de tema, tasa e instalador
│   │   ├── HistorySection.tsx  # Historial de cálculos y gráfica de evolución
│   │   ├── InstallPromptModal.tsx # Sugerencia de instalación PWA y guía OS
│   │   ├── OfflineIndicator.tsx# Alerta visual de desconexión
│   │   ├── RateCard.tsx        # Ficha destacada con la tasa BCV activa
│   │   └── ToolsSection.tsx    # IVA, descuentos, propinas y multi-artículo
│   ├── hooks/                  # Custom Hooks
│   │   ├── useBCVRate.ts       # Hook de sincronización y redundancia de tasa
│   │   ├── usePWAInstall.ts    # Detección y disparo del evento de instalación
│   │   └── useTheme.ts         # Manejo del tema de contraste
│   ├── utils/                  # Lógica pura de cálculo y formateo
│   │   ├── calculator.ts       # Evaluador matemático seguro
│   │   └── formatters.ts       # Formato de moneda venezolana (Bs. 0.000,00)
│   ├── types.ts                # Definiciones de tipos TypeScript
│   ├── App.tsx                 # Contenedor raíz
│   ├── main.tsx                # Punto de entrada de React
│   └── index.css               # Estilos globales con Tailwind CSS
├── tests/
│   └── all.test.ts             # Suite completa de pruebas unitarias
├── server.ts                   # Servidor Express de desarrollo y scraping BCV
├── vite.config.ts              # Configuración de Vite y VitePWA
├── metadata.json               # Metadatos de la aplicación
└── package.json                # Dependencias y scripts del proyecto
```

---

## 💻 Desarrollo Local

### Requisitos previos:
- **Node.js**: v18.0.0 o superior (se recomienda v20+)
- **npm** o **pnpm / yarn**

### 1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/valora.git
cd valora
```

### 2. Instalar dependencias:
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

### 4. Verificar sintaxis y tipos con TypeScript:
```bash
npm run lint
```

---

## 🧪 Suite de Pruebas Unitarias

VALORA incluye pruebas unitarias automatizadas para certificar que ningún cálculo financiero ni formateo de bolívares produzca errores:

```bash
npm test
```

### Cobertura de las pruebas:
- ✔ Precedencia de operadores matemáticos (`150 + 25 * 2 = 200`)
- ✔ Expresiones con paréntesis simples y anidados
- ✔ Porcentajes de recargo (`100 + 20% = 120`), descuento (`100 - 20% = 80`) y multiplicación
- ✔ Manejo de división por cero y valores vacíos
- ✔ Formato monetario venezolano con separadores de miles y decimales (`82010.50` -> `Bs. 82.010,50`)
- ✔ Conversión bidireccional USD/VES y EUR/VES
- ✔ Validación estricta de tasas del BCV (rechazo de valores negativos o nulos)

---

## 🚀 Despliegue en Producción

### Compilación completa:
```bash
npm run build
```
Este comando compilará los activos estáticos optimizados con Vite en `dist/` y el servidor backend en `dist/server.cjs`.

### Ejecutar en modo producción:
```bash
npm start
```

### Despliegue Automático con GitHub Actions (GitHub Pages):
VALORA ya incluye el archivo de flujo de trabajo `.github/workflows/deploy.yml` configurado para compilar y publicar automáticamente en **GitHub Pages**:

1. Sube tu código al repositorio en GitHub (`main` o `master`).
2. En GitHub, entra en tu repositorio y ve a la pestaña **Settings** (Configuración) ⚙️.
3. En la barra lateral izquierda, haz clic en **Pages**.
4. En **Build and deployment** > **Source**, selecciona **GitHub Actions** (en lugar de "Deploy from a branch").
5. Haz un push a `main` o ve a la pestaña **Actions** de GitHub y pulsa **Run workflow**.
6. En un par de minutos, tu webapp estará disponible públicamente en `https://<tu-usuario>.github.io/<tu-repo>/`.

*Nota:* Gracias a la configuración de rutas relativas automáticas en `vite.config.ts`, la aplicación funcionará perfectamente tanto en subcarpetas de GitHub Pages como en dominios personalizados.

---

## ☕ Donaciones y Apoyo

Si VALORA te es de utilidad para tu negocio, comercio o vida cotidiana, puedes apoyar su mantenimiento y desarrollo continuo con una donación voluntaria. Todos los datos están listos para copiar:

### 🇻🇪 Pago Móvil (Venezuela):
- **Banco:** `0108` (Banco Provincial / BBVA)
- **Teléfono:** `04248056092`
- **Cédula de Identidad:** `19629049` (V-19629049)

### 🟡 Binance Pay (USDT / Criptomonedas):
- **Binance Pay ID:** `549055049`

> *❤️ ¡Gracias por tu donación! Me ayudas a seguir creando y mejorando herramientas abiertas para todos.*

---

## 🌐 Conecta con el Desarrollador

Te invito a conocer más proyectos y aplicaciones en mi página web:  
👉 **[https://mayfrend-app.github.io/ve/](https://mayfrend-app.github.io/ve/)**

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Eres libre de usar, modificar y distribuir esta aplicación respetando la atribución original.

Fuente oficial de los datos de divisas: **Banco Central de Venezuela (BCV)**.
