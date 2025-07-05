# 📘 Documentation Technique — Application de Gestion de Produits

Cette documentation fournit une vue d’ensemble de l’architecture, des choix techniques et des conventions de développement adoptées dans l'application. Elle s’adresse aux développeurs souhaitant comprendre, maintenir ou étendre le projet.

---

## 1. Architecture Générale

L’application repose sur une architecture modulaire, inspirée des bonnes pratiques de l’écosystème **React Native**.

* **Séparation claire des responsabilités** : logique métier, gestion d’état, interface utilisateur et services API sont organisés dans des dossiers dédiés.
* **Modularité par domaine fonctionnel** : chaque fonctionnalité (auth, produits, profil) est regroupée pour faciliter la maintenance.
* **Approche typée** : TypeScript, Redux et des schémas de validation assurent sécurité, lisibilité et cohérence des données.

---

## 2. Technologies Principales

| Technologie             | Usage principal                                                              |
| ----------------------- | ---------------------------------------------------------------------------- |
| **React Native**        | Construction de l’interface mobile                                           |
| **Expo + Expo Router**  | Simplifie le développement, avec navigation basée sur le système de fichiers |
| **Redux Toolkit**       | Gestion d’état globale avec slices                                           |
| **NativeWind**          | Stylisme rapide basé sur Tailwind CSS                                        |
| **TypeScript**          | Typage statique et sécurité de développement                                 |
| **Zod (ou équivalent)** | Validation des données de formulaire                                         |

---

## 3. Conventions de Développement

* **Typage strict** avec TypeScript (toutes les interfaces sont centralisées dans `types/`)
* **Composants fonctionnels** avec **hooks personnalisés**
* **Nommage** :

  * `PascalCase` pour les composants (`ProductCard`)
  * `camelCase` pour fonctions/variables
  * `kebab-case` pour les fichiers
* **Stylisme avec NativeWind et StyleSheet de ReactNative** (`className`) + `global.css`+ `Styleshet.create` pour les styles globaux
* **Réutilisabilité** : composants UI et hooks métiers sont factorisés

---

## 4. Structure du Projet

### `app/`

* Contient les **routes** de l’application via **Expo Router**
* Exemples clés :

  * `auth/_layout.tsx` : layout sans header (auth)
  * `(tabs)/_layout.tsx` : navigation principale avec onglets
  * `products/[productId].tsx` : détail produit
* Fichiers spéciaux :

  * `+html.tsx` : customisation HTML (web)
  * `+not-found.tsx` : page 404
* `global.css` : pour les classes utilitaires NativeWind

### `assets/`

* Contient les images, icônes et polices personnalisées

### `components/`

* Composants React réutilisables
* `ui/` : composants UI génériques (`ButtonCard`, `InputTextCard`, etc.)
* `products/` : composants spécifiques aux produits

### `constants/`

* Définit les couleurs, textes ou constantes globales

### `context/`

* Gestion des **contextes React** (ex. : `AuthContext`)

### `data/`

* Données simulées (`products.json`, `users.ts`) pour tests locaux

### `hooks/`

* **Hooks métiers** personnalisés, organisés par domaine (`auth/`, `product/`, `profil/`)
* Exemples :

  * `useSignIn.ts`, `useProducts.ts`, `useProductDetail.ts`

### `schemas/`

* Schémas de validation (ex : `Zod`) pour les formulaires
* Valident les entrées côté client avant traitement

### `services/`

* Fonctions d’accès aux données simulées (comme une API)
* Exemples :

  * `auth-services.ts`, `products-services.ts`, `storage-services.ts`

### `store/`

* Configuration Redux Toolkit :

  * `auth-slice.ts`, `product-slice.ts` : gestion de l’état par domaine
  * `index.ts` : création du store principal

### `types/`

* Interfaces et types TypeScript partagés à travers l’app (`Product`, `User`, etc.)

### `tailwind.config.js` & `nativewind-env.d.ts`

* Configuration de NativeWind (personnalisation du thème, intellisense des classes)

---

## 5. Flux d’Authentification

1. **Saisie** via `sign-in.tsx` et `sign-up.tsx`
2. **Validation** via les schémas `schemas/auth/`
3. **Hooks** (`useSignIn`, `useSignUp`) encapsulent la logique
4. **Services** (`auth.services.ts`) simulent le backend (vérif. utilisateurs, hachage)
5. **Stockage local** via `storage.services.ts` (`AsyncStorage`)
6. **Redux `auth-slice.ts`** met à jour l’état utilisateur
7. **Protection de routes** avec `useAuthGuard.ts`

---

## 6. Gestion des Produits (CRUD)

### Lecture (`Read`)

* L’écran `index.tsx` utilise `useProducts.ts` pour récupérer les produits via `products.services.ts`

### Création & Modification (`Create / Update`)

* Écrans : `add/index.tsx` et `edit/[productId].tsx`
* Validation via `schemas/product/`
* Hooks : `useAddProduct`, `useEditProduct`
* Image locale sélectionnée et stockée avec le produit

### Suppression (`Delete`)

* Écran `delete/[productId].tsx` ou bouton
* Hook : `useDeleteProduct.ts`

### Détail

* Écran `products/[productId].tsx` + `useProductDetail.ts`

### Synchronisation avec Redux

* Toutes les modifications CRUD sont reflétées via `product-slice.ts` pour mettre à jour la liste en temps réel
