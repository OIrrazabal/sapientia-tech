# Examen Final - Primera Oportunidad

## Condiciones Generales

-   El examen es presencial e individual.
-   Se presenta en la fecha del examen. Deben asistir a firmar acta de asistencia como siempre.
-   Solo pueden rendir alumnos que figuren en acta.
-   Cada alumno tendrá su repositorio de GitLab propio (creado por el profesor).
-   Solo se corrige lo que está en la rama "main".
-   Para actualizar "main" se debe seguir el esquema de trabajo de Merge Request.
-   Fecha tope para solicitar MRs y cambio de código:
    -   **El día del examen hasta el mediodía**
-   El proyecto debe estar en un estado adecuado (se debe poder clonar, instalar y ejecutar) sin tener que realizar ajustes de código, de base de datos o modificaciones manuales ni externas.
-   Se debe seguir utilizando las mismas tecnologías y herramientas utilizadas a lo largo del semestre.
-   Leer y seguir las instrucciones especificadas.
-   En caso de dudas se deben hacer las consultas vía GitLab.
-   Si hay tickets pendientes, o errores acarreados de entregas anteriores, se deben corregir para esta entrega. Estas correcciones no suman puntos al momento del examen, pero en caso de no haberse corregido restaran sobre el total. Especial atención a errores de tipo:
    -   base de datos no actualizada correctamente.
    -   enlaces a páginas rotas.
    -   navegación incorrecta.
    -   errores de validación que no se muestren correctamente en la interfaz.
    -   paquetes o librerías no instaladas o definidas correctamente.
    -   dependencias no actualizadas.
    -   validaciones incompletas (solo front por ejemplo) o incorrectas (ejemplo no normalizar un correo electrónico que permita registrar dos veces el mismo correo pero con diferente "case").
    -   código ubicado incorrectamente (ejemplo, consultas SQL fuera de modelos, validaciones mezcladas con lógica, código en archivos de rutas).
-   Ser respetuosos de la materia, del profesor y de los compañeros no pidiendo excepciones especiales y respetando los tiempos y procesos definidos.

---

## Actividades a implementar (en el repositorio GitLab):

### Diseño y Programación:

---

#### Item F1 - Envío de correo - 5 puntos

-   [ ] Implementar el envío de correos a un profesor, cuando es asignado como profesor de un curso.
-   [ ] Debe utilizarse [MailTrap](https://mailtrap.io/es/) para validar el envío de correos sin necesidad de un servidor especial.
-   [ ] Utilizar una plantilla adecuada (no simplemente un texto genérico).
-   [ ] Seguir los lineamientos en clase para el uso de valores confidenciales en el proyecto y el Git.
-   El correo debe mostrar:

    -   [ ] el nombre y logo usado en su Web
    -   [ ] Información del profesor
    -   Información del curso:

        -   [ ] Nombre Categoría
        -   [ ] Nombre Curso
        -   [ ] Imagen de Portada

---

#### Item F2 - Archivos de Video

-   Subir videos en Secciones de un Curso - 4 puntos:
    -   [ ] Permitir que el profesor de un curso pueda adjuntar un archivo de video a una sección
            nueva (upload), de forma opcional, al momento de crear la sección.
    -   [ ] Validar la extensión del archivo. Definir 2 extensiones que permitirá su app. Mencionarlas en la documentación.
    -   [ ] Los videos deben subirse dentro de la carpeta:
            `/assets/videos/{idCurso}/{idSeccion}/{nombreOriginalVideo.extensión}`
    -   [ ] En el caso de subir dos veces un mismo video (mismo nombre) a una sección,
            emitir un error "amigable" adecuado de validación en pantalla.
    -   [ ] Se debe validar la extensión máxima del video (tamaño) a 3MB.
    -   [ ] Ningún archivo de video, existente o futuro, deberá "trackearse" en el repo Git.
-   Ver Stream de videos en Secciones - 4 puntos:
    -   [ ] En las páginas de Ver Curso, si una
            sección tiene un video asociado debe poder visualizarse desde la sección.
    -   [ ] El video debe visualizarse como un stream (**no una descarga**) dentro de la vista del curso
            asociado a la sección donde fue subido. No utilizar una página externa.
    -   [ ] Asegurarse de incluir en la documentación una captura de ejemplo de como se debe visualizar dentro de su página, así como un ejemplo donde encontrar esta visualización.
    -   [ ] El video solo debe ser visible para usuarios que son alumnos o profesores del curso donde fueron subidos.

---

#### Item F3 - Rutas de Aprendizaje

-   Ruta de aprendizaje - Admin - 5 puntos:
    -   [ ] En el menú de Administrador agregar una opción para manejar (crear, editar, listar) "Rutas de Aprendizaje".
    -   [ ] Una "Ruta de Aprendizaje" debe tener un nombre, y además debe poder agregarse uno o más cursos a esta.
    -   [ ] Un ejemplo podría ser una "Ruta" llamada "FullStack" y que contenga varios cursos. Pueden ser
            de la misma o distinta categoría.
    -   [ ] Las "rutas", dentro del módulo de administrador, deben poder crearse con un nombre obligatoriamente. Aplicar validación.
    -   [ ] Al editar una "ruta" debe mostrar los cursos que tenga agregado, así como permitir agregar uno o más adicionalmente en cualquier momento.
    -   [ ] Claramente, si podemos agregar un curso, debemos poder removerlo de la "ruta" en caso que lo hayamos
            agregado incorrectamente.
    -   [ ] Un curso solo debe poder estar dentro de una ruta, no puede estar en más de una, al mismo tiempo.
-   Ver Ruta de Aprendizaje - 2 puntos:
    -   [ ] Actualizar las vistas de Ver Curso para mostrar el nombre de la "ruta" de un curso, en caso de que la tenga.

---

#### Item F4 - Correlatividades

-   Correlatividades - Creación - 5 puntos:

    Solo dentro de una ruta de aprendizaje, se deben poder definir cursos correlativos.
    Un curso correlativo implica que el alumno debe estar inscripto como alumno en la correlativa previa para inscribirse al curso.

    Ejemplo, si IS3 se registra como requisito correlativo de IS4, solo los alumnos que están inscriptos en IS3 pueden autoinscribirse a IS4.

    -   [ ] Un curso puede tener cero, uno o muchos cursos correlativos previos, pero solo de cursos que formen parte de la misma ruta.
    -   [ ] Un curso que no forme parte de ninguna ruta, no puede tener correlativas.
    -   [ ] Se debe validar que un curso no se pueda registrar más de una vez como
            correlativo de otro (es decir, IS3 -> IS4 no debería poder registrarse dos veces).
    -   [ ] Se debe poder eliminar una correlativa en cualquier momento.
    -   [ ] Utilizar elementos adecuados para editar cursos y correlativas dentro de una ruta.
    -   [ ] Especial atención al remover un curso de una "ruta" solicitado previamente. Se debe validar que no tenga una correlativa antes de hacerlo.

-   Correlatividades - AutoInscripción - 5 puntos:
    -   [ ] Implementar el control de cursos correlativos al momento de autoinscribirse un alumno a un curso.
    -   [ ] El control solo debe ser aplicado en la auto-inscripción de un usuario como alumno de
            un curso.
    -   [ ] Si el admin inscribe a un alumno, no debe aplicarse el control.
    -   [ ] En caso de error de validación, se debe mostrar un error adecuado en pantalla indicando cuál(es) cursos correlativos está incumpliendo.
    -   [ ] En caso que un curso tenga muchas correlativas, se deben cumplir todas para permitir la inscripción.

---

### Testing:

-   Test de Interfaz - 5 puntos:
    Crear un test de interfaz utilizando Playwright.
    -   [ ] El test debe ser ejecutado en el navegador Mozilla únicamente.
    -   [ ] Debe mostrarse la ejecución en el modo gráfico.
    -   El test debe:
        -   [ ] Autoregistrar un usuario. Utilizar un diccionario o generador de correos y datos para que cada ejecución inserte un nuevo usuario sin repetir datos. Puede definir valores aleatorios adecuados para cada campo. Imprimir en la consola los valores al iniciar la ejecución. El password siempre será el valor utilizado de pruebas en el semestre.
        -   [ ] Hacer login con el usuario
        -   [ ] Validar carga correctamente su página "home".
        -   [ ] Inscribirse a un curso al cuál no sea posible por correlatividad.
        -   [ ] Validar el error en base a un elemento visible en pantalla. El curso debe estar definido "en duro" en la prueba. Se debe generar una captura de pantalla en este punto automático en el test.
        -   [ ] Inscribirse a un curso al cuál si sea posible por correlatividad.
        -   [ ] Validar el exito en base a un elemento visible en pantalla. El curso debe estar definido "en duro" en la prueba. Se debe generar una captura de pantalla en este punto automático en el test.
    -   Debe poder ejecutarse con un comando el cuál debe permitir la ejecución del proceso completo.
    -   Documentar el comando de forma visible y entendible (como texto) en la documentación.
    -   Mostrar la salida con capturas en la documentación.

## ⚡ Resumen Ejecutivo - Test de Interfaz

### Comando único para ejecutar el test completo:

```bash
# 1. Configuración (solo primera vez)
npm run test:e2e:setup

# 2. Iniciar servidor (mantener abierto)
npm run dev

# 3. Ejecutar test (en nueva terminal)
npm run test:e2e
```

### ✅ Validaciones automatizadas:
- 🎲 Generación de usuario único con datos aleatorios
- 🔐 Login automático con usuario creado  
- 🏠 Validación del home autenticado
- ❌ Error de correlatividades (curso con dependencias)
- ✅ Inscripción exitosa (curso sin dependencias)  
- 📸 Capturas automáticas en puntos críticos

### 📸 Capturas generadas:
- `test/screenshots/error-correlatividades.png`
- `test/screenshots/inscripcion-exitosa.png`
- `test/screenshots/test-final-state.png`

### 🔍 Ver resultados:
```bash
npx playwright show-report
```

---

## Test de Interfaz E2E con Playwright

### Descripción

El proyecto incluye un test automatizado de interfaz usando **Playwright** que valida el flujo completo de correlatividades en el sistema. El test ejecuta los siguientes pasos:

1. **Autoregistro de usuario** con datos aleatorios únicos
2. **Login** con el usuario creado
3. **Validación del home** de usuario autenticado
4. **Intento de inscripción** a curso con correlatividades (debe fallar)
5. **Inscripción exitosa** a curso sin correlatividades
6. **Capturas automáticas** en puntos críticos

### Configuración

El test está configurado para ejecutarse en **Firefox en modo headed** (ventana visible) como se requiere en el examen.

#### Archivos del test:
- `test/e2e/correlatividades.spec.js` - Test principal
- `test/e2e/test-simple.spec.js` - Test simplificado alternativo  
- `test/e2e/helpers/testDataGenerator.js` - Generador de datos de prueba
- `playwright.config.js` - Configuración de Playwright
- `test/screenshots/` - Directorio de capturas automáticas

### Comandos para ejecutar el test

#### 1. Configuración inicial (solo la primera vez):
```bash
npm run test:e2e:setup
```

Este comando:
- Instala las dependencias necesarias
- Descarga Firefox para Playwright

#### 2. Ejecutar el test:
```bash
npm run test:e2e
```

**¡IMPORTANTE!** Antes de ejecutar el test, asegurarse de que el servidor esté ejecutándose:
```bash
npm run dev
```

### Generación de datos aleatorios

El test genera automáticamente datos únicos para cada ejecución:

```javascript
// Ejemplo de datos generados:
👤 Nombre: Usuario Test 8473
📧 Email: test.usuario.1672531234567@mailtest.com  
📱 Teléfono: 098765432
🏠 Dirección: Calle Test 8473, Ciudad Test
🔑 Password: test123 (fijo como se requiere)
```

### Cursos utilizados en el test

El test utiliza cursos específicos definidos "en duro":

- **Curso con correlatividades**: JavaScript Avanzado (ID: 4)
  - URL: `/auth/curso/4`
  - Debe fallar la inscripción y mostrar error

- **Curso sin correlatividades**: HTML Básico (ID: 1)  
  - URL: `/auth/curso/1`
  - Debe permitir inscripción exitosa

### Capturas automáticas

El test genera automáticamente las siguientes capturas en `test/screenshots/`:

1. **error-correlatividades.png** - Error al intentar inscripción con correlatividades
2. **inscripcion-exitosa.png** - Éxito en inscripción sin correlatividades  
3. **test-final-state.png** - Estado final del test

### Salida ejemplo del test

```
🚀 Iniciando test de correlatividades...
============================== 
📋 DATOS DE USUARIO GENERADOS PARA EL TEST:
==============================
👤 Nombre: Usuario Test 8473
📧 Email: test.usuario.1672531234567@mailtest.com
📱 Teléfono: 098765432
🏠 Dirección: Calle Test 8473, Ciudad Test  
🔑 Password: test123
🕐 Timestamp: 1672531234567
🎲 Random ID: 8473
==============================
✅ Home de usuario autenticado cargado correctamente
✅ Error de correlatividades mostrado correctamente
📸 Captura del error guardada en: test/screenshots/error-correlatividades.png
✅ Inscripción exitosa
📸 Captura del éxito guardada en: test/screenshots/inscripcion-exitosa.png
🏁 Test completado exitosamente
📊 Usuario de prueba: test.usuario.1672531234567@mailtest.com
📁 Capturas guardadas en: test/screenshots/
```

### Reporte HTML

Después de ejecutar el test, se puede ver un reporte detallado con:
```bash
npx playwright show-report
```

---

### Documentación:

-   Wiki - 5 puntos

    En un proceso de desarrollo de Software, la documentación es clave. Para esta entrega
    tendrán que leer e investigar como utilizar la Wiki del GitLab para documentar su proyecto. Deberán:

    -   [ ] Crear una página principal en la Wiki de su proyecto.
    -   [ ] Crear una subpágina en la Wiki por cada item solicitado dentro de este examen. Lease,
            si hay 3 requerimientos a implementar, deberían haber 3 subpáginas dentro de la Wiki.
    -   Dentro de cada página de ticket deberán indicar los cambios realizados a nivel de usando la siguiente plantilla:

        -   Una o más capturas de la implementación
        -   Descripción u observaciones. Texto libre para indicar brevemente que
            implicó la implementación o modificación realizada.
        -   Base de datos. Énfasis en ajustes realizados con capturas de estas modificaciones con capturas de las modificaciones.
        -   Rutas: Creadas
        -   Modelos: Nuevos o modificados.
        -   Controlador: Nuevos o modificados.
        -   Validaciones y como se muestran. Qué validaciones ha implementado, en front o back,
            como se muestra un error de validación en pantalla (captura).
        -   Interfaz y estilos de presentación
        -   Comandos (por ejemplo comandos a ejecutar en terminal)

    -   Cada sección deberá tener un título y su desarrollo.
    -   Cada sección que no aplique deberá tener el texto "N/A". Es decir, si el requerimiento item
        #F1 (ejemplo) no tuvo modificaciones en la base de datos, no se elimina la sección, sino simplemente se define como su contenido "N/A".
    -   En la página principal de la Wiki agregar el DER completo de su aplicación, así como una breve descripción del trabajo realizado.

    -   Agregar en el footer de la App Web un enlace para llegar directamente a la página
        principal de la documentación. Este enlace deberá estar visible
        en todos los footers de la app, en caso de tener más de uno.

    -   Se evaluará:

        -   Correctitud: Lo que se ve en la Wiki representa la versión entregada del código, y viceversa. 2,5 puntos
        -   Presentación: Elementos solicitados están presentes en la Wiki. Presentación adecuada
            de elementos en la Wiki (títulos utilizando elementos de títulos, párrafos, imágenes
            son visibiles y entendibles, ortografía, coherencia entre el texto y las secciones). 2,5 puntos

        Para tener el puntaje total además se deben documentar todas las funcionalidades solicitadas correctamente.

---
