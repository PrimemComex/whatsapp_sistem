// =====================================
// SALVE ESTE ARQUIVO COMO: check-uploads.js
// NA RAIZ DO SEU PROJETO (onde está o package.json)
// =====================================

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando estrutura do projeto...\n');

// Verificar pasta uploads
const uploadsPath = path.join(__dirname, 'uploads');

if (fs.existsSync(uploadsPath)) {
    console.log('✅ Pasta uploads existe!');
    
    // Listar arquivos
    const files = fs.readdirSync(uploadsPath);
    console.log(`📁 Total de arquivos: ${files.length}`);
    
    // Mostrar alguns arquivos
    if (files.length > 0) {
        console.log('\n📎 Alguns arquivos encontrados:');
        files.slice(0, 5).forEach(file => {
            const stats = fs.statSync(path.join(uploadsPath, file));
            const size = (stats.size / 1024).toFixed(2);
            console.log(`  - ${file} (${size} KB)`);
        });
    }
} else {
    console.log('❌ Pasta uploads não existe. Criando...');
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('✅ Pasta uploads criada!');
}

// Verificar outras pastas importantes
const folders = ['sessions', 'temp', 'media', 'server', 'client'];

console.log('\n📂 Verificando outras pastas:');
folders.forEach(folder => {
    const folderPath = path.join(__dirname, folder);
    if (fs.existsSync(folderPath)) {
        console.log(`  ✅ ${folder}/`);
    } else {
        console.log(`  ❌ ${folder}/ (não existe)`);
    }
});

// Mostrar caminho completo
console.log('\n📍 Caminho do projeto:', __dirname);
console.log('📍 Caminho uploads:', uploadsPath);

console.log('\n✨ Verificação concluída!');