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
├── jest.config.js          # Configuración de Jest
├── .env                    # Variables de entorno (no versionado)
│
├── src/
│   ├── domain/             # Núcleo del negocio
│   │   ├── entities/       # Entidades del dominio y reglas de negocio
│   │   └── repositories/   # Contratos (interfaces) para persistencia
│   │
│   ├── application/        # Casos de uso
│   │   ├── useCases/       # Orquestación de la lógica del negocio
│   │   └── services/       # Servicios de apoyo (pagos, cifrado, etc.)
│   │
│   ├── infrastructure/     # Implementaciones técnicas
│   │   ├── dynamodb/       # Repositorios DynamoDB
│   │   ├── wompi/          # Cliente de la pasarela de pagos
│   │   │── crypto/         # Cifrado de información sensible
│   │
│   ├── handlers/           # Handlers HTTP (API Gateway → Lambda)
│   │
│   └── config/             # Configuración y constantes del sistema
│
└── tests/                  # Pruebas automatizadas
    ├── domain/             # Tests de entidades del dominio
    ├── application/        # Tests de casos de uso
    ├── handlers/           # Tests de handlers
    └── infrastructure/     # Tests de servicios e integraciones
