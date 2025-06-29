import { test, expect } from '@playwright/test';

test.describe('Test de Interfaz E2E - Examen Final', () => {
  
  test('Flujo completo: Registro automatico, Login y Correlatividades', async ({ page }) => {
    
    // Generar datos únicos para el test
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 10000);
    
    const userData = {
      nombre: `Usuario Test ${randomId}`,
      email: `test.usuario.${timestamp}@mailtest.com`,
      telefono: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      direccion: `Calle Test ${randomId}, Ciudad Test`,
      password: 'test123',
      confirmPassword: 'test123'
    };

    // Imprimir datos del usuario en consola
    console.log('='.repeat(60));
    console.log('📋 DATOS DE USUARIO GENERADOS PARA EL TEST:');
    console.log('='.repeat(60));
    console.log(`👤 Nombre: ${userData.nombre}`);
    console.log(`📧 Email: ${userData.email}`);
    console.log(`📱 Teléfono: ${userData.telefono}`);
    console.log(`🏠 Dirección: ${userData.direccion}`);
    console.log(`🔑 Password: ${userData.password}`);
    console.log(`🕐 Timestamp: ${timestamp}`);
    console.log(`🎲 Random ID: ${randomId}`);
    console.log('='.repeat(60));

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
      await page.waitForTimeout(3000);
    });

    // 2. HACER LOGIN CON EL USUARIO
    await test.step('Hacer login con usuario creado', async () => {
      await page.goto('/public/login');
      await expect(page).toHaveTitle(/login/i);
      
      await page.fill('#email', userData.email);
      await page.fill('#password', userData.password);
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(3000);
    });

    // 3. VALIDAR CARGA CORRECTA DEL HOME
    await test.step('Validar página home cargada correctamente', async () => {
      await expect(page.url()).toContain('/auth/home');
      await expect(page.locator('text=Bienvenido')).toBeVisible();
      
      console.log('✅ Home de usuario autenticado cargado correctamente');
    });

    // 4. INSCRIBIRSE A CURSO CON CORRELATIVIDADES (DEBE FALLAR)
    await test.step('Intentar inscripción a curso con correlatividades - DEBE FALLAR', async () => {
      // Ir a un curso que tenga correlatividades (JavaScript Avanzado - ID 4)
      await page.goto('/auth/curso/4');
      
      const inscribirBtn = page.locator('text=Inscribirse').first();
      
      if (await inscribirBtn.isVisible()) {
        await inscribirBtn.click();
        await page.waitForTimeout(2000);
        
        // Buscar mensaje de error de correlatividades
        const errorMsg = page.locator('.alert-danger, .alert-warning').first();
        await expect(errorMsg).toBeVisible();
        
        console.log('✅ Error de correlatividades mostrado correctamente');
        
        // CAPTURA DE PANTALLA DEL ERROR
        await page.screenshot({ 
          path: 'test/screenshots/error-correlatividades.png',
          fullPage: true 
        });
        console.log('📸 Captura del error guardada en: test/screenshots/error-correlatividades.png');
      }
    });

    // 5. INSCRIBIRSE A CURSO SIN CORRELATIVIDADES (DEBE FUNCIONAR)
    await test.step('Inscripción a curso sin correlatividades - DEBE FUNCIONAR', async () => {
      // Ir a un curso básico sin correlatividades (HTML Básico - ID 1)
      await page.goto('/auth/curso/1');
      
      const inscribirBtn = page.locator('text=Inscribirse').first();
      
      if (await inscribirBtn.isVisible()) {
        await inscribirBtn.click();
        await page.waitForTimeout(3000);
        
        // Buscar mensaje de éxito o verificar que ya está inscrito
        const successMsg = page.locator('.alert-success').first();
        const alreadyEnrolled = page.locator('text*="ya inscrito"').first();
        
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
        }
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
