# 🧾 Backend – Prueba de Desarrollo FullStack (Wompi)

## 📌 Descripción

Este repositorio contiene el **backend** de la prueba de desarrollo FullStack cuyo objetivo es construir una aplicación para **pagar un producto usando Wompi (Sandbox)**, siguiendo buenas prácticas de **arquitectura**, **seguridad**, **testing** e **infraestructura como código**.

El backend está desarrollado en **Node.js (JavaScript, ESM)**, utilizando **Arquitectura Hexagonal (Ports & Adapters)**, **AWS Lambda**, **API Gateway** y **DynamoDB**.

---

## 🧠 Objetivos del Backend

El backend es responsable de:

* Gestión de productos y control de **stock**
* Creación y actualización de **transacciones**
* Administración de **clientes**
* Gestión de **direcciones de entrega**
* Integración con la **API de Wompi (Sandbox)**
* Persistencia del estado de la transacción (CREATE → PENDING → APPROVED / DECLINED)
* Manejo seguro de datos sensibles (tokens, hash de firma, variables de entorno)

---

## 🏗️ Arquitectura

Se implementa **Arquitectura Hexagonal (Ports & Adapters)** para desacoplar la lógica de negocio de los detalles técnicos.

* **Domain**: reglas de negocio puras (entidades y contratos)
* **Application**: casos de uso y orquestación de la lógica
* **Infrastructure**: DynamoDB, cliente Wompi, cifrado
* **Handlers**: adaptadores HTTP (API Gateway → Lambda)

Los casos de uso siguen un enfoque cercano a **Railway Oriented Programming (ROP)**, retornando resultados controlados y evitando excepciones no manejadas.

---

## 📂 Estructura del Proyecto

```txt
backend-wompi/
├── package.json
├── serverless.yml
├── README.md
├── jest.config.mjs
├── .env
├── docker-compose.yml
│
├── src/
│   ├── application/
│   │   ├── useCases/
│   │   └── services/
│   ├── config/
│   │   ├── utils/
│   │   └── index.js
│   ├── domain/
│   │   ├── entities/
│   │   └── repositories/
│   ├── infrastructure/
│   │   ├── dynamodb/
│   │   └── wompi/
│   │   └── crypto/
│   └── handlers/
│
└── tests/
    ├── domain/
    ├── application/
    ├── handlers/
    └── infrastructure/
```

---

## 🧩 Modelo de Datos

### 📦 Product

| Campo       | Tipo   | Descripción                |
| ----------- | ------ | -------------------------- |
| id          | string | Identificador del producto |
| name        | string | Nombre del producto        |
| description | string | Descripción                |
| price       | number | Precio base                |
| stock       | number | Unidades disponibles       |

---

### 👤 Customer

| Campo   | Tipo   | Descripción               |
| ------- | ------ | ------------------------- |
| id      | string | Identificador del cliente |
| name    | string | Nombre                    |
| email   | string | Email                     |
| address | string | Dirección                 |
| city    | string | Ciudad                    |
| phone   | string | Teléfono                  |

---

### 🚚 Delivery

| Campo             | Tipo   | Descripción               |
| ----------------- | ------ | ------------------------- |
| id                | string | Identificador             |
| address           | string | Dirección de entrega      |
| city              | string | Ciudad                    |
| country           | string | País                      |
| phone             | string | Teléfono de contacto      |
| transactionId     | string | Transacción asociada      |
| estimatedDelivery | string | Fecha estimada de entrega |

---

### 💳 Transaction

| Campo              | Tipo   | Descripción                                            |
| ------------------ | ------ | ------------------------------------------------------ |
| id                 | string | ID de la transacción                                   |
| productId          | string | Producto asociado                                      |
| quantity           | number | Cantidad de productos                                  |
| deliveryId         | string | Dirección de entrega                                   |
| amount             | number | Valor total                                            |
| status             | enum   | CREATE / PENDING / APPROVED / DECLINED                 |
| wompiTransactionId | string | ID de la transacción en Wompi                          |
| acceptanceToken    | string | Token de aceptación (Wompi)                            |
| personalToken      | string | Token personal del comercio                            |
| cardToken          | string | Token de tarjeta (no se almacena información sensible) |

---

## 🔌 Endpoints

### 📦 Productos

* **GET /products**
  Lista productos disponibles con stock actualizado.

---

### 💳 Transacciones

* **POST /transaction/pay**
  Crea una transacción en estado `CREATE`.

* **POST /transaction/{transactionId}**
  Inicia el pago y cambia el estado a `PENDING`.

* **POST /webhook/{transactionId}**
  Webhook que recibe el resultado del pago (`APPROVED` o `DECLINED`) desde Wompi.

---

## 🔐 Seguridad

* Llaves sensibles gestionadas únicamente mediante **variables de entorno**
* Firma de integridad usando **SHA-256**
* No se persisten datos de tarjeta
* Tokens de pago gestionados exclusivamente por Wompi
* Enfoque alineado con **OWASP Top 10**

---

## 🧪 Pruebas

* **Framework**: Jest
* **Pruebas unitarias** en todas las capas
* **Cobertura mínima**: ≥ 80%

```bash
npm run test:ci
```

> Las pruebas cubren entidades de dominio, casos de uso, handlers e infraestructura.

---

## 🚀 Quick Start (Local)

```bash
npm install
npm run dynamodb:start
npm run dynamodb:create
npm run local
```

---

## 🔐 Variables de entorno

```env
WOMPI_PUBLIC_KEY=
WOMPI_INTEGRITY_KEY=
WOMPI_BASE_URL=https://api-sandbox.co.uat.wompi.dev/v1
PRODUCT_TABLE=Products
CUSTOMER_TABLE=Customers
TRANSACTION_TABLE=Transactions
DELIVERY_TABLE=Deliveries
```

---

## 💳 Tarjetas de prueba (Sandbox)

* VISA (DECLINED): `4111111111111111`
* VISA (APPROVED): `4242424242424242`

CVC: `123` – Fecha futura (ej: `12/50`).

---

## 📮 Postman / API Docs

📎 **Colección Postman (pública)**:
[https://drive.google.com/file/d/1JdSHVEhj3Kdg00IbNVUbBaxe4dyEJ69N/view?usp=sharing](https://drive.google.com/file/d/1JdSHVEhj3Kdg00IbNVUbBaxe4dyEJ69N/view?usp=sharing)

La colección también se encuentra en la raíz del proyecto.

---

## ☁️ Despliegue

* **AWS Lambda**
* **API Gateway**
* **DynamoDB**
* **Serverless Framework**

El backend está preparado para ser desplegado en AWS mediante infraestructura como código

---

## ✅ Estado del proyecto

✔ Backend funcional
✔ Integración Wompi Sandbox
✔ Arquitectura Hexagonal
✔ Pruebas automatizadas
✔ Listo para integración con Frontend

---

## 🤖 Uso de IA

Se utilizó IA como asistente para:

* Diseño de arquitectura
* Refactorización
* Mejora de pruebas
* Validación de buenas prácticas

---

## 👨‍💻 Autor

**Kevin Quintero**
Ingeniero Informatico, Desarrollador Full Stack y Técnico en Sistemas
