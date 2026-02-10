## **Paquetes de instalacion**

### **Dependencias (Produccion)**
- `npm install express@5.1.0` : Creacion de servidor web.
- `npm install mongoose@8.15.1` : Conectar sesion con la base de datos MONGO. Mongoose es un ORM para MongoDB.
- `npm install bcryptjs@2.4.3` : Encriptar contraseñas.
- `npm install jsonwebtoken@9.0.2` : Crea, verifica y autentifica tokens.
- `npm install cors` : Permite comunicacion entre dominios (Ejemplo: front: localhost:3000 backend: localhost:4000). Evita problemas de cabeceras. Sin cors el navegador bloquea.
- `npm install dotenv@16.4.7` : Crea la variables de entorno. / Se puede utilizar los modulos nativos de express.

### **Dependencias (Desarrollador)**
- `npm install -D nodemon` : Recarga el servidor de forma automatica. / Se puede utilizar los modulos nativos de express.

## **Creacion de carpetas**

- `config` : Va la configuracion global del proyecto. No hay logica del negocio, solo configuracion.
- `controllers` : Es el cerebro logico de la aplicacion. Recibe los `req` y `res`, valida datos basicos, llama al modelo, devuelve una respuesta.
- `db` : Va la conexion a la DB. Como estamos utilizando MongoDB entonces manejaremos mongoose. Esta conextion solo la definimos una vez, despues solo se reutiliza.
- `middleware` : Van los middleware necesarios para el proyecto. Middleware es una funcion que se ejecuta antes de llegar al controlador. Estas pueden verificar autentificaciones, validar roles, validar datos, manejar errores.

```bash
# Flujo
Request → Middleware → Controller → Response
```

- `models` : Esta carpeta representa los datos. Cada archivo representa una entidad de la DB. En cada archivo se define la estructura de los datos, tipos, relaciones, validaciones de DB.
- `routes` : Esta carpeta es como la recepcionista del sistema. Esta define que `URL` existe, que metodo HTTP usa, y que controller se ejecuta.

```bash
# Ejemplos
POST /users → createUserController
GET  /users → getUsersController
```

- `utils` : Van funciones que podemores reutilizar tales como: Encriptar contraseñas, generar tokens, formatear fechas, helpers.

### **Analogia de cada carpeta**

- Hay alguien que recibe solicitudes (`routes`)
- Alguien que toma decisiones (`controllers`)
- Alguien que habla con la base de datos (`models`)
- Alguien que verifica reglas (`middleware`)
- Alguien que configura todo (`config / db`)
- Y utilidades que ayudan (`utils`)

## **NOTAS**

- El proyecto se esta haciendo con commonJS y no con modulesJS.