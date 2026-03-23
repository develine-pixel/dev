   const express = require('express');
const router = express.Router(); 
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
// Configuration du stockage des fichiers (pour le contenu ou images)
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

// Connexion BDD
const db = mysql.createConnection({
  host: 'localhost',
  user: 'DEVE',
  password: 'DEVE', 
  database: 'DEVE'
});
// --- NOUVELLE ROUTE POUR LE BLOG PUBLIC ---
// GET /api/article/public/all
router.get('/public/all', (req, res) => {
    // On ne récupère QUE les articles dont le statut est 'publie'
    const sql = "SELECT * FROM articles WHERE statut = 'publie' ORDER BY created_at DESC";
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erreur SQL:", err);
            return res.status(500).json({ error: "Erreur lors de la lecture des articles publics" });
        }
        res.json(results);
    });
});

// --- 1. RECHERCHE D'ARTICLES (Endpoint spécifique) ---
// GET /api/article/search?query=texte
router.get('/search', (req, res) => {
    const searchTerm = req.query.query;
    if (!searchTerm) return res.status(400).json({ error: "Terme de recherche manquant" });

    const sql = "SELECT * FROM articles WHERE (titre LIKE ? OR tags LIKE ?) AND statut = 'publie'";
    const wildCard = `%${searchTerm}%`;

    db.query(sql, [wildCard, wildCard], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur lors de la recherche" });
        res.json(results);
    });
});

// --- 2. LIRE / FILTRER LES ARTICLES ---
// GET /api/article (Supporte ?categorie=... et ?auteur=...)
router.get('/', (req, res) => {
    const { categorie, auteur } = req.query;
    let sql = "SELECT * FROM articles WHERE 1=1";
    let params = [];

    if (categorie) {
        sql += " AND categorie = ?";
        params.push(categorie);
    }
    if (auteur) {
        sql += " AND auteur = ?";
        params.push(auteur);
    }

    sql += " ORDER BY created_at DESC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur lecture articles" });
        res.json(results);
    });
});

// --- 3. LIRE UN ARTICLE UNIQUE VIA SON ID ---
// GET /api/article/:id
router.get('/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM articles WHERE id = ?";
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur serveur" });
        if (results.length === 0) return res.status(404).json({ message: "Article non trouvé" });
        res.json(results[0]);
    });
});

// --- 4. CRÉER UN ARTICLE (Avec Validation) ---
// POST /api/article
router.post('/', upload.single('document'), (req, res) => {
    const { titre, auteur, categorie, tags, author_id, category_id } = req.body;
    
    // Validation des entrées (Exigence Cahier des charges)
    if (!titre || !auteur || !categorie) {
        return res.status(400).json({ error: "Champs obligatoires manquants (titre, auteur, catégorie)." });
    }

    const contenu_fichier = req.file ? req.file.filename : "Pas de fichier"; 

    const sql = `INSERT INTO articles 
                 (titre, contenu, auteur, categorie, tags, author_id, category_id, statut) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [titre, contenu_fichier, auteur, categorie, tags, author_id, category_id, 'en_attente'];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: "Erreur création", details: err.message });
        res.status(201).json({ message: "Article créé avec succès !", id: result.insertId });
    });
});

// --- 5. MODIFIER UN ARTICLE ---
// PUT /api/article/:id
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { titre, categorie, tags } = req.body;

    const sql = "UPDATE articles SET titre = ?, categorie = ?, tags = ? WHERE id = ?";
    db.query(sql, [titre, categorie, tags, id], (err, result) => {
        if (err) return res.status(500).json({ error: "Erreur modification" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Article non trouvé" });
        res.json({ message: "Article mis à jour !" });
    });
});

// --- 6. SUPPRIMER UN ARTICLE ---
// DELETE /api/article/:id
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM articles WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: "Erreur suppression" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Article inexistant" });
        res.json({ message: "Article supprimé avec succès !" });
    });
});

// --- 7. MODIFIER LE STATUT (ADMIN UNIQUEMENT) ---
// PATCH /api/article/:id/statut
router.patch('/:id/statut', (req, res) => {
    const id = req.params.id;
    const { statut, commentaire } = req.body;
    const statutsValides = ['en_attente', 'publie', 'rejete'];

    if (!statutsValides.includes(statut)) return res.status(400).json({ message: "Statut invalide" });

    const sql = "UPDATE articles SET statut = ?, commentaire = ? WHERE id = ?";
    db.query(sql, [statut, commentaire || null, id], (err, result) => {
        if (err) return res.status(500).json({ error: "Erreur mise à jour" });
        res.json({ message: "Statut mis à jour !" });
    });
});

module.exports = router;