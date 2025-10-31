# AFS Lista de Materiales

**Sistema de listado de materiales de obra con generación de PDF profesional**

## 🚀 Stack Tecnológico

- **Frontend**: React 18 + Tailwind CSS
- **PDF**: jsPDF con diseño profesional
- **Estado**: React Hooks + LocalStorage
- **Deploy**: GitHub Pages

## ✨ Características

- **Mobile-first**: Diseño responsive optimizado para móviles
- **PDF profesional**: Generación automática con logo, tablas estilizadas y paginación
- **Gestión de estado**: Persistencia local con sincronización automática
- **Sistema de login**: Autenticación básica con cerrar sesión
- **UI/UX**: Interfaz intuitiva con botones grandes y navegación simple

## 🏗️ Arquitectura

```
src/
├── components/          # Componentes reutilizables
│   ├── MaterialRow.jsx  # Fila de material con controles
│   ├── CategorySection.jsx # Sección collapsible por categoría
│   ├── AddMaterialModal.jsx # Modal para agregar materiales
│   ├── ShareButton.jsx  # Botón de generar PDF
│   └── LoginPage.jsx    # Página de autenticación
├── pages/
│   └── BudgetsPage.jsx   # Pantalla principal con estado
├── utils/
│   └── pdfGenerator.js  # Generador de PDF profesional
└── data/
    └── materials.js     # Base de datos de materiales
```

## 🎯 Funcionalidades Clave

- **Gestión de materiales**: Agregar, editar y organizar por categorías
- **Control de cantidades**: Botones [+] y [–] con persistencia
- **Generación de PDF**: Documento profesional con logo y tablas estilizadas
- **Compartir nativo**: Web Share API con fallback a descarga
- **Responsive**: Optimizado para dispositivos móviles

## 🛠️ Instalación

```bash
npm install
npm start
```

## 📱 Deploy

Configurado para GitHub Pages con autenticación local y generación de PDF en cliente.

---

**Desarrollado con enfoque en usabilidad y experiencia móvil para usuarios no técnicos**
