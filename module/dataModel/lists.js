 const lists = {};
/**
 * Default system abilities
 */
 lists['abilities'] = ['for','des','con','int','sab','car'];

/**
 * Default system skills
 */
 lists['skills'] = {};
 lists['skills']['core'] = ['acro','ades','atle','atua','cava','conh','cura','dipl','enga','fort','furt','guer','inic','inti','intu','inve','joga','ladi','luta','mist','nobr','ofic','perc','pilo','pont','refl','reli','sobr','vont'];

/**
 * Skills from campaign setting
 */
 lists['skills']['Tormenta20'] = [];
 lists['skills']['Skyfall'] = ['defe','ocul'];

/**
 * Skill groups
 */
 lists['skills']['for'] = ['atle','luta'];
 lists['skills']['des'] = ['acro','cava','furt','inic','ladi','pilo','pont','refl'];
 lists['skills']['con'] = ['fort'];
 lists['skills']['int'] = ['conh','guer','inve','mist','nobr','ofic'];
 lists['skills']['sab'] = ['cura','intu','ocul','perc','reli','sobr','vont'];
 lists['skills']['car'] = ['ades','atua','dipl','enga','inti','joga'];

 lists['skills']['craft'] = ['arme','alfa','alqu','arte','escr','culi'];
 lists['skills']['social'] = ['dipl','enga'];
 lists['skills']['knowl'] = ['conh','mist','ocul','nobr','reli','sobr'];
 lists['skills']['saves'] = ['fort','refl','vont'];
 lists['skills']['attack'] = ['luta','pont'];
 
 lists['skills']['trained'] = ['ades','guer','joga','ladi','mist','nobr','ofic','pilo','reli'];
 lists['skills']['armor'] = ['acro','furt','ladi'];
 lists['skills']['size'] = ['acro','furt','ladi'];

 /* Skill Actions */
 lists['skills']['maneuver'] = ['agar','derr','desa','empu','queb'];

 /* Core Status Effects */
 lists['statusEffects'] = {};
 lists['statusEffects']['core'] = ['abalado', 'agarrado', 'alquebrado', 'apavorado', 'atordoado', 'caido', 'cego', 'confuso', 'debilitado', 'desprevenido', 'doente', 'emchamas', 'enjoado', 'enredado', 'envenenado', 'esmorecido', 'exausto', 'fascinado', 'fatigado', 'fraco', 'frustrado', 'imovel', 'inconsciente', 'indefeso', 'lento', 'morto', 'ofuscado', 'paralisado', 'pasmo', 'petrificado', 'sangrando', 'surdo', 'surpreendido', 'vulneravel', 'sobrecarregado']

 lists['statusEffects']['Tormenta20'] = [];
 lists['statusEffects']['Skyfall'] = ['ferido'];

 /* Core Status Effects */
 lists['damageTypes'] = {};
 lists['damageTypes']['core'] = ['acido', 'corte', 'eletricidade', 'essencia', 'fogo', 'frio', 'impacto', 'luz', 'mental', 'perfuracao', 'trevas', 'veneno'];

 /* Tags */
 lists['tags'] = {};
 /* Actor/Creature Tags */
 lists['tags']['creature'] = ['humanoide','animal','monstro','morto-vivo','espirito','construto'];
//  lists['tags']['race'] = ['humano','elfo','anao','dahllan','goblin','lefou','minotauro','qareen','hynne','kliren','medusa','sereia','tritao','suraggel','aggelus','sulfure','trog','golem','osteon'];
 /* Base races */
 lists['tags']['race'] = ['humano','elfo','anao','goblin'];

 /* Setting T20 races/legacy */
 lists['tags']['raceTormenta20'] = ['dahllan','lefou','minotauro','qareen','hynne','kliren','medusa','sereia','tritao','suraggel','aggelus','sulfure','silfide','trog','golem','osteon'];
 lists['tags']['raceTormenta20Extra'] = ['hobgoblin','bugbear','finntroll','orc','gnoll','ogro','kobold','centauro','moreau','ptero','ceratops','velocis','voracis'];
 lists['tags']['groups'] = ['goblinoides','duyshidakk','povos-trovao','puristas','lefeu'];

 /* Setting Skyfall races/legacy */
 lists['tags']['raceSkyfall'] = ['pequenino','anuro','draco','gnomo','kia','kishin','mbo','sanguir','tatsunoko','urodelo'];
 lists['tags']['curseSkyfall'] = ['aetherideo','gorgona','sombrio'];
 
 /* Setting T20 classes */
 lists['tags']['class'] = ['arcanista','barbaro','bardo','bucaneiro','cacador','cavaleiro','clerigo','druida','guerreiro','inventor','ladino','lutador','nobre','paladino'];
 lists['tags']['subclass'] = ['nobre','plebeu','aristocrata','mercador','autoridade','conjurador','arcano','divino','devoto','magico'];
 
 lists['tags']['disposition'] = ['aliado','inimigo','neutro'];
 lists['tags']['atitude'] = ['prestativo','amistoso','indiferente','inamistoso','hostil'];
 
 /* Condition Tags */
 lists['tags']['condition'] = ['medo','desprevenido']
 /* Item Tags */
 lists['tags']['weaponType'] = ['simples','natural','marcial','exotica','defogo','leve','umamao','duasmaos','disparo','arremesso','agil','adaptavel','alongada','dupla','versatil','aumentada','reduzida','primitiva'];
 /* Spell Tags */
 lists['tags']['spellType'] = ['arcana','divina','universal'];
 lists['tags']['school'] = ['abjuracao','advinhacao','convocacao','encantamento','evocacao','ilusao','necromancia','transmutacao'];

 /* Power Tags */
 
/* Export */
 export {
	lists
 }