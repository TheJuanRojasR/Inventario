## **Paquetes de instalacion**

### **Dependencias (Produccion)**
- `npm install express@5.1.0` : Creacion de servidor web.
- `npm install mongoose@8.15.1` : Es un ODM (Object Document Mapper). Básicamente, traduce el código JavaScript a comandos de MongoDB.
- `npm install bcryptjs@2.4.3` : Encriptar contraseñas.
- `npm install jsonwebtoken@9.0.2` : Crea, verifica y autentifica tokens.
- `npm install cors` : Permite comunicacion entre dominios (Ejemplo: front: localhost:3000 backend: localhost:4000). Evita problemas de cabeceras. Sin cors el navegador bloquea.
- `npm install dotenv@16.4.7` : Crea la variables de entorno. / Se puede utilizar los modulos nativos de express.

### **Dependencias (Desarrollador)**
- `npm install -D nodemon` : Recarga el servidor de forma automatica. / Se puede utilizar los modulos nativos de express.

## **Creacion de carpetas**

- `config` : Va la configuracion global del proyecto. No hay logica del negocio, solo configuracion.
- `controllers` : Es el cerebro logico de la aplicacion. Recibe los `req` y `res`, valida datos basicos, llama al modelo, devuelve una respuesta.
- `db` : Va la conexion a la DB. Como estamos utilizando MongoDB entonces manejaremos mongoose. Esta conexion solo la definimos una vez, despues solo se reutiliza.
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

### **MONGODB - MONGOOSE**

- `.Schema` (metodo): Crea una plantilla para que todos los usuarios (documentos) tengan la misma estructura en la coleccion (muchos documentos juntos).
- `select: false` (Schema Type Option): En mongoose utilizamos este tipo de configuracion aplicado al campo (atributo). Lo que hace esta configuracion es que el atributo no sera visible al momento de ser consultado el documento (registro/tupla). Ejemplo: Se aplico al atributo password para que no sea visible por nadie.
- `timestamps: true` (Schema Type Option) : Crea automaticamente createdAt y updatedAt. Util para auditoria.
- `versionKey: false,` (Schema Type Option) : Evita que mongo agregue `"__v": 0` Esto lo utiliza internamente mongo para control de versiones internar y concurrencia. No lo necesitamos para este proyecto.
- `maxlength: [50, "Error personalizado"]` (Built-in Validator) : Es una regla de validacion para garantizar que los datos guardados sea los correctos. En este caso solo permite un maximo de 50 caracteres, si sobrepasa estos mostrara el error personalizado.
- `next()` : Funcion que da mongoose que dice "Todo correcto puedo continuar".
- `this` // this : En este caso se refiere al usuario que se va a guardar.
- `type: mongoose.Schema.Types.ObjectId,` : Decimos que el tipo de dato que vamos a almacenar es un ObjectId, o sea vamos a traer el Id de una coleccion.
- `ref: ''` : Referencia. Este atributo le indica a mongoose a que hace referencia el Id almacenado. Ejemplo "Este ID que ves aquí es una llave que abre un documento en la colección llamada 'Category"
- `NOTA` : Utilizamos `type: mongoose.Schema.Types.ObjectId,` y `ref: ''` juntos despues para utilizar el metodo `.populate()`. Este lo utilizamos en el controlador al momento de hacer alguna consulta para poder "poblar" o llenar este campo. Analogia : Es como hacer un 'JOIN' en un DB Relacional. 
  
### **GENERAL**

- `.genSalt(rounds)` : Genera un valor aleatorio criptografico. Entre mas rounds, mas complicado de descifrar pero es mas lento en generar.
```js
    const salt = await bcrypt.genSalt(10);
```
- `.hash(data, salt)` : Genera un hash (valor irreversible) aplicando un algoritmo criptográfico a la contraseña junto con un salt. En el resultado estara el algoritomo que utilizo (2b), el costo (10), la salt, y el hash generado. Ejemplo $2b$10$eImiTXuWVxfM37uY4JANjQ==
```js
    this.password = await bcrypt.hash(this.password, salt);
```