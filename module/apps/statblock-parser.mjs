import ActorT20 from "../documents/item.mjs";

export default class StatblockParser extends FormApplication {
	
	constructor(object={}, options={}) {
		super(object, options);

		this.object.packequipamentos = game.packs.get('tormenta20.equipamentos');
		this.object.packsmagias = game.packs.get('tormenta20.magias');
		this.object.packspoderes = game.packs.get('tormenta20.poderes');
		
		this.object.packequipamentos.getDocuments();
		this.object.packsmagias.getDocuments();
		this.object.packspoderes.getDocuments();
	}

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: "statblock-parser",
			classes: ["tormenta20"],
			title: game.i18n.localize('T20.StatblockParser'),
			template: "systems/tormenta20/templates/apps/statblock-parser.html",
			width: 900,
			height: "auto",
		});
	}



	getData() {
		let formData = super.getData();
		formData['config'] = CONFIG.T20;
		formData['parser'] = this.object;
		formData['statblock'] = this.object.statblock;
		formData['schema'] = this.object.schema;
		formData['items'] = this.object.items;
		formData['log'] = this.object.log;
		
		return formData;
	}

	activateListeners(html) {
		html.find('.validate').click(this._parseStatblock.bind(this));
		html.find('.apply').click(this._applyToActor.bind(this));
	}

	_applyToActor(ev){
		ev.preventDefault();
		let actor = this.object.actor;
		let acItems = actor.items.map( m => m.id );
		actor.deleteEmbeddedDocuments('Item', acItems);
		let acEffects = actor.effects.map( m => m.id );
		actor.deleteEmbeddedDocuments('ActiveEffect', acEffects);
		
		actor.update({type: 'npc', name: this.object.schema.name, system: this.object.schema});
		actor.createEmbeddedDocuments('Item', this.object.items);
		return this.close();
	}

	_parseStatblock(ev){
		ev.preventDefault();
		const statblock = ev.currentTarget.closest('form').statblock.value.replace('–','-');
		const schema = new Actor({type:'npc',name:'template'}).system.toObject();
		const log = [];
		const itemsList = [];
		this.object.items = [];
		
		this.parseData(statblock, schema, itemsList, log);
		this.parseSkills(statblock, schema, itemsList, log);
		this.parseAbilities(statblock, schema, itemsList, log);
		this.parseWeapons(statblock, schema, itemsList, log);
		this.parseTreasure(statblock, schema, itemsList, log);
		this.object.statblock = statblock;
		this.object.schema = schema;
		this.object.items = itemsList;
		this.object.log = log;
		
		this.render(true);
	}

	parseData(statblock, schema, itemsList, log){
		let msg = '';
		// Extrai o nome e ND
		try {
			let foe = statblock.replace(/\n/g,' ').match(/(?<name>.*) ND (?<nd>[\d|\d\/\d]+)/).groups;
			schema.name = foe.name;
			log.push({success: true, message: `Nome: ${schema.name}`});
			schema.attributes.nd = foe.nd;
			log.push({success: true, message: `ND: ${schema.attributes.nd}`});
		} catch (error) {
			console.warn(error);
			log.push({success: false, message: `Nome ou ND`});
		}

		// Extrai Tipos
		try {
			const cType = Object.fromEntries( Object.entries(CONFIG.T20.creatureTypes).map(([key, value]) => [value, key]) );
			const cRole = Object.fromEntries( Object.entries(CONFIG.T20.creatureRoles).map(([key, value]) => [value, key]) );
			const cSize = Object.fromEntries( Object.entries(CONFIG.T20.actorSizes).map(([key, value]) => [value, key]) );
	
			let types = statblock.capitalize().match(/.* (especial|solo|lacaio)/i)[0].replace(/Iniciativa|\(|\)/g,'').trim().split(' ').map( m => cType[m] || cRole[m.capitalize()] || cSize[m] || m );
			for (let t of types) {
				if( CONFIG.T20.creatureTypes[t] ) {
					schema.detalhes.tipo = t;
					log.push({success: true, message: `Tipo de Criatura: ${schema.detalhes.tipo}`});
				} else if ( CONFIG.T20.creatureRoles[t] ) {
					schema.detalhes.role = t;
					log.push({success: true, message: `Papel em Combate: ${schema.detalhes.role}`});
				} else if ( CONFIG.T20.actorSizes[t] ) {
					schema.tracos.tamanho = t;
					log.push({success: true, message: `Tamanho: ${schema.tracos.tamanho}`});
				} else {
					schema.detalhes.raca = t;
					log.push({success: true, message: `Subtipo de Criatura: ${schema.detalhes.raca}`});
				}
			}
		} catch (error) {
			console.warn(error);
			log.push({success: false, message: `Tipo de Criatura, Papel em Combate, Tamanho, Subtipo de Criatura`});
		}
		
		// Extrai atributos
		try {
			let abilities = statblock.match(/For ([\-|\–]?[\d|\—]+), *[^\n]*/);
			abilities = abilities[0].toLowerCase().match(/(\w+) ([\-|\–]?[\d|\—]+)/g).map( m => {return {[m.split(' ')[0]]: m.split(' ')[1]}});
			abilities = Object.assign({}, ...abilities);
			msg = '';
			for ( let [abl, value] of Object.entries(abilities) ){
				schema.atributos[abl].base = parseInt(value.replace('—','-0').replace('–','-'));
				msg += `${abl}: ${value} `;
			}
			log.push({success: true, message: `Atributos: ${msg}`});
		} catch (error) {
			console.warn(error);
			log.push({success: false, message: `Atributos`});
		}

		// Extrai Recursos
		try {
			let hp = statblock.match(/Pontos de Vida (?<value>\d+)/);
			let mp = statblock.match(/Pontos de Mana (?<value>\d+)/);
			if ( hp && hp.groups ) {
				schema.attributes.pv.value = parseInt(hp.groups.value);
				schema.attributes.pv.max = parseInt(hp.groups.value);
				log.push({success: true, message: `Pontos de Vida: ${schema.attributes.pv.max}`});
			}
			if ( mp && mp.groups ) {
				schema.attributes.pm.value = parseInt(mp.groups.value);
				schema.attributes.pm.max = parseInt(mp.groups.value);
				log.push({success: true, message: `Pontos de Mana: ${schema.attributes.pm.max}`});
			}else {
				schema.attributes.pm.value = 0;
				schema.attributes.pm.max = 0;
			}
		} catch (error) {
			console.warn(error);
			log.push({success: false, message: `Pontos de Vida e/ou Pontos de Mana`});
		}

		// Extrai Defesa
		try {
			let def = statblock.match(/Defesa (?<value>\d+)/).groups;
			schema.attributes.defesa.base = def.value || 10;
			log.push({success: true, message: `Defesa: ${schema.attributes.defesa.base}`});
		} catch (error) {
			console.warn(error);
			log.push({success: false, message: `Defesa`});
		}
		
		// Extrai Resistências
		try {
			let res = statblock.replace(/\n/g,' ').match(/Defesa .* Pontos de Vida/);
			res = res[0]?.replace(/((Defesa|For|Ref|Von|Fort|Refl|Vont) [\+|\-|\–]?\d+[,]?|Pontos de Vida)/g,'').trim() || '';
			schema.detalhes.resistencias = res;
			log.push({success: true, message: `Resistências (Texto): ${schema.detalhes.resistencias}`});
			
			res = res.replace(/ |,/g,'_').slugify().replace(/_/g,' ');
			res = res.replace(/imunidade|reducao|resistencia|vulnerabilidade/ig, (match) => '#' + match).split('#').filter(Boolean).map(m => m.trim());
			res = res.map( m => {return {[m.match(/imunidade|reducao|resistencia|vulnerabilidade/)]: m.split(' ')}});
			
			let ic = [];
			let rd = [];
			let dmgimuni = [];
			let dmgvuln = [];
			res.forEach( (r) => {
				if ( r.imunidade ) {
					ic.push( ...r.imunidade.filter( f => CONFIG.T20.conditionTypes[f] ) ) ;
					dmgimuni.push( ...r.imunidade.filter( f => CONFIG.T20.damageTypes[f] ) ) ;
				} else if ( r.reducao ) {
					let [value, vuln] = r.reducao.find( f => parseInt(f) ).split('/');
					rd.push(
						...r.reducao.filter( f => CONFIG.T20.damageTypes[f] ).map( f => {return {[f]:value}})
					);
				} else if ( r.resistencia ) {
					// TODO criar mecanica de resistência
				} else if ( r.vulnerabilidade ) {
					dmgvuln = r.vulnerabilidade.filter( f => CONFIG.T20.damageTypes[f] );
				}
			});
	
			if ( ic.length ){
				schema.tracos.ic.value = ic;
				log.push({success: true, message: `Imunidades a Condições: ${ic.join(', ')}`});
			}
			msg = '';
			let tmp = Object.assign({}, ...rd);
			for ( let [k, v] of Object.entries(tmp) ){
				schema.tracos.resistencias[k].base = parseInt(v) || 0;
				msg += `${k}: ${v}; `;
			}
			log.push({success: true, message: `Resistência a dano: ${msg}`});
			for ( let k of dmgimuni ){
				schema.tracos.resistencias[k].imunidade = true;
			}
			log.push({success: true, message: `Imunidade a dano: ${dmgimuni.join(', ')}`});
			for ( let k of dmgvuln ){
				schema.tracos.resistencias[k].vulnerabilidade = true;
			}
			log.push({success: true, message: `Vulnerabilidade a dano: ${dmgvuln.join(', ')}`});
		} catch (error) {
			console.warn(error);
			log.push({success: false, message: `Imunidades a Condições e Reduções de Dano`});
		}
		
		// Extrai Deslocamentos
		try {
			let movement = statblock.toLowerCase().match(/(\w+ \d+m \(\d+q\))/ig).map( m => [m.match(/deslocamento|escalar|escavar|natação|voo/i)[0], m.match(/\d+/)[0]]);
			msg = '';
			for (let [move, value] of movement) {
				let ms = { deslocamento: 'walk', escalar:'climb', escavar:'burrow', natação:'swim', voo:'fly'};
				if ( ms[move] ){
					schema.attributes.movement[ms[move]] = parseInt(value);
					msg += `${move} ${value}; `;
				}
			}
			log.push({success: true, message: `Movimento: ${msg}`});
		} catch (error) {
			console.warn(error);
			log.push({success: false, message: `Deslocamentos`});
		}
		
		// Extrai Sentidos percepção às cegas
		try {
			let senses = Object.fromEntries( Object.entries(CONFIG.T20.senses).map(([key, value]) => [value.slugify(), key]) );
			let sentidos = statblock.replace(/\n/g,' ').match(/Iniciativa .* Defesa/)[0];
			sentidos = sentidos.replace(/Defesa/,'');
			sentidos = sentidos.split(',').map( m => m.trim().slugify() );
			sentidos = sentidos.filter( f => senses[f] ).map( m => senses[m] );
			schema.attributes.sentidos.value = sentidos;
			log.push({success: true, message: `Sentidos: ${sentidos.join(', ')}`});
		} catch (error) {
			console.warn(error);
			log.push({success: false, message: `Sentidos`});
		}
	}

	parseSkills(statblock, schema, itemsList, log){
		let msg ='';
		try {
			const ndparams = CONFIG.T20.NPCParams( schema.attributes.nd );
			const topsave = ndparams.topskill;
			const botsave = ndparams.botskill;
			let sks = Object.fromEntries( Object.entries(CONFIG.T20.pericias).map(([key, value]) => [value, key]) );
			sks['Fort'] = 'fort';
			sks['Ref'] = 'refl';
			sks['Von'] = 'vont';
			let skills = statblock.replace(/\n/g,' ').replace('–','-').match(/(Acrobacia|Adestramento|Atletismo|Atuação|Cavalgar|Conhecimento|Cura|Defesa|Diplomacia|Enganação|Fortitude|Furtividade|Guerra|Iniciativa|Intimidação|Intuição|Investigação|Jogatina|Ladinagem|Luta|Misticismo|Ocultismo|Nobreza|Ofício|Percepção|Pilotagem|Pontaria|Reflexos|Religião|Sobrevivência|Vontade|Fort|Ref|Von) ([\+|\-]\d+)/g);
			skills = skills.map( m => {return {[sks[m.split(' ')[0]]]: {value: parseInt(m.split(' ')[1])} }});
			skills = Object.assign({}, ...skills);
			msg = '';
			for (let [key, skill] of Object.entries(skills)) {
				if ( skill.value < 0 ){
					skill.outros = (botsave - skill.value)*-1;
				} else if ( skill.value >= topsave ) {
					skill.outros = skill.value - topsave;
					skill.treinado = true;
				} else if ( skill.value < topsave && skill.value >= topsave - (topsave - botsave)/2 ) {
					skill.outros = skill.value - topsave;
					skill.treinado = true;
				} else if ( skill.value >= botsave ) {
					skill.outros = skill.value - botsave;
				} else if ( skill.value < botsave ) {
					skill.outros = botsave - skill.value;
				}
				msg += `${key}: ${skill.value}; `;
				schema.pericias[key] = skill;
			}
			log.push({success: true, message: `Perícias: ${msg}`});
		} catch (error) {
			console.warn(error);
			log.push({success: false, message: `Perícias`});
		}
	}

	/**
	 * Search for world collenction and compendiums for item @name and @type
	 */
	searchItem(name, type, itemsList ){
		let idx = 5;
		if ( ['magia','poder'].includes(type) ) {
			if ( name.split('(')[1] ){
				name = name.split('(')[0].trim();
			} else {
				idx = name.split(' ').find( f => f.length > 3 && f[0].match(/[a-z]/));
				idx = idx ? (name.split(' ').indexOf(idx) - 1) : 5;
				name = idx ? name.split(' ', idx).join(' ') : name;
			}
		}
		let names = [];
		let words = name.split(' ', idx);
		let conc = '';
		for ( let i=0; i <= words.length; i++){
			for(let j=1; j < 6; j++){
				if ( i+j > words.length ) continue;
				conc = words.slice(i, i+j).join(' ');
				names.push(conc.slugify());
				conc = words.map( m => m.replace(/.$/,'')).slice(i, i+j).join(' ');
				names.push(conc.slugify());
			}
		}
		let exists = itemsList.find( f => names.includes(f.name.slugify()) );
		if ( exists ) {
			return {exists: true};
		}
		const packs = {
			arma: 'packequipamentos', equipamento: 'packequipamentos',
			magia: 'packsmagias', poder: 'packspoderes',
		}
		names.sort((a, b)=> b.length - a.length);
		// let item = game.items.find( f => f.type == type && names.includes(f.name.slugify()) );
		let item = false;
		names.every((n)=>{
			if ( type == '*') {
				item = game.items.find( (f)=> !['poder','magia','arma','classe'].includes(f.type) && f.name.slugify() == n );
				if ( item ) return;
				item = this.object[packs['equipamento']].find( f => f.type == type && f.name.slugify() == n );
			} else {
				item = game.items.find( (f)=> f.type==type && f.name.slugify() == n );
				if ( item ) return;
				item = this.object[packs[type]].find( f => f.type == type && f.name.slugify() == n );
			}
			if ( item ) return;
			return true;
		});
		
		if ( !item ) {
			type = type == '*' ? 'tesouro' : type;
			item = new game.tormenta20.entities.ItemT20({type:type, name: words.join(' ')});
		}
		item = item.toObject();
		delete item._id;
		return item;
	}

	parseAbilities(statblock, schema, itemsList, log){
		let msg ='';
		try {
			
			let actions = Object.fromEntries( Object.entries(CONFIG.T20.abilityActivationTypes).map(([key, value]) => [value, key]) );
			let abilities = '';
			if ( statblock.match(/À Distância (.|\n)*/) ) {
				abilities = statblock.match(/À Distância (.|\n)*/)[0]
			} else if ( statblock.match(/Corpo a Corpo (.|\n)*/) ) {
				abilities = statblock.match(/Corpo a Corpo (.|\n)*/)[0]
			} else { // if ( statblock.match(/Deslocamento (.|\n)*/) ) {
				abilities = statblock.match(/Deslocamento (.|\n)*/)[0]
			}
			abilities = abilities.match(/((.|\n)*)\nFor /)[1];
			abilities = abilities.replace(/(\.|\))\n/g,'</abl>#<abl>').split('#');
			abilities.shift();
			abilities = abilities.filter( m => !m.match(/(For ([\-|\–]?[\d|\—]+), Des)|(Perícias )|(Equipamento )|(Tesouro )/) );
			abilities = abilities.map( m =>  m.replace(/<abl>|<\/abl>/g,'').replace(/\n/g,' ').trim());
			abilities = abilities.map( m => {return {desc:m}});
			abilities.forEach( (ability) => {
				
				let spell = ability.desc.match(/• /) ? true : false;
				if ( spell ) ability.desc = ability.desc.replace('•','').trim();
				
				let item = this.searchItem( ability.desc, (spell?'magia':'poder'), itemsList );
				if ( item.exists ) return;
				
				ability.action = '';
				ability.pm = 0;
				ability.descOri = ability.desc;
				ability.desc = ability.desc.replace(new RegExp(item.name,'i'), '').trim();
				if ( ability.desc[0] == '(' ) {
					ability.action = ability.desc.match(/\(([^)]+)\)/);
					if ( ability.action ) {
						ability.desc = ability.desc.replace(ability.action[0], '').trim();
						ability.action = ability.action[0].replace(/\(|\)/g,'');
						ability.pm = ability.action.split(',')[1] ?? 0;
						if ( ability.pm ) ability.pm = ability.pm.match(/\d+/)[0];
						ability.action = ability.action.split(',')[0];
						ability.action = actions[ability.action];
					}
				}
				
				
				if ( spell ) {
					item.system.description.value = `<section class="secret">${ability.descOri}</section>${item.system.description.value}`;
				}
				if ( !spell ) {
					item.system.ativacao.custo = ability.pm;
					item.system.ativacao.execucao = ability.action;
					item.system.description.value = ability.desc;
				}
				ability.spell = spell;
				ability.item = item;
			});
			abilities = abilities.filter( f => f.item ).map( m => m.item );
			itemsList.push( ...abilities );
			let powers = abilities.filter( f => f.type == 'poder' );
			let spells = abilities.filter( f => f.type == 'magia' );
			
			msg = `Habilidades encontradas ${powers.length} `;
			msg += `(${powers.map( m => m.name ).join(', ')})`;
			log.push({success: true, message: `${msg}`});
			msg = `Magias encontradas ${spells.length} `;
			msg += `(${spells.map( m => m.name ).join(', ')})`;
			log.push({success: true, message: `${msg}`});
		} catch (error) {
			console.warn(error);
			log.push({success: false, message: `Poderes e Magias`});
		}
	}

	parseWeapons(statblock, schema, itemsList, log){
		let msg = '';
		try {
			// Filtra as Linhas de Corpo a Corpo|À Distância;
			let armaData = statblock.match(/((Corpo a Corpo|À Distância) [^\.]*)/);
			if ( !armaData[0] ) return;
			armaData = armaData[0];
			
			// Limpa e separa as armas;
			armaData = armaData.replace(/Corpo a Corpo|À Distância/g, '').replace(/\n/g,' ').replace(' e ', '|').replace(' ou ', '|').replace('), ', ')|').trim().split('|');
	
			// Extrai os dados das armas
			armaData = armaData.map( arma => arma.match(/(?<name>.*[^\+|\-]) (?<atk>[+|-]\d+) \((?<dmg>.*)\)/).groups );
			armaData.forEach( (arma) => {
				let item = this.searchItem(arma.name, 'arma', itemsList);
				if ( item.exists ) return;
				let rolls = [];
				// Prepara Rolagem de Ataque
				if ( arma.atk ) {
					let attackRoll = {
						"name": "Ataque", "key": "ataque0", "type": "ataque", "versatil": "",
						"parts": [
							["1d20","","weapon"],
							["","","skill"],
							[arma.atk,"","weaponbonus"],
						],
					}
					rolls.push(attackRoll);
				}
				// Prepara Rolagem de Dano
				if ( arma.dmg ) {
					let [dmg, crit] = arma.dmg.split(',');
					dmg = dmg.split('mais').map( rp => rp.trim().split(' ').map( t => t.slugify()).filter( m => m.match(/\d+d\d+[\+|\-]?[\d+]?/) || CONFIG.T20.damageTypes[m] ) );
					let wdmg = dmg.shift();
					let weaponDamage = item.system.rolls.find( r => r.type == "dano");
					let dmgtype = ( (weaponDamage ? weaponDamage.parts[0][1] : wdmg[1] || 'corte' ));
					let damageRoll = {
							"name": "Dano", "key": "dano1", "type": "dano", "versatil": "",
							"parts": [
								[wdmg[0], dmgtype , "weapon"],
								["", dmgtype, "ability"],
								...dmg
							],
					}
					rolls.push(damageRoll);
					crit = crit?.trim().match(/(?<margem>\d+)?\/?(?<multi>x\d)?/).groups || {};
					item.system.criticoM = parseInt(crit.margem) || 20;
					item.system.criticoX = parseInt(crit.multi) || 2;
					
				}
				item.system.rolls = rolls;
				item.system.description.value = `<section class="secret">${arma.name}</section>${item.system.description.value}`
				
				arma.item = item;
			});
			itemsList.push( ...armaData.map( arma => arma.item ).filter(Boolean) );
			
			msg += `Armas encontradas: ${armaData.length} `;
			msg += `(${armaData.map(m=> m.name).join(', ')})`;
			log.push({success: true, message: `${msg}`});
		} catch (error) {
			console.warn(error);
			log.push({success: false, message: `Armas`});
		}
	}

	
	parseTreasure(statblock, schema, itemsList, log){
		let msg = '';
		try {
			let equipamentos = statblock.replace(/\n/g,' ').match(/Equipamento[s]? .* Tesouro/);
			equipamentos = equipamentos ? equipamentos[0] : false;
			if ( equipamentos ) {
				equipamentos = equipamentos.replace(/Equipamento|Equipamentos|Tesouro/ig, '').split(',').map( m => m.replace('.','').trim());
				equipamentos = equipamentos.map( m => {return {desc:m}});
				equipamentos.forEach( (equip) => {
					let item = this.searchItem(equip.desc, '*', itemsList);
					if ( item.exists ) return;
					let qtd = equip.desc.match(/x(?<qtd>\d+)/);
					if ( qtd ) item.system.qtd = qtd.groups?.qtd || 1;
					item.system.description.value = equip.desc + '<br>' + item.system.description.value;
					equip.item = item;
				});
				equipamentos = equipamentos.filter( f => f.item ).map( m => m.item );
				itemsList.push( ...equipamentos );
				
				msg += `Equipamentos encontrados: ${equipamentos.length} `;
				msg += `(${equipamentos.map(m=> m.name).join(', ')})`;
				log.push({success: true, message: `${msg}`});
			}
		} catch (error) {
			console.warn(error);
			log.push({success: false, message: `Equipamentos`});
		}
		
		try {
			let tesouros = statblock.replace(/\n/g,' ').match(/Tesouro .*/)[0];
			tesouros = tesouros.replace(/Tesouro/,'').trim();
			schema.detalhes.tesouro = tesouros;
			log.push({success: true, message: `Tesouro (Texto): ${schema.detalhes.tesouro}`});
		} catch (error) {
			console.warn(error);
			log.push({success: false, message: `Tesouro`});
		}
	}

}
