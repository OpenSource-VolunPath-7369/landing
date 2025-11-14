# 🚀 Script de Prueba - Volunpath
# Este script verifica que todos los componentes funcionen correctamente

Write-Host "🔍 Verificando Volunpath..." -ForegroundColor Green

# Verificar que estamos en el directorio correcto
if (Test-Path "package.json") {
    Write-Host "✅ package.json encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ package.json no encontrado" -ForegroundColor Red
    Write-Host "Asegúrate de estar en el directorio raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Verificar que las dependencias estén instaladas
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ node_modules no encontrado" -ForegroundColor Red
    Write-Host "Ejecuta: npm install" -ForegroundColor Yellow
    exit 1
}

# Verificar que el archivo db.json existe
if (Test-Path "server/db.json") {
    Write-Host "✅ Base de datos encontrada" -ForegroundColor Green
} else {
    Write-Host "❌ server/db.json no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar que json-server está instalado
try {
    $jsonServerVersion = npm list json-server --depth=0 2>$null
    if ($jsonServerVersion -match "json-server") {
        Write-Host "✅ json-server instalado" -ForegroundColor Green
    } else {
        Write-Host "❌ json-server no instalado" -ForegroundColor Red
        Write-Host "Ejecuta: npm install --save-dev json-server" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Error verificando json-server" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 ¡Todo está listo!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Para ejecutar la aplicación:" -ForegroundColor Cyan
Write-Host "1. Terminal 1: npm run dev:server" -ForegroundColor White
Write-Host "2. Terminal 2: npm start" -ForegroundColor White
Write-Host ""
Write-Host "🌐 URLs de acceso:" -ForegroundColor Cyan
Write-Host "- Aplicación: http://localhost:4200" -ForegroundColor White
Write-Host "- API: http://localhost:3000/api/v1" -ForegroundColor White
Write-Host ""
Write-Host "📊 Endpoints disponibles:" -ForegroundColor Cyan
Write-Host "- Actividades: http://localhost:3000/api/v1/activities" -ForegroundColor White
Write-Host "- Organizaciones: http://localhost:3000/api/v1/organizations" -ForegroundColor White
Write-Host "- Mensajes: http://localhost:3000/api/v1/messages" -ForegroundColor White
Write-Host "- Publicaciones: http://localhost:3000/api/v1/publications" -ForegroundColor White




