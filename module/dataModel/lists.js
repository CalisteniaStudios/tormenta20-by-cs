const RULES = {};
/**
 * Default system abilities
 */
RULES['abilities'] = ['for','des','con','int','sab','car'];

/**
 * Default system skills
 */
RULES['skills'] = {};
RULES['skills']['core'] = ['acro','ades','atle','atua','cava','conh','cura','dipl','enga','fort','furt','guer','inic','inti','intu','inve','joga','ladi','luta','mist','nobr','ofic','perc','pilo','pont','refl','reli','sobr','vont'];

/**
 * Skills from campaign setting
 */
 RULES['skills']['Tormenta20'] = [];
 RULES['skills']['Skyfall'] = []; //['defe','ocul'];

/**
 * Skill groups
 */
 RULES['skills']['for'] = ['atle','luta'];
 RULES['skills']['des'] = ['acro','cava','furt','inic','ladi','pilo','pont','refl'];
 RULES['skills']['con'] = ['fort'];
 RULES['skills']['int'] = ['conh','guer','inve','mist','nobr','ofic'];
 RULES['skills']['sab'] = ['cura','intu','ocul','perc','reli','sobr','vont'];
 RULES['skills']['car'] = ['ades','atua','dipl','enga','inti','joga'];

 RULES['skills']['craft'] = ['arme','alfa','alqu','arte','escr','culi'];
 RULES['skills']['social'] = ['dipl','enga'];
 RULES['skills']['knowl'] = ['conh','mist','ocul','nobr','reli','sobr'];
 RULES['skills']['saves'] = ['fort','refl','vont'];
 RULES['skills']['attack'] = ['luta','pont'];
 
 RULES['skills']['trained'] = ['ades','guer','joga','ladi','mist','nobr','ofic','pilo','reli'];
 RULES['skills']['armor'] = ['acro','furt','ladi'];
 RULES['skills']['size'] = ['acro','furt','ladi'];

 /* Skill Actions */
 RULES['skills']['maneuver'] = ['agar','derr','desa','empu','queb'];

 /* Core Status Effects */
 RULES['statusEffects'] = {};
 RULES['statusEffects']['core'] = ['abalado', 'agarrado', 'alquebrado', 'apavorado', 'atordoado', 'caido', 'cego', 'confuso', 'debilitado', 'desprevenido', 'doente', 'emchamas', 'enjoado', 'enredado', 'envenenado', 'esmorecido', 'exausto', 'fascinado', 'fatigado', 'fraco', 'frustrado', 'imovel', 'inconsciente', 'indefeso', 'lento', 'morto', 'ofuscado', 'paralisado', 'pasmo', 'petrificado', 'sangrando', 'surdo', 'surpreendido', 'vulneravel', 'sobrecarregado']

 RULES['statusEffects']['Tormenta20'] = [];
 RULES['statusEffects']['Skyfall'] = ['ferido'];

 /* Core Status Effects */
 RULES['damageTypes'] = {};
 RULES['damageTypes']['core'] = ['acido', 'corte', 'eletricidade', 'essencia', 'fogo', 'frio', 'impacto', 'luz', 'mental', 'perfuracao', 'trevas', 'veneno'];

 /* Tags */
 RULES['tags'] = {};
 /* Actor/Creature Tags */
 RULES['tags']['creature'] = ['humanoide','animal','monstro','morto-vivo','espirito','construto'];
//  RULES['tags']['race'] = ['humano','elfo','anao','dahllan','goblin','lefou','minotauro','qareen','hynne','kliren','medusa','sereia','tritao','suraggel','aggelus','sulfure','trog','golem','osteon'];
 /* Base races */
 RULES['tags']['race'] = ['humano','elfo','anao','goblin'];

 /* Setting T20 races/legacy */
 RULES['tags']['raceTormenta20'] = ['dahllan','lefou','minotauro','qareen','hynne','kliren','medusa','sereia','tritao','suraggel','aggelus','sulfure','silfide','trog','golem','osteon'];
 RULES['tags']['raceTormenta20Extra'] = ['hobgoblin','bugbear','finntroll','orc','gnoll','ogro','kobold','centauro','moreau','ptero','ceratops','velocis','voracis'];
 RULES['tags']['groups'] = ['goblinoides','duyshidakk','povos-trovao','puristas','lefeu'];

 /* Setting Skyfall races/legacy */
 RULES['tags']['raceSkyfall'] = ['pequenino','anuro','draco','gnomo','kia','kishin','mbo','sanguir','tatsunoko','urodelo'];
 RULES['tags']['curseSkyfall'] = ['aetherideo','gorgona','sombrio'];
 
 /* Setting T20 classes */
 RULES['tags']['class'] = ['arcanista','barbaro','bardo','bucaneiro','cacador','cavaleiro','clerigo','druida','guerreiro','inventor','ladino','lutador','nobre','paladino'];
 RULES['tags']['subclass'] = ['nobre','plebeu','aristocrata','mercador','autoridade','conjurador','arcano','divino','devoto','magico'];
 
 RULES['tags']['disposition'] = ['aliado','inimigo','neutro'];
 RULES['tags']['atitude'] = ['prestativo','amistoso','indiferente','inamistoso','hostil'];
 
 /* Condition Tags */
 RULES['tags']['condition'] = ['medo','desprevenido']
 /* Item Tags */
 RULES['tags']['weaponType'] = ['simples','natural','marcial','exotica','defogo','leve','umamao','duasmaos','disparo','arremesso','agil','adaptavel','alongada','dupla','versatil','aumentada','reduzida','primitiva'];
 /* Spell Tags */
 RULES['tags']['spellType'] = ['arcana','divina','universal'];
 RULES['tags']['school'] = ['abjuracao','advinhacao','convocacao','encantamento','evocacao','ilusao','necromancia','transmutacao'];

 /* Power Tags */
 
/* Export */
 export {
	RULES
 }