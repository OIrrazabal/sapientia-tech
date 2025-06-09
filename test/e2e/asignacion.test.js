const request = require("supertest");
const app = require("../../index");
const db = require("../../db/conexion");

let cantidadProfesoresInicial;
const profesor_id = 11;
const curso_id = 16;
let adminCookie;

describe("Test E2E", () => {
  test("Obtener cantidad de profesores en /public/home", async () => {
    const res = await request(app).get("/public/home");

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/html/);
    
    const matches = res.text.match(/<h5 class="mb-0">/g) || [];
    cantidadProfesoresInicial = matches.length;
    
    expect(cantidadProfesoresInicial).toBeGreaterThanOrEqual(0);
  });

   test("Login como administrador", async () => {
    const credentials = {
      email: "admin@test.com",
      password: "123456"
    };

    const res = await request(app)
      .post("/public/admin-login/try")
      .type('form')
      .send(credentials);

    expect(res.statusCode).toBe(302);
    expect(res.headers["content-type"]).toMatch(/text\/plain/);
    expect(res.headers.location).toBe("/admin/home");
    adminCookie = res.headers['set-cookie'];
  });

  test("Crear asignación profesor-curso", async () => {
    const asignacion = {
      curso_id: curso_id,
      profesor_id: profesor_id
    };

    const res = await request(app)
      .post("/admin/asignaciones/crear")
      .type('form')
      .set('Cookie', adminCookie)
      .send(asignacion);

    expect(res.statusCode).toBe(302);
    expect(res.headers["content-type"]).toMatch(/text\/plain/);
    expect(res.headers.location).toBe('/admin/asignaciones');
  });

  test("Verificar incremento de profesores en home", async () => {
    const res = await request(app).get("/public/home");

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/html/);
    
    // Usar el mismo patrón actualizado
    const matches = res.text.match(/<h5 class="mb-0">/g) || [];
    const cantidadProfesoresFinal = matches.length;
    
    expect(cantidadProfesoresFinal).toBe(cantidadProfesoresInicial + 1);
  });
  
  afterAll(async () => {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM asignaciones WHERE id_profesor = ? AND id_curso = ?',
        [profesor_id, curso_id],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  });
});
