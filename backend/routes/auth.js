    const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Connexion à la base de données
const db = mysql.createConnection({
    host: 'localhost',
    user: 'DEVE',
    password: 'DEVE',
    database: 'DEVE'
});

// --- 1. INSCRIPTION (LECTEUR OU AUTEUR) ---
router.post('/register', (req, res) => {
    const { username, nom, prenom, password, role, email } = req.body;
    
    // Par défaut, code_acces est NULL (En attente)
    const sql = `INSERT INTO users (username, nom, prenom, password, role, email, code_acces) 
                 VALUES (?, ?, ?, ?, ?, ?, NULL)`;
    
    db.query(sql, [username, nom, prenom, password, role || 'author', email || null], (err) => {
        if (err) {
            console.error("ERREUR SQL :", err);
            return res.status(500).json({ 
                success: false, 
                message: "Erreur lors de l'inscription (Pseudo ou Email déjà utilisé ?)" 
            });
        }
        res.status(201).json({ success: true, message: "Inscription réussie ! En attente de validation." });
    });
});

// --- 2. CONNEXION ---
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Erreur serveur" });

        if (results.length > 0) {
            const user = results[0];

            // LOGIQUE DE VALIDATION POUR LES AUTEURS
            if (user.role === 'author') {
                
                // CAS 1 : Compte rejeté
                if (user.code_acces === 'REJETE') {
                    return res.status(403).json({ 
                        success: false, 
                        message: "Votre demande de rédacteur a été refusée. Veuillez soumettre une nouvelle candidature." 
                    });
                }

                // CAS 2 : Compte toujours en attente (NULL ou vide)
                if (!user.code_acces) {
                    return res.status(403).json({ 
                        success: false, 
                        message: "Votre compte est toujours en cours de validation par l'administrateur." 
                    });
                }
            }

            // CAS 3 : Connexion autorisée (Auteur validé, Admin ou Simple Lecteur)
            res.json({ 
                success: true, 
                role: user.role, 
                prenom: user.prenom, 
                id: user.id,
                code: user.code_acces 
            });
        } else {
            res.status(401).json({ success: false, message: "Identifiants incorrects" });
        }
    });
});

// --- 3. LISTER LES CANDIDATURES (POUR ADMIN) ---
router.get('/admin/author-requests', (req, res) => {
    // On cherche ceux qui n'ont pas encore été traités (code_acces est NULL)
    const sql = "SELECT id, username, nom, prenom, email FROM users WHERE role = 'author' AND code_acces IS NULL";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// --- 4. APPROUVER UN AUTEUR ---
router.post('/admin/approve-author/:userId', (req, res) => {
    const userId = req.params.userId;
    const codeGenere = "PASS-" + Math.floor(1000 + Math.random() * 9000);

    const sql = "UPDATE users SET code_acces = ? WHERE id = ?";
    db.query(sql, [codeGenere, userId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Erreur BDD" });
        res.json({ success: true, message: "Auteur approuvé !", code: codeGenere });
    });
});

// --- 5. REJETER UN AUTEUR ---
router.post('/admin/reject-author/:userId', (req, res) => {
    const userId = req.params.userId;
    
    // On écrit 'REJETE' dans code_acces pour bloquer proprement
    const sql = "UPDATE users SET code_acces = 'REJETE' WHERE id = ?";
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Erreur BDD" });
        res.json({ success: true, message: "Candidature rejetée avec succès." });
    });
});

module.exports = router;