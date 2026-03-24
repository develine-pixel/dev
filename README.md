# tp-22
# dev
Blog Moderne : API Backend & Dashboard

Ce projet est un système de gestion de contenu (CMS) évolutif, structuré pour gérer des flux de publication complexes, des interactions utilisateurs et un système de modération administrative.
Outils Techniques

    Backend : Node.js & Express (API REST).

    Base de Données : MySQL (Structure relationnelle normalisée).

    Gestion de Fichiers : Multer (Upload de médias).

    Sécurité : RBAC (Contrôle d'accès basé sur les rôles : admin, author, member).

    Frontend : HTML5 / CSS3 Moderne / JavaScript Asynchrone (Fetch).
 Arborescence du Projet
Plaintext

/
├── uploads/                # Fichiers médias (PDF, Images)
├── public/                 # Interface Web
│   ├── login.html          # Authentification
│   ├── inscription.html    # Inscription & Candidatures
│   ├── index.html          # Panel Admin (Gestion & Approbation)
│   ├── rediger.html        # Interface de création Auteur
│   └── blog.html           # Flux public des articles
├── app.js                  # Logique serveur et Endpoints
├── package.json            # Dépendances Node.js
└── schema_complet.sql      # Script de structure SQL

 Architecture de la Base de Données

Voici les tables implémentées pour permettre une extension future du blog (système de tags, commentaires et notifications) :
Table	Rôle
users	Utilisateurs (Admin, Auteurs, Membres).
articles	Contenu principal, statut de publication et liens auteurs.
author_requests	Stockage des candidatures pour le rôle de rédacteur.
categories	Classification des articles.
tags	Mots-clés pour le référencement.
article_tags	Table de liaison (Many-to-Many) entre articles et tags.
comments	Interactions des lecteurs sur les articles.
notifications	Alertes système (ex: "Votre article a été publié").
 Présentation des API (Endpoints principaux)

    POST /api/login : Authentification utilisateur.

    POST /api/register : Création de compte et gestion des author_requests.

    GET /api/articles : Récupération des articles (filtres par catégories/tags possibles).

    POST /api/articles : Création d'article avec upload de document.

    POST /api/admin/approve-author/:id : Validation d'un auteur et transfert depuis author_requests.

    GET /api/comments/:articleId : Récupération des commentaires liés à un article.

Prérequis et Lancement
1. Initialisation SQL

Exécutez votre script SQL pour générer les 8 tables identifiées. Assurez-vous que les clés étrangères sont bien reliées (notamment author_id dans articles vers id dans users).
2. Installation des dépendances
Bash

npm install express mysql2 cors multer body-parser

3. Démarrage
Bash

# Lancement du serveur
node app.js

Le serveur écoute sur le port 3000. L'interface est accessible via http://localhost:3000/login.html.
