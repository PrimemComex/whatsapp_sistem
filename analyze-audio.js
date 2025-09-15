// ============================================
// ANALISADOR DE HEADERS DE ÁUDIO PARA VOICE NOTES
// ============================================
// Salve como: analyze-audio.js
// Execute: node analyze-audio.js

const fs = require('fs');
const path = require('path');

// Função para analisar headers de arquivo OGG/OPUS
function analyzeOggHeaders(filePath) {
    try {
        const buffer = fs.readFileSync(filePath);
        const analysis = {
            fileName: path.basename(filePath),
            fileSize: buffer.length,
            fileSizeFormatted: `${(buffer.length / 1024).toFixed(2)} KB`,
            
            // Headers OGG
            headers: {
                oggSignature: null,
                vorbisHeader: null,
                opusHeader: null,
                streamStructure: null
            },
            
            // Metadados
            metadata: {
                codec: null,
                channels: null,
                sampleRate: null,
                bitrate: null,
                duration: null
            },
            
            // Estrutura específica para WhatsApp
            whatsappSignatures: {
                hasOpusHeader: false,
                hasOggPageHeader: false,
                hasWhatsAppSignature: false,
                streamSerialNumber: null
            },
            
            // Hex dump dos primeiros bytes
            hexDump: {
                first32Bytes: buffer.slice(0, 32).toString('hex').match(/.{2}/g).join(' '),
                first64Bytes: buffer.slice(0, 64).toString('hex').match(/.{2}/g).join(' '),
                first128Bytes: buffer.slice(0, 128).toString('hex').match(/.{2}/g).join(' ')
            },
            
            // Análise de padrões
            patterns: {
                startsWithOggS: buffer.slice(0, 4).toString() === 'OggS',
                hasOpusHead: buffer.includes(Buffer.from('OpusHead')),
                hasOpusTags: buffer.includes(Buffer.from('OpusTags')),
                hasVorbis: buffer.includes(Buffer.from('vorbis')),
                hasEncoder: findEncoderInfo(buffer)
            }
        };
        
        // Análise detalhada dos headers OGG
        if (analysis.patterns.startsWithOggS) {
            analysis.headers.oggSignature = 'VÁLIDO - OggS encontrado';
            
            // Analisar header OGG (primeiros 27 bytes após OggS)
            const oggHeader = buffer.slice(0, 27);
            analysis.headers.streamStructure = {
                capturePattern: oggHeader.slice(0, 4).toString(), // "OggS"
                streamStructureVersion: oggHeader[4],
                headerTypeFlag: oggHeader[5],
                granulePosition: oggHeader.slice(6, 14).toString('hex'),
                bitstreamSerialNumber: oggHeader.slice(14, 18).readUInt32LE(0),
                pageSequenceNumber: oggHeader.slice(18, 22).readUInt32LE(0),
                checksumCRC32: oggHeader.slice(22, 26).toString('hex'),
                pageSegments: oggHeader[26]
            };
            
            analysis.whatsappSignatures.streamSerialNumber = analysis.headers.streamStructure.bitstreamSerialNumber;
            analysis.whatsappSignatures.hasOggPageHeader = true;
        } else {
            analysis.headers.oggSignature = 'INVÁLIDO - OggS não encontrado';
        }
        
        // Análise do header Opus
        if (analysis.patterns.hasOpusHead) {
            analysis.whatsappSignatures.hasOpusHeader = true;
            
            // Procurar posição do OpusHead
            const opusHeadPos = buffer.indexOf(Buffer.from('OpusHead'));
            if (opusHeadPos !== -1) {
                const opusHeader = buffer.slice(opusHeadPos, opusHeadPos + 19);
                analysis.headers.opusHeader = {
                    signature: opusHeader.slice(0, 8).toString(), // "OpusHead"
                    version: opusHeader[8],
                    channels: opusHeader[9],
                    preSkip: opusHeader.slice(10, 12).readUInt16LE(0),
                    inputSampleRate: opusHeader.slice(12, 16).readUInt32LE(0),
                    outputGain: opusHeader.slice(16, 18).readInt16LE(0),
                    channelMappingFamily: opusHeader[18]
                };
                
                analysis.metadata.channels = analysis.headers.opusHeader.channels;
                analysis.metadata.sampleRate = analysis.headers.opusHeader.inputSampleRate;
                analysis.metadata.codec = 'Opus';
            }
        }
        
        return analysis;
        
    } catch (error) {
        return {
            fileName: path.basename(filePath),
            error: error.message,
            analysis: 'FALHOU'
        };
    }
}

// Função para encontrar informações do encoder
function findEncoderInfo(buffer) {
    const encoderPatterns = [
        'Lavf',        // FFmpeg
        'libopus',     // libopus
        'WhatsApp',    // WhatsApp específico
        'Opus',        // Opus genérico
        'encoder',     // palavra encoder
        'ENCODER'      // palavra ENCODER maiúscula
    ];
    
    const found = [];
    
    encoderPatterns.forEach(pattern => {
        if (buffer.includes(Buffer.from(pattern))) {
            // Encontrar contexto ao redor do padrão
            const index = buffer.indexOf(Buffer.from(pattern));
            const context = buffer.slice(Math.max(0, index - 10), index + pattern.length + 20).toString('utf8', 0, 50);
            found.push({
                pattern: pattern,
                position: index,
                context: context.replace(/[\x00-\x1F\x7F-\x9F]/g, '.')
            });
        }
    });
    
    return found;
}

// Função para comparar dois arquivos
function compareAudioFiles(file1Path, file2Path) {
    console.log('🔍 COMPARAÇÃO DE ARQUIVOS DE ÁUDIO');
    console.log('=====================================');
    
    const analysis1 = analyzeOggHeaders(file1Path);
    const analysis2 = analyzeOggHeaders(file2Path);
    
    console.log('\n📊 ARQUIVO 1 (WhatsApp Original):');
    console.log('----------------------------------');
    console.log(JSON.stringify(analysis1, null, 2));
    
    console.log('\n📊 ARQUIVO 2 (Sistema Gerado):');
    console.log('-------------------------------');
    console.log(JSON.stringify(analysis2, null, 2));
    
    // Análise de diferenças críticas
    console.log('\n⚖️ DIFERENÇAS CRÍTICAS:');
    console.log('========================');
    
    const differences = [];
    
    if (analysis1.headers?.streamStructure?.bitstreamSerialNumber !== analysis2.headers?.streamStructure?.bitstreamSerialNumber) {
        differences.push('🔴 Serial Numbers diferentes');
    }
    
    if (analysis1.patterns?.hasOpusHead !== analysis2.patterns?.hasOpusHead) {
        differences.push('🔴 OpusHead: ' + analysis1.patterns?.hasOpusHead + ' vs ' + analysis2.patterns?.hasOpusHead);
    }
    
    if (analysis1.metadata?.channels !== analysis2.metadata?.channels) {
        differences.push('🔴 Canais: ' + analysis1.metadata?.channels + ' vs ' + analysis2.metadata?.channels);
    }
    
    if (analysis1.metadata?.sampleRate !== analysis2.metadata?.sampleRate) {
        differences.push('🔴 Sample Rate: ' + analysis1.metadata?.sampleRate + ' vs ' + analysis2.metadata?.sampleRate);
    }
    
    // Comparar headers hex
    if (analysis1.hexDump?.first32Bytes !== analysis2.hexDump?.first32Bytes) {
        differences.push('🔴 Headers dos primeiros 32 bytes são diferentes');
        console.log('📋 Arquivo 1 (primeiros 32 bytes): ' + analysis1.hexDump?.first32Bytes);
        console.log('📋 Arquivo 2 (primeiros 32 bytes): ' + analysis2.hexDump?.first32Bytes);
    }
    
    // Comparar padrões de encoder
    const encoders1 = analysis1.patterns?.hasEncoder || [];
    const encoders2 = analysis2.patterns?.hasEncoder || [];
    
    if (JSON.stringify(encoders1) !== JSON.stringify(encoders2)) {
        differences.push('🔴 Informações de encoder diferentes');
        console.log('📋 Encoders arquivo 1:', encoders1);
        console.log('📋 Encoders arquivo 2:', encoders2);
    }
    
    if (differences.length === 0) {
        console.log('✅ Arquivos parecem idênticos estruturalmente');
    } else {
        console.log('❌ Encontradas ' + differences.length + ' diferenças:');
        differences.forEach(diff => console.log('  ' + diff));
    }
    
    return { analysis1, analysis2, differences };
}

// Função principal
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('🎯 ANALISADOR DE HEADERS DE ÁUDIO PARA VOICE NOTES');
        console.log('==================================================');
        console.log('');
        console.log('USO:');
        console.log('  node analyze-audio.js arquivo1.ogg                    # Analisar um arquivo');
        console.log('  node analyze-audio.js arquivo1.ogg arquivo2.ogg       # Comparar dois arquivos');
        console.log('');
        console.log('EXEMPLO:');
        console.log('  node analyze-audio.js ./uploads/whatsapp_original.ogg');
        console.log('  node analyze-audio.js ./uploads/whatsapp_original.ogg ./uploads/sistema_gerado.ogg');
        console.log('');
        console.log('📋 O script irá analisar:');
        console.log('  • Headers OGG/Opus');
        console.log('  • Metadados de codec');
        console.log('  • Estrutura de stream');
        console.log('  • Assinaturas específicas do WhatsApp');
        console.log('  • Hex dump dos primeiros bytes');
        return;
    }
    
    if (args.length === 1) {
        // Analisar um arquivo
        const filePath = args[0];
        
        if (!fs.existsSync(filePath)) {
            console.log('❌ Arquivo não encontrado: ' + filePath);
            return;
        }
        
        console.log('🔍 ANÁLISE DE ARQUIVO ÚNICO');
        console.log('============================');
        
        const analysis = analyzeOggHeaders(filePath);
        console.log(JSON.stringify(analysis, null, 2));
        
    } else if (args.length === 2) {
        // Comparar dois arquivos
        const file1 = args[0];
        const file2 = args[1];
        
        if (!fs.existsSync(file1)) {
            console.log('❌ Arquivo 1 não encontrado: ' + file1);
            return;
        }
        
        if (!fs.existsSync(file2)) {
            console.log('❌ Arquivo 2 não encontrado: ' + file2);
            return;
        }
        
        compareAudioFiles(file1, file2);
    }
}

// Executar
if (require.main === module) {
    main();
}

module.exports = { analyzeOggHeaders, compareAudioFiles };