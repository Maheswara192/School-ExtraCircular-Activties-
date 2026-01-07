# 🏫 School Extra-Curricular Activities Management System

A **React-based** front-end application for managing school activities, events, and student applications.
This project is built using **Vite + React** and uses **Browser LocalStorage** as a database (No Backend Required).

---

## 📂 Project Structure

The project follows a modular, component-based architecture for easy maintenance and scaling.

```
/src
 ├── /components        # Reusable UI blocks (Forms, Cards, Tables)
 ├── /pages             # Full page views (Home, Admin Dashboard, etc.)
 ├── /context           # Global State Management (Authentication)
 ├── /utils             # Data Logic (Database simulation via LocalStorage)
 ├── /data              # Static constants
 ├── App.jsx            # Main Routing Configuration
 └── main.jsx           # Application Entry Point
```

---

## 🛠️ Key Logic & Features

### 1. 💾 Data Management (`src/utils/localStorage.js`)
Instead of a real backend, we use a **Data Access Object (DAO)** pattern.
- **Caching**: We use an in-memory cache to prevent slow repeated reads from disk.
- **Persistence**: Data is saved to `localStorage` so it survives page reloads.
- **Functions**:
  - `getEvents()` / `saveEvent()`: Manage school events.
  - `getApplications()` / `saveApplication()`: Manage student sign-ups.

### 2. 🔐 Authentication (`src/context/AuthContext.jsx`)
- Uses **React Context API** to share login state across the app.
- **Logic**: Simple hardcoded check (`admin` / `admin123`).
- **Output**: Provides `isAdmin` boolean and `login()`/`logout()` functions to any component.

### 3. 📝 Application Form (`src/components/ApplicationForm.jsx`)
- **Smart Logic**:
  - Filtering: If you select a Category (e.g., "Sports"), the Sub-Activity dropdown *automatically* updates to show only relevant clubs.
  - Optimization: Uses `useMemo` to ensure this filtering is fast and doesn't lag.

### 4. 👨‍💼 Admin Dashboard
- **Protected Route**: Only accessible if logged in.
- **Features**:
  - **Tab Switching**: Toggle between "Applications" user view and "Events" manager.
  - **CRUD**: Full ability to Create, Read, Update, and Delete data.

---

## 🚀 How to Extend

1.  **Add a New Page**:
    - Create a file in `src/pages/NewPage.jsx`.
    - Add a `<Route path="/new" element={<NewPage />} />` in `App.jsx`.

2.  **Add a New Data Type**:
    - Add a new key to `DB_KEYS` in `src/utils/localStorage.js`.
    - Create `get...` and `save...` functions following the existing pattern.

3.  **Change Styling**:
    - Edit `src/styles.css` for global changes.
    - classes follow a utility-like pattern (e.g., `btn-primary`, `card`, `text-center`).

---

## 💻 Tech Stack
- **React 18** (UI Library)
- **Vite** (Build Tool)
- **React Router DOM** (Navigation)
- **Lucide React** (Icons)
- **CSS3** (Styling using CSS Variables)
