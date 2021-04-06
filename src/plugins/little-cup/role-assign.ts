import { setRoleAssign } from '../integrations/discord/functions/role-assign';

const roles = [
	{ emoji: '448957747392806932', roleId: '400043115689541632' }, // matches
	{ emoji: '747852764188770384', roleId: '796760547458154527' }, // lc
	{ emoji: '747943751040893058', roleId: '796760708330815520' }, // lc uu
	{ emoji: '338908474027016194', roleId: '796760836529455115' }, // lc uber
	{ emoji: '688948873523494921', roleId: '796760875292950560' }, // usum
	{ emoji: '345048569163808769', roleId: '796760913167908905' }, // oras
	{ emoji: '321781106330435584', roleId: '796760934747471903' }, // b2w2
	{ emoji: '430963035696529409', roleId: '796760965852168232' } // dpp
];

const guildId = '231275118700003328';
const channelId = '796760271191277588';
const messageId = '807706757278597150';

setRoleAssign(guildId, channelId, messageId, roles);
