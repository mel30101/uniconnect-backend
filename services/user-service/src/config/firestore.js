const admin = require('firebase-admin');

class DatabaseSingleton {
  constructor() {
    if (DatabaseSingleton.instance) {
      return DatabaseSingleton.instance;
    }

    this._initializeFirebase();
    this.firestoreDb = admin.firestore();
    
    // Preparado para futura base de datos relacional
    this.relationalDb = null;

    DatabaseSingleton.instance = this;
  }

  _initializeFirebase() {
    if (!admin.apps.length) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
        try {
          privateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8');
        } catch (e) {
          console.error('ERROR: Failed to decode FIREBASE_PRIVATE_KEY_BASE64');
        }
      }

      if (!projectId || !privateKey || !clientEmail) {
        console.error('ERROR: Missing Firebase environment variables:', {
          projectId: !!projectId,
          privateKey: !!privateKey,
          clientEmail: !!clientEmail
        });
      }

      // Limpiar la llave de posibles comillas y manejar saltos de línea (si viene de texto plano)
      const formattedKey = privateKey?.trim()
        .replace(/^["']|["']$/g, '')
        .replace(/\\n/g, '\n');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey: formattedKey,
          clientEmail,
        }),
      });
    }
  }

  getFirestore() {
    return this.firestoreDb;
  }

  // Futuro método para DB relacional
  getRelationalDb() {
    if (!this.relationalDb) {
      throw new Error("Relational database not initialized yet");
    }
    return this.relationalDb;
  }
}

// Exportamos la instancia única (Singleton) y la base de datos para mantener compatibilidad con otras partes del código que esperan { db }
const dbInstance = new DatabaseSingleton();
const db = dbInstance.getFirestore();

module.exports = { db, dbInstance };
