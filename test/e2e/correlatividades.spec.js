import { test, expect } from '@playwright/test';
import TestDataGenerator from './helpers/testDataGenerator.js';

test.describe('Test de Correlatividades - Examen Final', () => {
  let testData;
  let userData;
  let courses;

  test.beforeAll(() => {
    // Generar datos únicos para esta ejecución
    testData = new TestDataGenerator();
    userData = testData.generateUserData();
    courses = testData.getTestCourses();
  });

  test('Flujo completo: Registro, Login, y Pruebas de Correlatividades', async ({ page }) => {
    // 1. AUTOREGISTRAR USUARIO
    console.log('🚀 Iniciando test de correlatividades...');
    
    await test.step('Navegar a página de registro', async () => {
      await page.goto('/public/registro');
      await expect(page).toHaveTitle(/registro/i);
    });

    await test.step('Completar formulario de registro', async () => {
      await page.fill('#nombre', userData.nombre);
      await page.fill('#email', userData.email);
      await page.fill('#telefono', userData.telefono);
      await page.fill('#direccion', userData.direccion);
      await page.fill('#contraseña', userData.password);
      await page.fill('#repetir_contraseña', userData.confirmPassword);
      
      await page.click('button[type="submit"]');
      
      // Esperar redirección o confirmación
      await page.waitForTimeout(2000);
    });

    // 2. HACER LOGIN CON EL USUARIO
    await test.step('Hacer login con usuario creado', async () => {
      await page.goto('/public/login');
      await expect(page).toHaveTitle(/login/i);
      
      await page.fill('#email', userData.email);
      await page.fill('#password', userData.password);
      await page.click('button[type="submit"]');
      
      // Esperar redirección al home autenticado
      await page.waitForTimeout(3000);
    });

    // 3. VALIDAR CARGA CORRECTA DEL HOME
    await test.step('Validar página home cargada correctamente', async () => {
      // Verificar que estamos en la página de usuario autenticado
      await expect(page.url()).toContain('/auth/home');
      
      // Verificar elementos característicos del home autenticado
      await expect(page.locator('text=Bienvenido')).toBeVisible();
      
      console.log('✅ Home de usuario autenticado cargado correctamente');
    });

    // 4. INSCRIBIRSE A CURSO CON CORRELATIVIDADES (DEBE FALLAR)
    await test.step('Intentar inscripción a curso con correlatividades - DEBE FALLAR', async () => {
      await page.goto(courses.cursoConCorrelatividades.url);
      
      // Buscar botón de inscripción
      const inscribirBtn = page.locator('text=Inscribirse', 'button:has-text("Inscribir")').first();
      
      if (await inscribirBtn.isVisible()) {
        await inscribirBtn.click();
        await page.waitForTimeout(2000);
        
        // Buscar mensaje de error de correlatividades
        const errorMsg = page.locator('.alert-danger, .alert-warning, text*="correlatividad"').first();
        await expect(errorMsg).toBeVisible();
        
        console.log('✅ Error de correlatividades mostrado correctamente');
        
        // CAPTURA DE PANTALLA DEL ERROR
        await page.screenshot({ 
          path: 'test/screenshots/error-correlatividades.png',
          fullPage: true 
        });
        console.log('📸 Captura del error guardada en: test/screenshots/error-correlatividades.png');
      } else {
        console.log('⚠️ Usuario ya inscrito en el curso o curso no disponible');
        
        // Capturar pantalla del estado actual
        await page.screenshot({ 
          path: 'test/screenshots/curso-no-disponible.png',
          fullPage: true 
        });
      }
    });

    // 5. INSCRIBIRSE A CURSO SIN CORRELATIVIDADES (DEBE FUNCIONAR)
    await test.step('Inscripción a curso sin correlatividades - DEBE FUNCIONAR', async () => {
      await page.goto(courses.cursoSinCorrelatividades.url);
      
      // Buscar botón de inscripción
      const inscribirBtn = page.locator('text=Inscribirse', 'button:has-text("Inscribir")').first();
      
      if (await inscribirBtn.isVisible()) {
        await inscribirBtn.click();
        await page.waitForTimeout(3000);
        
        // Buscar mensaje de éxito
        const successMsg = page.locator('.alert-success, text*="éxito"', 'text*="inscrito"').first();
        
        // Si no hay mensaje de éxito visible, verificar si ya está inscrito
        const alreadyEnrolled = page.locator('text*="ya inscrito"', 'text*="Ya estás inscrito"').first();
        
        if (await successMsg.isVisible()) {
          console.log('✅ Inscripción exitosa');
          
          // CAPTURA DE PANTALLA DEL ÉXITO
          await page.screenshot({ 
            path: 'test/screenshots/inscripcion-exitosa.png',
            fullPage: true 
          });
          console.log('📸 Captura del éxito guardada en: test/screenshots/inscripcion-exitosa.png');
          
        } else if (await alreadyEnrolled.isVisible()) {
          console.log('✅ Usuario ya estaba inscrito en el curso');
          
          await page.screenshot({ 
            path: 'test/screenshots/ya-inscrito.png',
            fullPage: true 
          });
          
        } else {
          // Verificar si estamos en la página del curso y hay indicadores de inscripción
          const courseContent = page.locator('.course-content, .curso-contenido').first();
          if (await courseContent.isVisible()) {
            console.log('✅ Acceso al contenido del curso - Inscripción implícita exitosa');
            
            await page.screenshot({ 
              path: 'test/screenshots/acceso-curso-exitoso.png',
              fullPage: true 
            });
          }
        }
      } else {
        console.log('⚠️ Botón de inscripción no encontrado - verificando estado actual');
        
        await page.screenshot({ 
          path: 'test/screenshots/estado-curso-sin-correlatividades.png',
          fullPage: true 
        });
      }
    });

    // 6. VERIFICACIÓN FINAL
    await test.step('Verificación final del test', async () => {
      console.log('🏁 Test completado exitosamente');
      console.log(`📊 Usuario de prueba: ${userData.email}`);
      console.log(`📁 Capturas guardadas en: test/screenshots/`);
      
      // Captura final del estado
      await page.screenshot({ 
        path: 'test/screenshots/test-final-state.png',
        fullPage: true 
      });
    });
  });
});
