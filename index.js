const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  InteractionType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Partials,
  PermissionsBitField
} = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Message, Partials.Channel],
});

const MESSAGE_FILE = 'message_id.json';
const CHANNEL_ID = '1385664143075311637';

client.once('ready', async () => {
  console.log(`✅ Eingeloggt als ${client.user.tag}`);

  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel?.isTextBased()) return console.error('❌ Channel nicht gefunden oder kein Text-Channel.');

  let existingMessageId = null;

  if (fs.existsSync(MESSAGE_FILE)) {
    try {
      const saved = JSON.parse(fs.readFileSync(MESSAGE_FILE, 'utf8'));
      existingMessageId = saved.id;

      const existingMsg = await channel.messages.fetch(existingMessageId);
      if (existingMsg) {
        console.log('✅ Nachricht bereits vorhanden.');
        return;
      }
    } catch {
      console.log('⚠️ Alte Nachricht existiert nicht mehr oder konnte nicht geladen werden.');
    }
  }

  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle('Allgemeiner Support')
    .setDescription(
      'Erstelle ein Ticket für dein Anliegen, um gezielten Support in verschiedenen Bereichen zu erhalten.'
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('teambewerbung').setLabel('Teambewerbung').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('clanbewerbung').setLabel('Clanbewerbung').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('kartenauftraege').setLabel('Kartenaufträge').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('support').setLabel('Support').setStyle(ButtonStyle.Primary)
  );

  const message = await channel.send({ embeds: [embed], components: [row] });

  fs.writeFileSync(MESSAGE_FILE, JSON.stringify({ id: message.id }), 'utf8');
  console.log('📨 Nachricht gesendet und gespeichert.');
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    const { guild, member, customId } = interaction;

    if (customId === 'support') {
      const supportRoleId = '1385668674542633020';
      const categoryId = config.TICKET_CATEGORY_ID;

      const channelName = `support-${member.user.username}`.toLowerCase().replace(/[^a-z0-9]/g, '-');

      // Prüfen, ob Ticket bereits existiert
      const existing = guild.channels.cache.find(c =>
        c.name === channelName && c.parentId === categoryId
      );

      if (existing) {
        await interaction.reply({ content: '❗ Du hast bereits ein offenes Support-Ticket.', ephemeral: true });
        return;
      }

      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: categoryId,
        permissionOverwrites: [
          {
            id: guild.roles.everyone, // Niemand sonst
            deny: ['ViewChannel'],
          },
          {
            id: member.id, // Der Ticket-Ersteller
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
          },
          {
            id: supportRoleId, // Die Support-Rolle
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
          },
        ],
      });

      await interaction.reply({ content: `✅ Dein Support-Ticket wurde erstellt: ${channel}`, ephemeral: true });

      await channel.send(`👋 Hallo ${member.user.username}, bitte beschreibe hier dein Anliegen. Ein Teammitglied wird dir bald helfen.`);
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    const { guild, member, customId } = interaction;

    if (customId === 'kartenauftraege') {
      const supportRoleId = '1385668674542633020';
      const categoryId = config.TICKET_CATEGORY_ID;

      const channelName = `kartenauftrag-${member.user.username}`.toLowerCase().replace(/[^a-z0-9]/g, '-');

      // Prüfen, ob Ticket bereits existiert
      const existing = guild.channels.cache.find(c =>
        c.name === channelName && c.parentId === categoryId
      );

      if (existing) {
        await interaction.reply({ content: '❗ Du hast bereits ein offenes Support-Ticket.', ephemeral: true });
        return;
      }

      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: categoryId,
        permissionOverwrites: [
          {
            id: guild.roles.everyone, // Niemand sonst
            deny: ['ViewChannel'],
          },
          {
            id: member.id, // Der Ticket-Ersteller
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
          },
          {
            id: supportRoleId, // Die Support-Rolle
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
          },
        ],
      });

      await interaction.reply({ content: `✅ Dein kartenauftrag-Ticket wurde erstellt: ${channel}`, ephemeral: true });

      await channel.send(`👋 Hallo ${member.user.username}, bitte beschildere dein kartenauftrag hier.\n\n💰 Preise (variieren je nach Aufwand): 

📌 2D-Karten
▫️ Nur Teppich – 500.000 
▫️ Komplett (alles enthalten) – 1,5 Mio 

📌 3D-Karten
▫️ Komplett (alles enthalten) – 5 Mio 

Falls du spezielle Wünsche hast, lass es uns wissen! Wir freuen uns auf deine Anfrage. 😊`);
    }
  }
});

client.on('interactionCreate', async interaction => {
  // Button gedrückt
  if (interaction.isButton()) {
    if (interaction.customId === 'clanbewerbung') {
      const modal = new ModalBuilder()
        .setCustomId('clanbewerbungModal')
        .setTitle('Clanbewerbung');

const frage1 = new TextInputBuilder()
  .setCustomId('frage1')
  .setLabel('Wie heißt du in Minecraft / dein Alter') 
  .setStyle(TextInputStyle.Short)
  .setRequired(true);

const frage2 = new TextInputBuilder()
  .setCustomId('frage2')
  .setLabel('Auf welchem Gerät / Minecraft version?')
  .setStyle(TextInputStyle.Short)
  .setRequired(true);

const frage3 = new TextInputBuilder()
  .setCustomId('frage3')
  .setLabel('Als was willst du dich bewerben')
  .setStyle(TextInputStyle.Short)
  .setRequired(true);

const frage4 = new TextInputBuilder()
  .setCustomId('frage4')
  .setLabel('Stärken und Schwächen')
  .setStyle(TextInputStyle.Paragraph)
  .setRequired(true);

const frage5 = new TextInputBuilder()
  .setCustomId('frage5')
  .setLabel('Warum sollten wir dich nehmen?')
  .setStyle(TextInputStyle.Paragraph)
  .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(frage1),
        new ActionRowBuilder().addComponents(frage2),
        new ActionRowBuilder().addComponents(frage3),
        new ActionRowBuilder().addComponents(frage4),
        new ActionRowBuilder().addComponents(frage5),
      );

      await interaction.showModal(modal);
    }
  }

  // Modal abgeschickt
  if (interaction.type === InteractionType.ModalSubmit) {
    if (interaction.customId === 'clanbewerbungModal') {
      const antwort1 = interaction.fields.getTextInputValue('frage1');
      const antwort2 = interaction.fields.getTextInputValue('frage2');
      const antwort3 = interaction.fields.getTextInputValue('frage3');
      const antwort4 = interaction.fields.getTextInputValue('frage4');
      const antwort5 = interaction.fields.getTextInputValue('frage5');

      const guild = interaction.guild;
      if (!guild) return interaction.reply({ content: 'Fehler: Server nicht gefunden.', ephemeral: true });

      const channelName = `clanbewerbung-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

      const existingChannel = guild.channels.cache.find(c => c.name === channelName);
      if (existingChannel) {
        return interaction.reply({ content: `Ein Ticket mit deinem Namen existiert bereits: ${existingChannel}`, ephemeral: true });
      }

      try {
        const channel = await guild.channels.create({
          name: channelName,
          type: 0,
          parent: '1350888146434261205', // Kategorie-ID
          permissionOverwrites: [
            {
              id: guild.roles.everyone,
              deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
              id: interaction.user.id,
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            },
            {
              id: '1385668674542633020', // Rolle, die Zugriff bekommt
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            },
          ],
        });

        await channel.send({
          content: 
`Neue Clanbewerbung von **${interaction.user.username}**

**Minecraft Name & Alter:** ${antwort1}
**Gerät:** ${antwort2}
**Beworben als:** ${antwort3}
**Stärken & Schwächen:** ${antwort4}
**Warum bewerben:** ${antwort5}`
        });

        await interaction.reply({ content: `Deine Bewerbung wurde abgeschickt! Dein Ticket wurde erstellt: ${channel}`, ephemeral: true });

      } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Fehler beim Erstellen des Tickets. Bitte kontaktiere einen Administrator.', ephemeral: true });
      }
    }
  }
});

client.on('interactionCreate', async interaction => {
  // Button gedrückt
  if (interaction.isButton()) {
    if (interaction.customId === 'teambewerbung') {
      const modal = new ModalBuilder()
        .setCustomId('Teambewerbungs')
        .setTitle('Teambewerbung');

const frage1 = new TextInputBuilder()
  .setCustomId('frage6')
  .setLabel('Wie heißt du in Minecraft / dein Alter') 
  .setStyle(TextInputStyle.Short)
  .setRequired(true);

const frage2 = new TextInputBuilder()
  .setCustomId('frage7')
  .setLabel('Auf welchem Gerät / Minecraft version?')
  .setStyle(TextInputStyle.Short)
  .setRequired(true);

const frage3 = new TextInputBuilder()
  .setCustomId('frage8')
  .setLabel('Als was willst du dich bewerben')
  .setStyle(TextInputStyle.Short)
  .setRequired(true);

const frage4 = new TextInputBuilder()
  .setCustomId('frage9')
  .setLabel('Stärken und Schwächen')
  .setStyle(TextInputStyle.Paragraph)
  .setRequired(true);

const frage5 = new TextInputBuilder()
  .setCustomId('frage10')
  .setLabel('Warum sollten wir dich nehmen?')
  .setStyle(TextInputStyle.Paragraph)
  .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(frage1),
        new ActionRowBuilder().addComponents(frage2),
        new ActionRowBuilder().addComponents(frage3),
        new ActionRowBuilder().addComponents(frage4),
        new ActionRowBuilder().addComponents(frage5),
      );

      await interaction.showModal(modal);
    }
  }

  // Modal abgeschickt
  if (interaction.type === InteractionType.ModalSubmit) {
    if (interaction.customId === 'Teambewerbungs') {
      const antwort1 = interaction.fields.getTextInputValue('frage6');
      const antwort2 = interaction.fields.getTextInputValue('frage7');
      const antwort3 = interaction.fields.getTextInputValue('frage8');
      const antwort4 = interaction.fields.getTextInputValue('frage9');
      const antwort5 = interaction.fields.getTextInputValue('frage10');

      const guild = interaction.guild;
      if (!guild) return interaction.reply({ content: 'Fehler: Server nicht gefunden.', ephemeral: true });

      const channelName = `Teambewerbung-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

      const existingChannel = guild.channels.cache.find(c => c.name === channelName);
      if (existingChannel) {
        return interaction.reply({ content: `Ein Ticket mit deinem Namen existiert bereits: ${existingChannel}`, ephemeral: true });
      }

      try {
        const channel = await guild.channels.create({
          name: channelName,
          type: 0,
          parent: '1350888146434261205', // Kategorie-ID
          permissionOverwrites: [
            {
              id: guild.roles.everyone,
              deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
              id: interaction.user.id,
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            },
            {
              id: '1385668674542633020', // Rolle, die Zugriff bekommt
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            },
          ],
        });

        await channel.send({
          content: 
`Neue Clanbewerbung von **${interaction.user.username}**

**Minecraft Name & Alter:** ${antwort1}
**Gerät:** ${antwort2}
**warum sllten wir dich nehmen:** ${antwort3}
**Stärken & Schwächen:** ${antwort4}
**beworben als:** ${antwort5}`
        });

        await interaction.reply({ content: `Deine Bewerbung wurde abgeschickt! Dein Ticket wurde erstellt: ${channel}`, ephemeral: true });

      } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Fehler beim Erstellen des Tickets. Bitte kontaktiere einen Administrator.', ephemeral: true });
      }
    }
  }
});

client.on('interactionCreate', async interaction => {

  if (!interaction.isChatInputCommand()) return;

if (interaction.commandName === 'close') {
  const allowedRoleId = "1385668674542633020";
  const allowedCategoryId = config.TICKET_CATEGORY_ID;
  const logChannelId = '1385664143075311637';

  if (!interaction.member.roles.cache.has(allowedRoleId)) {
    return await interaction.reply({ content: '❌ Du hast keine Berechtigung, dieses Ticket zu schließen.', ephemeral: true });
  }

  if (interaction.channel.parentId !== allowedCategoryId) {
    return await interaction.reply({ content: '❌ Dieser Befehl kann nur in Clan-Bewerbungstickets verwendet werden.', ephemeral: true });
  }

  try {
    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
    const chatLog = sortedMessages.map(m => `${m.author.tag}: ${m.content}`).join('\n');

    const logChannel = await interaction.guild.channels.fetch(logChannelId);

    const thread = await logChannel.threads.create({
      name: `📂 ${interaction.channel.name}`,
      autoArchiveDuration: 1440,
      reason: 'Ticket wurde geschlossen',
      type: ChannelType.PublicThread 
    });
    await thread.send({
      content: `📁 Archiv von Ticket \`${interaction.channel.name}\``,
      files: [{
        attachment: Buffer.from(chatLog, 'utf-8'),
        name: `archiv-${interaction.channel.name}.txt`
      }]
    });

    setTimeout(() => {
      interaction.channel.delete().catch(console.error);
    }, 3000);

  } catch (err) {
    console.error('❌ Fehler beim Archivieren:', err);
    await interaction.followUp({ content: '❌ Fehler beim Archivieren. Bitte logs prüfen.', ephemeral: true });
  }
}

});

const rest = new REST({ version: '10' }).setToken(config.TOKEN);

(async () => {
  try {
    console.log('📡 Registriere Slash-Befehle...');

    await rest.put(
      Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID),
      {
        body: [
            { name: 'close', description: 'Schließt das ticket.' },
            { name: 'event', description: 'für ein event aus.' },
        ],
      }
    );

    console.log('✅ Befehle registriert.');
  } catch (error) {
    console.error('❌ Fehler beim Registrieren der Slash-Befehle:', error);
  }

  client.login(config.TOKEN);
})();