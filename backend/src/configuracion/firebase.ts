import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';

// Ruta al archivo de credenciales
const rutaCredenciales = path.join(__dirname, 'credenciales', 'firebase-admin-key.json');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(rutaCredenciales)
  });
  console.log('✅ Firebase Admin inicializado correctamente');
}

// Exportar servicios
export const db = getFirestore();
export const auth = getAuth();
export const adminFirebase = admin;

// Configurar Firestore
db.settings({
  ignoreUndefinedProperties: true
});
