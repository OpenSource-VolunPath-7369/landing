#!/bin/bash

echo "🚀 Iniciando Volunpath - Servidor de Desarrollo"
echo "=============================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    echo "Asegúrate de estar en el directorio raíz del proyecto"
    exit 1
fi

echo "✅ Directorio correcto encontrado"

# Verificar que las dependencias estén instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
else
    echo "✅ Dependencias ya instaladas"
fi

# Verificar que el archivo db.json existe
if [ ! -f "server/db.json" ]; then
    echo "❌ Error: No se encontró server/db.json"
    exit 1
fi

echo "✅ Base de datos encontrada"

# Iniciar el servidor JSON
echo "🔄 Iniciando servidor JSON en puerto 3000..."
json-server --watch server/db.json --routes server/routes.json --port 3000 --delay 1000 &

# Esperar un momento para que el servidor se inicie
sleep 3

# Verificar que el servidor esté funcionando
echo "🔍 Verificando servidor JSON..."
if curl -s http://localhost:3000/api/v1/activities > /dev/null; then
    echo "✅ Servidor JSON funcionando correctamente"
    echo "📡 API disponible en: http://localhost:3000/api/v1"
else
    echo "❌ Error: No se pudo conectar al servidor JSON"
    exit 1
fi

echo ""
echo "🎉 ¡Servidor JSON iniciado exitosamente!"
echo "📊 Endpoints disponibles:"
echo "   - Actividades: http://localhost:3000/api/v1/activities"
echo "   - Organizaciones: http://localhost:3000/api/v1/organizations"
echo "   - Usuarios: http://localhost:3000/api/v1/users"
echo "   - Mensajes: http://localhost:3000/api/v1/messages"
echo "   - Publicaciones: http://localhost:3000/api/v1/publications"
echo ""
echo "💡 Para iniciar la aplicación Angular, ejecuta en otra terminal:"
echo "   npm start"
echo ""
echo "🌐 La aplicación estará disponible en: http://localhost:4200"






