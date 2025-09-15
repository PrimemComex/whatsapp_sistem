// server/config/database.js
const knex = require('knex');
const path = require('path');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../../database.sqlite')
  },
  useNullAsDefault: true
});

// Criar tabelas se não existirem
const initDatabase = async () => {
  try {
    // Tabela de usuários
    await db.schema.hasTable('users').then(exists => {
      if (!exists) {
        return db.schema.createTable('users', table => {
          table.increments('id');
          table.string('email').unique();
          table.string('password');
          table.string('name');
          table.string('role');
          table.string('whatsapp_id');
          table.timestamps(true, true);
        });
      }
    });

    // Tabela de conversas
    await db.schema.hasTable('conversations').then(exists => {
      if (!exists) {
        return db.schema.createTable('conversations', table => {
          table.string('id').primary(); // WhatsApp chat ID
          table.string('name');
          table.string('phone');
          table.string('avatar');
          table.boolean('is_group').defaultTo(false);
          table.boolean('is_archived').defaultTo(false);
          table.boolean('is_pinned').defaultTo(false);
          table.boolean('is_favorite').defaultTo(false);
          table.integer('unread_count').defaultTo(0);
          table.text('last_message');
          table.bigInteger('last_message_time');
          table.timestamps(true, true);
        });
      }
    });

    // Tabela de mensagens
    await db.schema.hasTable('messages').then(exists => {
      if (!exists) {
        return db.schema.createTable('messages', table => {
          table.string('id').primary(); // WhatsApp message ID
          table.string('conversation_id');
          table.string('from_number');
          table.string('from_name');
          table.text('body');
          table.boolean('from_me');
          table.boolean('has_media');
          table.string('media_url');
          table.string('media_type');
          table.string('media_filename');
          table.integer('media_size');
          table.string('status'); // sent, delivered, read
          table.bigInteger('timestamp');
          table.string('quoted_msg_id');
          table.timestamps(true, true);
          
          table.foreign('conversation_id').references('conversations.id');
          table.index(['conversation_id', 'timestamp']);
        });
      }
    });

    // Tabela de configurações
    await db.schema.hasTable('settings').then(exists => {
      if (!exists) {
        return db.schema.createTable('settings', table => {
          table.increments('id');
          table.integer('user_id');
          table.string('key');
          table.text('value');
          table.timestamps(true, true);
          
          table.unique(['user_id', 'key']);
        });
      }
    });

    console.log('✅ Banco de dados inicializado');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
  }
};

module.exports = { db, initDatabase };