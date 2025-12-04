// Sistema de traducción simple
const translations = {
  es: {
    // Navbar
    'nav.features': 'Funcionalidades',
    'nav.how': 'Cómo funciona',
    'nav.aboutTeam': 'Sobre el equipo',
    'nav.aboutProduct': 'Sobre el producto',
    'nav.members': 'Integrantes',
    'nav.pricing': 'Precios',
    'nav.login': 'Iniciar sesión',
    'nav.signup': 'Registrarse',
    
    // Hero
    'hero.title': 'VolunPath — Conecta. Organiza. Potencia tu impacto.',
    'hero.description': 'Un espacio para que organizaciones gestionen proyectos y voluntarios encuentren su camino.<br>Dashboard privado, perfiles públicos e informes listos para compartir.',
    'hero.button': 'Prueba gratis',
    
    // Features
    'features.title': 'Funcionalidades',
    'features.subtitle': 'Todo lo que necesitas en un solo lugar: conecta tu equipo, organiza tus tareas<br>y lleva el control de tu impacto sin complicaciones.',
    'features.publicProfiles': 'Perfiles públicos',
    'features.publicProfilesDesc': 'Muestra quiénes son, su misión y eventos para atraer voluntarios y donantes.',
    'features.dashboard': 'Dashboard privado',
    'features.dashboardDesc': 'Roles, tareas y calendarios para coordinar equipos sin depender de canales dispersos.',
    'features.inventory': 'Inventarios & presupuestos',
    'features.inventoryDesc': 'Control de stock, historial de donaciones y control de gastos.',
    'features.reports': 'Reportes',
    'features.reportsDesc': 'Exporta métricas de impacto y horas de voluntariado en un clic.',
    
    // How it works
    'how.title': '¿Cómo funciona?',
    'how.subtitle': 'Regístrate gratis, crea tu espacio y empieza a coordinar con tu equipo.<br>Organiza eventos, gestiona recursos y mide resultados en minutos.',
    'how.connect': 'Conecta.',
    'how.organize': 'Organiza.',
    'how.impact': 'Potencia tu impacto.',
    'how.register': 'Regístrate:',
    'how.registerDesc': 'Registra tu organización o perfil de voluntario.',
    'how.organizeTitle': 'Organiza:',
    'how.organizeDesc': 'Planifica eventos, asigna tareas y administra inventario.',
    'how.measure': 'Mide:',
    'how.measureDesc': 'Genera reportes para donantes y comparte resultados.',
    
    // About Team
    'aboutTeam.title': 'Sobre el equipo',
    'aboutTeam.subtitle': 'Conoce a las personas detrás de VolunPath.<br>Un equipo comprometido con el impacto social y la innovación tecnológica.',
    
    // About Product
    'aboutProduct.title': 'Sobre el producto',
    'aboutProduct.subtitle': 'Descubre cómo VolunPath transforma la gestión de voluntariado.<br>Una plataforma diseñada para conectar, organizar y potenciar el impacto social.',
    
    // Team Members
    'team.title': 'Nuestro Equipo',
    'team.subtitle': 'Conoce a los integrantes que hacen posible VolunPath.<br>Un equipo comprometido con la innovación y el impacto social.',
    
    // Pricing
    'pricing.title': 'Planes',
    'pricing.subtitle': 'Elige el plan que mejor se adapte a tu organización: empieza gratis o<br>potencia tu alcance con herramientas avanzadas.',
    'pricing.free': 'Gratis',
    'pricing.freeDesc': 'Perfil público + Dashboard básico + Miembros y voluntarios limitados',
    'pricing.freeButton': 'Comenzar',
    'pricing.pro': 'Pro',
    'pricing.proDesc': 'Destacar perfil o eventos + Dashboard profesional + Miembros ilimitados',
    'pricing.proButton': 'Elegir Pro',
    
    // Footer
    'footer.tagline': 'Conecta. Organiza. Potencia tu impacto.',
    'footer.email': 'Correo:',
    'footer.follow': 'Síguenos:'
  },
  en: {
    // Navbar
    'nav.features': 'Features',
    'nav.how': 'How it works',
    'nav.aboutTeam': 'About the team',
    'nav.aboutProduct': 'About the product',
    'nav.members': 'Members',
    'nav.pricing': 'Pricing',
    'nav.login': 'Log in',
    'nav.signup': 'Sign up',
    
    // Hero
    'hero.title': 'VolunPath — Connect. Organize. Empower your impact.',
    'hero.description': 'A space for organizations to manage projects and volunteers to find their way.<br>Private dashboard, public profiles, and reports ready to share.',
    'hero.button': 'Try for free',
    
    // Features
    'features.title': 'Features',
    'features.subtitle': 'Everything you need in one place: connect your team, organize your tasks<br>and take control of your impact without complications.',
    'features.publicProfiles': 'Public profiles',
    'features.publicProfilesDesc': 'Show who they are, their mission and events to attract volunteers and donors.',
    'features.dashboard': 'Private dashboard',
    'features.dashboardDesc': 'Roles, tasks and calendars to coordinate teams without relying on scattered channels.',
    'features.inventory': 'Inventories & budgets',
    'features.inventoryDesc': 'Stock control, donation history and expense control.',
    'features.reports': 'Reports',
    'features.reportsDesc': 'Export impact metrics and volunteer hours in one click.',
    
    // How it works
    'how.title': 'How does it work?',
    'how.subtitle': 'Sign up for free, create your space and start coordinating with your team.<br>Organize events, manage resources and measure results in minutes.',
    'how.connect': 'Connect.',
    'how.organize': 'Organize.',
    'how.impact': 'Empower your impact.',
    'how.register': 'Sign up:',
    'how.registerDesc': 'Register your organization or volunteer profile.',
    'how.organizeTitle': 'Organize:',
    'how.organizeDesc': 'Plan events, assign tasks and manage inventory.',
    'how.measure': 'Measure:',
    'how.measureDesc': 'Generate reports for donors and share results.',
    
    // About Team
    'aboutTeam.title': 'About the team',
    'aboutTeam.subtitle': 'Meet the people behind VolunPath.<br>A team committed to social impact and technological innovation.',
    
    // About Product
    'aboutProduct.title': 'About the product',
    'aboutProduct.subtitle': 'Discover how VolunPath transforms volunteer management.<br>A platform designed to connect, organize and empower social impact.',
    
    // Team Members
    'team.title': 'Our Team',
    'team.subtitle': 'Meet the members who make VolunPath possible.<br>A team committed to innovation and social impact.',
    
    // Pricing
    'pricing.title': 'Plans',
    'pricing.subtitle': 'Choose the plan that best suits your organization: start for free or<br>boost your reach with advanced tools.',
    'pricing.free': 'Free',
    'pricing.freeDesc': 'Public profile + Basic dashboard + Limited members and volunteers',
    'pricing.freeButton': 'Get started',
    'pricing.pro': 'Pro',
    'pricing.proDesc': 'Highlight profile or events + Professional dashboard + Unlimited members',
    'pricing.proButton': 'Choose Pro',
    
    // Footer
    'footer.tagline': 'Connect. Organize. Empower your impact.',
    'footer.email': 'Email:',
    'footer.follow': 'Follow us:'
  }
};

// Función para cambiar el idioma
function changeLanguage(lang) {
  // Guardar preferencia
  localStorage.setItem('language', lang);
  
  // Actualizar atributo lang del HTML
  document.documentElement.lang = lang;
  
  // Actualizar todos los elementos con data-i18n
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.value = translations[lang][key];
      } else if (element.tagName === 'A' && element.href && !element.href.includes('#')) {
        // Para enlaces, solo cambiar el texto, no el HTML completo
        element.textContent = translations[lang][key];
      } else {
        element.innerHTML = translations[lang][key];
      }
    }
  });
  
  // Actualizar texto del botón
  document.getElementById('currentLang').textContent = lang.toUpperCase();
}

// Inicializar idioma al cargar
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('language') || 'es';
  changeLanguage(savedLang);
  
  // Event listener para el botón de idioma
  document.getElementById('languageToggle').addEventListener('click', () => {
    const currentLang = document.documentElement.lang || 'es';
    const newLang = currentLang === 'es' ? 'en' : 'es';
    changeLanguage(newLang);
  });
});

