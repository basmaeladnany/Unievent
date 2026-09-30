# UniEvent — site React (Vite)

## Lancer le site
```bash
npm install
npm run dev        # test en local (http://localhost:5173)
npm run build      # version finale dans dist/
```

## Où mettre vos images (rien à coder)
Les photos sont chargées **automatiquement** depuis ces dossiers. Il suffit d'y déposer vos fichiers
(.jpg, .jpeg, .png, .webp) — elles apparaissent dans le site et dans la visionneuse plein écran.

| Dossier | Section du site | Nommage |
|---|---|---|
| `src/assets/realisations/` | **Nos Réalisations** (mosaïque) | `01.jpg`, `02.jpg`… (l'ordre = ordre d'affichage) |
| `src/assets/buffets/` | **Buffets & gastronomie** | `NN-categorie.jpg` |

**Buffets — filtres Salé / Sucré / Grillades** : le nom du fichier décide de l'onglet.
- `10-sale.jpg` → onglet « Salé »
- `11-sucre.jpg` → onglet « Sucré »
- `12-grillades.jpg` → onglet « Grillades »
- un fichier sans catégorie (ex. `13.jpg`) apparaît seulement dans « Tout ».

Conseil : avant d'ajouter des photos, réduisez-les (≈ 1400 px de large, < 400 Ko) pour un site rapide sur téléphone.

## Vidéos (`src/assets/videos/`)
- `intro.mp4` + `intro-poster.jpg` : vidéo d'introduction (boucle, muette, compatible iPhone/Android).
- `pack.mp4` + `pack-poster.jpg` : vidéo du Pack Alahlam (avec son, lecture/pause, barre de progression, plein écran).
Pour changer une vidéo : remplacez le fichier en gardant le même nom (format MP4 H.264 + AAC, idéalement < 6 Mo).

## Informations à modifier (haut de `src/App.jsx`)
- `PHONE` : numéro utilisé pour l'appel et WhatsApp — `PHONE_LABEL` : numéro affiché.
  ⚠ Ces deux numéros étaient différents dans la version d'origine : vérifiez-les.
- `ADDRESS` et `LAT_LNG` : adresse et position sur la carte Google.
- `REVIEWS` : avis clients. `PACK_ITEMS` : contenu du pack. `FOOD_CHIPS` : familles de mets.
