 const mysql = require('mysql2');

// Utilisation de createPool pour une meilleure stabilité (évite les déconnexions intempestives)
const db = mysql.createPool({
  host: 'localhost',
  user: 'DEVE',
  password: 'DEVE', 
  database: 'DEVE',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test de la connexion au démarrage
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Erreur de connexion BDD :', err.message);
  } else {
    console.log('✅ Base de données connectée avec succès (Pool) !');
    connection.release(); // Libère la connexion pour qu'elle retourne dans le pool
  }
});

module.exports = db;