# 🚀 Script de Prueba - Nueva Publicación

Write-Host "🔍 Verificando funcionalidad de Nueva Publicación..." -ForegroundColor Green

# Verificar que estamos en el directorio correcto
if (Test-Path "package.json") {
    Write-Host "✅ package.json encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ package.json no encontrado" -ForegroundColor Red
    Write-Host "Asegúrate de estar en el directorio raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Verificar que el archivo db.json existe
if (Test-Path "server/db.json") {
    Write-Host "✅ Base de datos encontrada" -ForegroundColor Green
} else {
    Write-Host "❌ server/db.json no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar que las organizaciones existen en la base de datos
$dbContent = Get-Content "server/db.json" -Raw | ConvertFrom-Json
if ($dbContent.organizations -and $dbContent.organizations.Count -gt 0) {
    Write-Host "✅ Organizaciones encontradas en la base de datos" -ForegroundColor Green
    Write-Host "   Organizaciones disponibles:" -ForegroundColor Cyan
    foreach ($org in $dbContent.organizations) {
        Write-Host "   - $($org.name)" -ForegroundColor White
    }
} else {
    Write-Host "❌ No se encontraron organizaciones en la base de datos" -ForegroundColor Red
    exit 1
}

# Verificar que las publicaciones existen en la base de datos
if ($dbContent.publications -and $dbContent.publications.Count -gt 0) {
    Write-Host "✅ Publicaciones existentes encontradas" -ForegroundColor Green
    Write-Host "   Publicaciones actuales: $($dbContent.publications.Count)" -ForegroundColor White
} else {
    Write-Host "⚠️  No hay publicaciones existentes (esto es normal para empezar)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 ¡Todo está listo para crear publicaciones!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Para probar la funcionalidad:" -ForegroundColor Cyan
Write-Host "1. Ejecuta: npm run dev" -ForegroundColor White
Write-Host "2. Abre: http://localhost:4200" -ForegroundColor White
Write-Host "3. Ve a: Nueva Publicación" -ForegroundColor White
Write-Host "4. Completa el formulario:" -ForegroundColor White
Write-Host "   - Título: 'Mi Primera Actividad'" -ForegroundColor White
Write-Host "   - Descripción: 'Esta es una actividad de prueba para verificar que todo funciona correctamente'" -ForegroundColor White
Write-Host "   - Organización: Selecciona una de las disponibles" -ForegroundColor White
Write-Host "   - Tags: 'prueba, voluntariado, comunidad'" -ForegroundColor White
Write-Host "5. Haz clic en 'Crear Publicación'" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Si hay problemas:" -ForegroundColor Cyan
Write-Host "- Revisa la consola del navegador (F12)" -ForegroundColor White
Write-Host "- Verifica que el servidor JSON esté ejecutándose en puerto 3000" -ForegroundColor White
Write-Host "- Verifica que Angular esté ejecutándose en puerto 4200" -ForegroundColor White





