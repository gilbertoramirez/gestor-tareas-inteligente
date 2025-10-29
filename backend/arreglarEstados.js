const admin = require('firebase-admin');

// Inicializar Firebase
const credenciales = require('./src/configuracion/credenciales/firebase-admin-key.json');
admin.initializeApp({
  credential: admin.credential.cert(credenciales)
});

const db = admin.firestore();

async function arreglarEstados() {
  try {
    console.log('🔄 Obteniendo tareas con estados incorrectos...');
    const snapshot = await db.collection('tareas').get();
    
    console.log(`📊 Total de tareas: ${snapshot.size}`);
    
    let arregladas = 0;
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      
      // Si el estado no es válido, ponerlo como "pendiente"
      const estadosValidos = ['pendiente', 'trabajando', 'pausada', 'revision', 'completada', 'cancelada'];
      
      if (!estadosValidos.includes(data.estado)) {
        console.log(`🔧 Arreglando "${data.titulo}" (estado inválido: "${data.estado}" → "pendiente")`);
        batch.update(doc.ref, { estado: 'pendiente' });
        arregladas++;
      }
    });
    
    if (arregladas > 0) {
      await batch.commit();
      console.log(`✅ Se arreglaron ${arregladas} tareas`);
    } else {
      console.log('✅ No hay tareas que arreglar');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

arreglarEstados();
