import { setRoleAssign } from '../integrations/discord/functions/role-assign';

const squad = [
	{ emoji: '🟨', roleId: '819301087949488128' }, // paudroc pack
	{ emoji: '🟧', roleId: '819301145519849513' }, // kinekatic collective
	{ emoji: '🟦', roleId: '819301233264820245' }, // fosidew faction
	{ emoji: '🟥', roleId: '819301261852672050' }, // wolfrit pack
	{ emoji: '🟩', roleId: '819301484549636136' } // eregrant assembly
];

const pronouns = [
	{ emoji: '1️⃣', roleId: '819302218813014068' }, // he/him
	{ emoji: '2️⃣', roleId: '819302242308849675' }, // she/her
	{ emoji: '3️⃣', roleId: '819302258332139541' }, // they/them
	{ emoji: '4️⃣', roleId: '819302277445451777' } // other
];

const guildId = '473549175683022858';
const channelId = '820969541722177556';
const squadMessageId = '820970038348742706';
const pronounsMessageId = '820970745953517568';

setRoleAssign(guildId, channelId, squadMessageId, squad, true);
setRoleAssign(guildId, channelId, pronounsMessageId, pronouns);
