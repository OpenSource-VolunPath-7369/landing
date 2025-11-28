# Funcionalidades del Frontend - Volunpath

## 1. Autenticación y Registro

### 1.1. Inicio de Sesión
- **Página de Login**: Permite a los usuarios iniciar sesión en la plataforma
- **Autenticación con Backend**: Integración con el endpoint de sign-in del backend
- **Gestión de Tokens JWT**: Almacenamiento y uso de tokens JWT para autenticación
- **Redirección Automática**: Redirección automática según el rol del usuario (voluntario → /comunidad, organización → /dashboard)
- **Validación de Formulario**: Validación de campos requeridos (usuario y contraseña)
- **Manejo de Errores**: Visualización de mensajes de error cuando las credenciales son incorrectas
- **Recordar Usuario**: Opción para recordar el nombre de usuario en el navegador

### 1.2. Registro de Usuarios
- **Registro de Voluntarios**: Formulario completo para registro de nuevos voluntarios con campos como nombre, email, contraseña, habilidades, intereses, ubicación, biografía y avatar
- **Registro de Organizaciones**: Formulario para registro de organizaciones con campos como nombre, email, contraseña, descripción, sitio web, teléfono, dirección, año de fundación, categorías, redes sociales y logo
- **Selección de Tipo de Usuario**: Radio buttons horizontales para seleccionar entre "Voluntario" y "Organización"
- **Validación de Campos**: Validación en tiempo real de todos los campos del formulario
- **Carga de Imágenes**: Funcionalidad para cargar y previsualizar avatares/logos en formato base64
- **Integración con Backend**: Creación de usuario y perfil correspondiente en el backend

---

## 2. Gestión de Perfiles

### 2.1. Perfil de Usuario
- **Visualización de Perfil**: Página dedicada para visualizar y editar el perfil del usuario autenticado
- **Edición de Perfil para Voluntarios**: Permite actualizar información personal como nombre, email, teléfono, biografía, habilidades, intereses, ubicación y avatar
- **Edición de Perfil para Organizaciones**: Permite actualizar información de la organización como nombre, email, teléfono, descripción, sitio web, dirección, año de fundación, categorías, redes sociales y logo
- **Actualización en Tiempo Real**: Los cambios se reflejan inmediatamente en el backend
- **Validación de Formularios**: Validación de campos antes de guardar cambios
- **Manejo de Imágenes**: Actualización de avatares y logos con almacenamiento en base64

---

## 3. Comunidad y Publicaciones

### 3.1. Página de Comunidad
- **Visualización de Publicaciones**: Muestra todas las publicaciones de las organizaciones en un feed
- **Filtrado por Organización**: Permite ver publicaciones de organizaciones específicas
- **Sistema de Likes**: Los voluntarios pueden dar like a las publicaciones que les interesan
- **Información de Organizaciones**: Muestra detalles de las organizaciones que publican
- **Navegación a Perfiles**: Enlaces para ver el perfil completo de cada organización
- **Imágenes de Publicaciones**: Visualización de imágenes asociadas a cada publicación

### 3.2. Dashboard de Organizaciones
- **Gestión de Publicaciones**: Las organizaciones pueden ver todas sus publicaciones en un panel centralizado
- **Crear Nueva Publicación**: Botón para acceder al formulario de creación de publicaciones
- **Editar Publicaciones**: Opción para editar publicaciones existentes
- **Eliminar Publicaciones**: Funcionalidad para eliminar publicaciones
- **Estadísticas**: Visualización de likes y estadísticas de cada publicación

### 3.3. Crear/Editar Publicación
- **Formulario de Publicación**: Formulario completo para crear nuevas publicaciones con título, descripción e imagen
- **Carga de Imágenes**: Funcionalidad para cargar imágenes en formato base64
- **Estados de Publicación**: Gestión de estados (borrador, publicado, archivado)
- **Edición de Publicaciones Existentes**: Permite modificar publicaciones ya creadas
- **Validación de Campos**: Validación de campos requeridos antes de publicar

---

## 4. Sistema de Mensajería

### 4.1. Página de Mensajes
- **Lista de Conversaciones**: Visualización de todos los mensajes recibidos y enviados
- **Búsqueda de Mensajes**: Funcionalidad para buscar mensajes específicos
- **Filtrado por Remitente**: Opción para filtrar mensajes por remitente
- **Visualización de Mensajes**: Muestra el contenido, remitente, destinatario y timestamp de cada mensaje
- **Fotos de Perfil**: Muestra las fotos de perfil de los remitentes en los mensajes
- **Mensajes No Leídos**: Indicador visual para mensajes no leídos
- **Marcar como Leído**: Funcionalidad para marcar mensajes individuales como leídos
- **Marcar Todos como Leídos**: Opción para marcar todos los mensajes como leídos de una vez

### 4.2. Envío de Mensajes
- **Enviar Mensaje a Organizaciones**: Los voluntarios pueden enviar mensajes a organizaciones
- **Enviar Mensaje a Voluntarios**: Las organizaciones pueden enviar mensajes a voluntarios
- **Selección Múltiple de Destinatarios**: Permite seleccionar múltiples destinatarios para enviar el mismo mensaje
- **Seleccionar Todos**: Opción para seleccionar todos los destinatarios disponibles
- **Formulario de Mensaje**: Campos para asunto, contenido y URL opcional
- **Creación Automática de Notificaciones**: Al enviar un mensaje, se crea automáticamente una notificación para el destinatario
- **Manejo de IDs**: Gestión correcta de userIds para organizaciones y voluntarios

### 4.3. Respuestas a Mensajes
- **Responder Mensajes**: Funcionalidad para responder directamente a un mensaje recibido
- **Hilo de Conversación**: Visualización del contexto de la conversación
- **Formulario de Respuesta**: Campo de texto para escribir la respuesta

---

## 5. Sistema de Notificaciones

### 5.1. Página de Notificaciones
- **Lista de Notificaciones**: Visualización de todas las notificaciones del usuario
- **Notificaciones No Leídas**: Indicador visual para notificaciones no leídas
- **Filtrado por Tipo**: Diferentes tipos de notificaciones (nuevo mensaje, nueva actividad, actividad confirmada, actividad cancelada, general)
- **Marcar como Leída**: Funcionalidad para marcar notificaciones individuales como leídas
- **Marcar Todas como Leídas**: Opción para marcar todas las notificaciones como leídas
- **Navegación desde Notificaciones**: Enlaces para navegar a la acción relacionada (mensajes, publicaciones, etc.)
- **Notificaciones para Organizaciones**: Gestión especial de notificaciones para organizaciones usando userId correcto
- **Ordenamiento por Fecha**: Notificaciones ordenadas por fecha (más recientes primero)

---

## 6. Soporte y FAQ

### 6.1. Página de Soporte
- **Preguntas Frecuentes (FAQ)**: Visualización de preguntas frecuentes y sus respuestas
- **Búsqueda en FAQ**: Funcionalidad para buscar preguntas específicas
- **Categorización**: Organización de FAQs por categorías
- **Información de Contacto**: Información de contacto para soporte adicional

---

## 7. Navegación y Menú Lateral

### 7.1. Menú Lateral (Sidebar)
- **Menú de Navegación**: Menú lateral con todas las opciones principales de la aplicación
- **Selector de Idioma**: Cambio de idioma entre español e inglés ubicado en la parte superior del menú
- **Opciones por Rol**: Menú adaptado según el tipo de usuario (voluntario u organización)
- **Navegación Rápida**: Enlaces directos a todas las secciones principales
- **Indicador de Usuario**: Muestra información del usuario autenticado
- **Cerrar Sesión**: Opción para cerrar sesión de forma segura

### 7.2. Opciones del Menú
- **Comunidad**: Acceso a la página de comunidad (para voluntarios)
- **Dashboard**: Acceso al panel de control (para organizaciones)
- **Mensajes**: Acceso al sistema de mensajería
- **Notificaciones**: Acceso a las notificaciones
- **Perfil**: Acceso a la página de perfil
- **Soporte**: Acceso a la página de soporte y FAQ

---

## 8. Internacionalización (i18n)

### 8.1. Selector de Idioma
- **Cambio de Idioma**: Selector visual para cambiar entre español e inglés
- **Persistencia de Idioma**: El idioma seleccionado se guarda en localStorage
- **Traducción Completa**: Todas las páginas y componentes están traducidos
- **Integración con ngx-translate**: Uso de la librería ngx-translate para gestión de traducciones

---

## 9. Integración con Backend

### 9.1. Servicios de API
- **Servicio Centralizado de API**: Servicio único para todas las comunicaciones con el backend
- **Gestión de Tokens JWT**: Inclusión automática de tokens JWT en las peticiones
- **Manejo de Errores**: Gestión centralizada de errores HTTP
- **Base URL Configurable**: Configuración centralizada de la URL del backend

### 9.2. Servicios Específicos
- **AuthService**: Gestión de autenticación y sesión de usuario
- **VolunteerService**: Gestión de datos de voluntarios
- **OrganizationService**: Gestión de datos de organizaciones
- **PublicationService**: Gestión de publicaciones
- **MessageService**: Gestión de mensajes
- **NotificationService**: Gestión de notificaciones
- **ProfileService**: Gestión de perfiles de usuario

---

## 10. Experiencia de Usuario (UX)

### 10.1. Componentes Reutilizables
- **Componente de Carga**: Indicador de carga durante operaciones asíncronas
- **Componente de Error**: Mensajes de error amigables para el usuario
- **Lista de Mensajes**: Componente reutilizable para mostrar listas de mensajes
- **Modales**: Modales para acciones como enviar mensajes

### 10.2. Validaciones y Feedback
- **Validación en Tiempo Real**: Validación de formularios mientras el usuario escribe
- **Mensajes de Error Claros**: Mensajes de error descriptivos y útiles
- **Confirmaciones**: Diálogos de confirmación para acciones importantes (eliminar, etc.)
- **Feedback Visual**: Indicadores visuales de éxito o error en las operaciones

### 10.3. Diseño Responsivo
- **Adaptación a Diferentes Pantallas**: Diseño que se adapta a diferentes tamaños de pantalla
- **Material Design**: Uso de Angular Material para componentes consistentes
- **Navegación Intuitiva**: Navegación clara y fácil de usar

---

## 11. Seguridad

### 11.1. Autenticación y Autorización
- **Protección de Rutas**: Rutas protegidas que requieren autenticación
- **Gestión de Sesión**: Manejo seguro de sesiones de usuario
- **Tokens JWT**: Uso de tokens JWT para autenticación segura
- **Redirección por Rol**: Redirección automática según el rol del usuario

### 11.2. Validación de Datos
- **Validación en Frontend**: Validación de datos antes de enviarlos al backend
- **Sanitización**: Prevención de inyección de código malicioso
- **Manejo Seguro de Imágenes**: Validación de formatos y tamaños de imágenes

---

## 12. Funcionalidades Adicionales

### 12.1. Gestión de Imágenes
- **Carga de Avatares**: Funcionalidad para cargar y actualizar avatares de usuarios
- **Carga de Logos**: Funcionalidad para cargar logos de organizaciones
- **Carga de Imágenes de Publicaciones**: Funcionalidad para agregar imágenes a publicaciones
- **Previsualización**: Previsualización de imágenes antes de guardar
- **Soporte Base64**: Conversión y almacenamiento de imágenes en formato base64

### 12.2. Búsqueda y Filtrado
- **Búsqueda de Mensajes**: Búsqueda de mensajes por contenido o remitente
- **Filtrado de Publicaciones**: Filtrado de publicaciones por organización
- **Búsqueda en FAQ**: Búsqueda de preguntas frecuentes

### 12.3. Gestión de Estado
- **Estado de Usuario**: Gestión del estado del usuario autenticado
- **Estado de Mensajes**: Seguimiento de mensajes leídos/no leídos
- **Estado de Notificaciones**: Seguimiento de notificaciones leídas/no leídas
- **Estado de Publicaciones**: Gestión de estados de publicaciones (borrador, publicado, archivado)

---

## Resumen de Funcionalidades Principales

1. ✅ **Autenticación completa** con login y registro diferenciado por tipo de usuario
2. ✅ **Gestión de perfiles** para voluntarios y organizaciones con edición completa
3. ✅ **Sistema de publicaciones** con creación, edición, eliminación y sistema de likes
4. ✅ **Sistema de mensajería** bidireccional entre voluntarios y organizaciones
5. ✅ **Sistema de notificaciones** con diferentes tipos y gestión de estado
6. ✅ **Página de comunidad** para visualización de publicaciones
7. ✅ **Dashboard** para organizaciones con gestión de publicaciones
8. ✅ **Soporte y FAQ** con preguntas frecuentes
9. ✅ **Internacionalización** con soporte para español e inglés
10. ✅ **Navegación intuitiva** con menú lateral adaptativo
11. ✅ **Integración completa con backend** mediante servicios REST
12. ✅ **Gestión de imágenes** con carga y previsualización
13. ✅ **Validaciones y feedback** para mejor experiencia de usuario
14. ✅ **Diseño responsivo** con Angular Material

---

**Total de Páginas/Componentes Principales:** 12  
**Total de Servicios:** 7  
**Total de Funcionalidades Documentadas:** 50+

