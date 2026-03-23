     const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');

const app = express();

// --- 1. CONFIGURATION BDD ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'DEVE',
    password: 'DEVE',
    database: 'DEVE'
});

db.connect((err) => {
    if (err) console.error("❌ Erreur de connexion MySQL:", err.message);
    else console.log("✅ Connecté à la base de données MySQL");
});

// --- 2. CONFIGURATION SÉCURITÉ ---
const MASTER_CODE_ADMIN = "deve"; 

// --- 3. MIDDLEWARES (L'ordre est crucial !) ---
app.use(cors()); 
app.use(express.json()); // Permet de lire le JSON envoyé par le fetch
app.use(express.urlencoded({ extended: true })); // Permet de lire les formulaires classiques

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, '../frontend'))); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 4. ROUTE RÉELLE : INSCRIPTION ADMIN ---
app.post('/api/register-admin', (req, res) => {
    console.log("📩 Requête reçue sur /api/register-admin");
    console.log("📦 Données du corps (body) :", req.body);

    const { username, password, nom, prenom, masterCode, email } = req.body;

    // Vérification si les données existent
    if (!username || !password || !masterCode) {
        return res.status(400).json({ success: false, message: "Données manquantes dans le formulaire." });
    }

    // 1. Vérification du code secret
    if (masterCode !== MASTER_CODE_ADMIN) {
        console.log("❌ Master Code incorrect fourni :", masterCode);
        return res.status(403).json({ 
            success: false, 
            message: "Code Maître incorrect. Accès refusé !" 
        });
    }

    // 2. Insertion réelle
    const sql = `INSERT INTO users (username, nom, prenom, password, role, email, code_acces) 
                 VALUES (?, ?, ?, ?, 'admin', ?, 'MASTER')`;

    db.query(sql, [username, nom, prenom, password, email || null], (err, result) => {
        if (err) {
            console.error("❌ ERREUR SQL LORS DE L'INSERTION :", err.sqlMessage);
            return res.status(500).json({ 
                success: false, 
                message: "Erreur BDD : " + err.sqlMessage 
            });
        }
        
        console.log(`🚀 Admin créé avec succès : ${username}`);
        res.json({ 
            success: true, 
            message: "Compte Administrateur créé avec succès !" 
        });
    });
});

// --- 5. IMPORT & UTILISATION DES ROUTES ---
const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/article');

app.use('/api', authRoutes);            
app.use('/api/article', articleRoutes); 

// --- 6. LANCEMENT ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  console.log(`🔐 Le Master Code actuel est : ${MASTER_CODE_ADMIN}`);
});