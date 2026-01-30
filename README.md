# 🧾 Backend – Prueba de Desarrollo FullStack (Wompi)

## 📌 Descripción

Este repositorio contiene el **backend** de la prueba de desarrollo FullStack cuyo objetivo es construir una aplicación para **pagar un producto usando Wompi**, siguiendo buenas prácticas de arquitectura, seguridad y testing.

El backend está desarrollado en **JavaScript (Node.js)**, usando **Arquitectura Hexagonal (Ports & Adapters)**, **AWS Lambda**, **API Gateway** y **DynamoDB**.

---

## 🧠 Objetivos del Backend

El backend es responsable de:

- Gestión de productos y stock
- Creación y actualización de transacciones
- Administración de clientes
- Gestión de direcciones de entrega
- Integración con la API de **Wompi (Sandbox)**
- Persistencia del estado de la transacción (resiliencia ante recargas)

---

## 📂 Estructura del Proyecto

El proyecto está organizado siguiendo los principios de **Arquitectura Hexagonal (Ports & Adapters)**, separando claramente las responsabilidades de cada capa.

```txt
backend-wompi/
├── package.json            # Configuración del proyecto y scripts
├── serverless.yml          # Configuración de AWS Serverless (Lambda, API Gateway)
├── README.md               # Documentación del proyecto
├── jest.config.mjs         # Configuración de Jest
├── .env                    # Variables de entorno (no versionado)
├── .gitignore              # Configuración Git
├── docker-compose.yml      # Docker para las tablas de dynamoDB(local)
│
├── src/
│   ├── application/        # Casos de uso
│   │   ├── useCases/       # Orquestación de la lógica del negocio
│   │   └── services/       # Servicios de apoyo (pagos)
│   │
│   │
│   ├── config/             # Configuración y constantes del sistema
│   │   ├── utils/          # Codigo reutilizable
│   │   └── index.js        # Configuración variables de entorno
│   │ 
│   │ 
│   ├── domain/             # Núcleo del negocio
│   │   ├── entities/       # Entidades del dominio y reglas de negocio
│   │   └── repositories/   # Contratos (interfaces) para persistencia
│   │
│   │
│   ├── infrastructure/     # Implementaciones técnicas
│   │   ├── dynamodb/       # Repositorios DynamoDB
│   │   ├── wompi/          # Cliente de la pasarela de pagos
│   │   │── crypto/         # Cifrado de información sensible (hash firma)
│   │
│   └── handlers/           # Handlers HTTP (API Gateway → Lambda) 

│
└── tests/                  # Pruebas automatizadas
    ├── domain/             # Tests de entidades del dominio
    ├── application/        # Tests de casos de uso
    ├── handlers/           # Tests de handlers
    └── infrastructure/     # Tests de servicios e integraciones


---

## 🚀 Quick Start

1. Instalar dependencias:

```bash
npm install
```

2. Levantar DynamoDB local (Docker):

```bash
npm run dynamodb:start
```

3. Crear tablas (local):

```bash
npm run dynamodb:create
```

4. Ejecutar tests:

```bash
npm test
```

---

## 🔐 Variables de entorno

Crea un archivo `.env` basado en `.env.example` con las siguientes variables mínimas:

- WOMPI_PUBLIC_KEY
- WOMPI_INTEGRITY_KEY
- WOMPI_BASE_URL
- PRODUCT_TABLE
- CUSTOMER_TABLE
- TRANSACTION_TABLE
- DELIVERY_TABLE

---

## 💳 Tarjetas de prueba (sandbox)

- VISA: `4111111111111111` (DECLINE)
- VISA: `4242424242424242` (APPROVED)

Usa expiraciones futuras (ej. `12/50`) y CVC `123`.

---

## 🔧 Endpoints principales

- POST `/products` → Crear un producto
- GET `/products` → Listar todos los productos
- POST `/transaction/pay` → Crear transacción (CREATE)
- POST `/transaction/{IdTransaction}` → Iniciar pago (PENDING)
- POST `/webhook/{IdTransaction}` → Webhook para recibir estados de pago (DECLINE OR APPROVED)
