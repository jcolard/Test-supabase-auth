# 🚀 Déploiement sur Vercel

## Étapes (5 minutes)

### 1. Créer un repo GitHub
Poussez ce dossier sur GitHub (nouveau repo `notes-de-frais`)

### 2. Importer sur Vercel
- Allez sur https://vercel.com/new
- Sélectionnez votre repo GitHub
- Cliquez "Deploy"

### 3. Ajouter les variables d'environnement
Dans Vercel > Settings > Environment Variables, ajoutez :

```
NEXT_PUBLIC_SUPABASE_URL=https://ganvauvvrciiiomoieoo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbnZhdXZ2cmNpaWlvbW9pZW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyOTcyNTMsImV4cCI6MjA4ODg3MzI1M30.cYCyLhIZ5ZqgA6tIhMi8RitBSRUs_01GFN580P5QXK4
```

### 4. Redéployer
Après avoir ajouté les variables, redéployez depuis le dashboard Vercel.

## ✅ Supabase (déjà configuré)
- Projet : notes-de-frais
- URL : https://ganvauvvrciiiomoieoo.supabase.co
- Auth : email/password activé
- Storage bucket "receipts" : créé
- RLS : activé (chaque user voit uniquement ses données)
