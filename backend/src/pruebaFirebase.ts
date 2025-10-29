import { db } from './configuracion/firebase';

async function probarConexion() {
  try {
    console.log('🔄 Probando conexión a Firestore...');
    
    // Intentar escribir un documento de prueba
    const coleccionPrueba = db.collection('prueba');
    const docRef = await coleccionPrueba.add({
      mensaje: 'Hola desde el backend',
      timestamp: new Date()
    });
    
    console.log('✅ Documento de prueba creado con ID:', docRef.id);
    
    // Leer el documento
    const doc = await docRef.get();
    console.log('📄 Datos del documento:', doc.data());
    
    // Eliminar el documento de prueba
    await docRef.delete();
    console.log('🗑️  Documento de prueba eliminado');
    
    console.log('✅ Conexión a Firebase exitosa');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al conectar con Firebase:', error);
    process.exit(1);
  }
}

probarConexion();
