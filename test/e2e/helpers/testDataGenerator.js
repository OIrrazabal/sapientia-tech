/**
 * Generador de datos de prueba
 * Crea datos únicos para cada ejecución del test
 */
class TestDataGenerator {
  constructor() {
    this.timestamp = Date.now();
    this.randomId = Math.floor(Math.random() * 10000);
  }

  /**
   * Genera datos de usuario únicos
   */
  generateUserData() {
    const userData = {
      nombre: `Usuario Test ${this.randomId}`,
      email: `test.usuario.${this.timestamp}@mailtest.com`,
      telefono: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      direccion: `Calle Test ${this.randomId}, Ciudad Test`,
      password: 'test123', // Password fijo como se solicita
      confirmPassword: 'test123'
    };

    // Imprimir datos en consola como se requiere
    console.log('='.repeat(60));
    console.log('📋 DATOS DE USUARIO GENERADOS PARA EL TEST:');
    console.log('='.repeat(60));
    console.log(`👤 Nombre: ${userData.nombre}`);
    console.log(`📧 Email: ${userData.email}`);
    console.log(`📱 Teléfono: ${userData.telefono}`);
    console.log(`🏠 Dirección: ${userData.direccion}`);
    console.log(`🔑 Password: ${userData.password}`);
    console.log(`🕐 Timestamp: ${this.timestamp}`);
    console.log(`🎲 Random ID: ${this.randomId}`);
    console.log('='.repeat(60));

    return userData;
  }

  /**
   * Obtiene cursos predefinidos para las pruebas
   */
  getTestCourses() {
    return {
      // Curso que debe fallar por correlatividades (curso avanzado)
      cursoConCorrelatividades: {
        id: '4', // Ajustar según tu BD
        nombre: 'JavaScript Avanzado',
        url: '/auth/curso/4'
      },
      // Curso que debe permitir inscripción (curso básico)
      cursoSinCorrelatividades: {
        id: '1', // Ajustar según tu BD  
        nombre: 'HTML Básico',
        url: '/auth/curso/1'
      }
    };
  }
}

export default TestDataGenerator;
