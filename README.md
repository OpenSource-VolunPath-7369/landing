# 🚀 Volunpath - Plataforma de Voluntariado

Una aplicación web moderna desarrollada en Angular 19 que conecta organizaciones con voluntarios para actividades sociales y ambientales.

## ✨ Características Principales

- **Comunidad**: Explora actividades de voluntariado disponibles
- **Dashboard**: Gestiona publicaciones y actividades
- **Mensajería**: Comunicación entre organizaciones y voluntarios
- **Notificaciones**: Mantente al día con las últimas novedades
- **Perfil**: Gestiona tu información personal
- **Soporte**: Centro de ayuda y FAQ

## 🛠️ Stack Tecnológico

### Frontend
- **Angular 19.2.0** - Framework principal
- **Angular Material 19.2.19** - Componentes UI
- **TailwindCSS 4.1.14** - Framework de estilos
- **RxJS 7.8.0** - Programación reactiva
- **TypeScript 5.7.2** - Lenguaje de programación

### Backend
- **JSON Server** - API REST simulada
- **Concurrently** - Ejecución simultánea de servidores

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd Volunpath-copia
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```
   Este comando iniciará tanto el servidor JSON (puerto 3000) como la aplicación Angular (puerto 4200).

4. **Acceder a la aplicación**
   - Frontend: http://localhost:4200
   - API: http://localhost:3000/api/v1

## 📋 Scripts Disponibles

```bash
# Desarrollo (servidor JSON + Angular)
npm run dev

# Solo servidor JSON
npm run dev:server

# Solo aplicación Angular
npm start

# Construcción para producción
npm run build

# Ejecutar pruebas
npm test
```

## 🗄️ Estructura de Datos

La aplicación utiliza JSON Server con las siguientes entidades:

### Usuarios (`/users`)
- Información personal y perfil
- Roles: volunteer, organization_admin, admin
- Habilidades y ubicación

### Organizaciones (`/organizations`)
- Datos de organizaciones sin fines de lucro
- Información de contacto y redes sociales
- Verificación y calificaciones

### Actividades (`/activities`)
- Actividades de voluntariado disponibles
- Detalles de fecha, ubicación y requisitos
- Sistema de likes y registro de voluntarios

### Publicaciones (`/publications`)
- Contenido publicado por organizaciones
- Gestión de estado (borrador, publicado, archivado)

### Mensajes (`/messages`)
- Sistema de mensajería entre usuarios
- Estados de lectura y tipos de mensaje

### Notificaciones (`/notifications`)
- Centro de notificaciones del usuario
- Diferentes tipos de notificaciones

### Registros de Voluntarios (`/volunteerRegistrations`)
- Registro de usuarios en actividades
- Estados: pendiente, confirmado, cancelado

### FAQ (`/faqs`)
- Preguntas frecuentes categorizadas

## 🔧 API Endpoints

### Actividades
- `GET /api/v1/activities` - Listar todas las actividades
- `GET /api/v1/activities/:id` - Obtener actividad específica
- `POST /api/v1/activities` - Crear nueva actividad
- `PUT /api/v1/activities/:id` - Actualizar actividad
- `DELETE /api/v1/activities/:id` - Eliminar actividad
- `PATCH /api/v1/activities/:id` - Actualizar parcialmente (ej: likes)

### Organizaciones
- `GET /api/v1/organizations` - Listar organizaciones
- `GET /api/v1/organizations/:id` - Obtener organización específica

### Usuarios
- `GET /api/v1/users` - Listar usuarios
- `GET /api/v1/users/:id` - Obtener usuario específico
- `PUT /api/v1/users/:id` - Actualizar usuario

### Publicaciones
- `GET /api/v1/publications` - Listar publicaciones
- `POST /api/v1/publications` - Crear publicación
- `PUT /api/v1/publications/:id` - Actualizar publicación
- `DELETE /api/v1/publications/:id` - Eliminar publicación

### Mensajes
- `GET /api/v1/messages` - Listar mensajes
- `GET /api/v1/messages?recipientId=:id` - Mensajes por usuario
- `POST /api/v1/messages` - Enviar mensaje
- `PATCH /api/v1/messages/:id` - Marcar como leído
- `DELETE /api/v1/messages/:id` - Eliminar mensaje

### Notificaciones
- `GET /api/v1/notifications` - Listar notificaciones
- `GET /api/v1/notifications?userId=:id` - Notificaciones por usuario
- `POST /api/v1/notifications` - Crear notificación
- `PATCH /api/v1/notifications/:id` - Marcar como leída

### Registros de Voluntarios
- `GET /api/v1/volunteerRegistrations` - Listar registros
- `POST /api/v1/volunteerRegistrations` - Registrar en actividad
- `PATCH /api/v1/volunteerRegistrations/:id` - Actualizar estado
- `DELETE /api/v1/volunteerRegistrations/:id` - Cancelar registro

## 🎨 Personalización

### Colores del Tema
Los colores principales se pueden modificar en `src/styles.css`:

```css
.mat-primary {
  --mdc-theme-primary: #659bb8; /* Azul principal */
}

.mat-accent {
  --mdc-theme-secondary: #4a7c95; /* Azul secundario */
}
```

### Datos de Prueba
Los datos de prueba se encuentran en `server/db.json`. Puedes modificar este archivo para agregar más contenido de prueba.

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
# Los archivos se generarán en dist/volunpath/
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección FAQ en la aplicación
2. Consulta los issues existentes en GitHub
3. Crea un nuevo issue con detalles del problema

## 🔮 Próximas Características

- [ ] Autenticación de usuarios
- [ ] Geolocalización de actividades
- [ ] Sistema de calificaciones
- [ ] Chat en tiempo real
- [ ] Aplicación móvil
- [ ] Sistema de pagos para donaciones
- [ ] Analytics avanzados

---

**¡Gracias por usar Volunpath! 🌟**