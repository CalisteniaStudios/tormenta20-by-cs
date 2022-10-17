import ActorT20 from "../actor/entity.js";

export default class StatblockParser extends FormApplication {
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
		// ACTORDATA
		formData['parser'] = this.object;
		formData['statblock'] = this.object.statblock;
		formData['schema'] = this.object.schema;
		formData['items'] = this.object.items;
		formData['log'] = this.object.log;
		console.log(this);
		
		return formData;
	}

	activateListeners(html) {
		// html.find('#statblock').change(this._parseStatblock.bind(this));
		
		html.find('.validate').click(this._parseStatblock.bind(this));
		html.find('.apply').click(this._applyToActor.bind(this));
		
	}

	_applyToActor(ev){
		ev.preventDefault();
		console.log('_applyToActor');
		let actor = this.object.actor;
		let items = actor.items.map( m => m.id );
		actor.deleteEmbeddedDocuments('Item', items);
		let effects = actor.effects.map( m => m.id );
		actor.deleteEmbeddedDocuments('ActiveEffect', effects);
		
		actor.update({type: 'npc', name: this.object.schema.name, system: this.object.schema});
		actor.createEmbeddedDocuments('Item', this.object.items);
		console.log(actor);
		return this.close();
	}

	_parseStatblock(ev){
		ev.preventDefault();
		const statblock = ev.currentTarget.closest('form').statblock.value;
		const schema = new Actor({type:'npc',name:'template'}).system.toObject();
		const items = [];
		const log = [];
		
		this.parseData(statblock, schema, items, log);
		this.parseSkills(statblock, schema, items, log);
		this.parseAbilities(statblock, schema, items, log);
		this.parseWeapons(statblock, schema, items, log);
		this.parseTreasure(statblock, schema, items, log);
		
		this.object.statblock = statblock;
		this.object.schema = schema;
		this.object.items = items;
		this.object.log = log;
		
		console.log(this.object);
		this.render(true);
	}

	parseData(statblock, schema, items, log){
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
	
			let types = statblock.capitalize().match(/.* \((especial|solo|lacaio)\)/i)[0].replace(/Iniciativa|\(|\)/g,'').trim().split(' ').map( m => cType[m] || cRole[m.capitalize()] || cSize[m] || m );
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
			res = res[0]?.replace(/((Defesa|For|Ref|Von|Fort|Refl|Vont) [\+|\-]?\d+,|Pontos de Vida)/g,'').trim() || '';
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
				schema.tracos.resistencias[k].value = parseInt(v) || 0;
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

	parseSkills(statblock, schema, items, log){
		let msg ='';
		try {
			const ndparams = CONFIG.T20.NPCParams( schema.attributes.nd );
			const topsave = ndparams.topskill;
			const botsave = ndparams.botskill;
			let sks = Object.fromEntries( Object.entries(CONFIG.T20.pericias).map(([key, value]) => [value, key]) );
			sks['Fort'] = 'fort';
			sks['Ref'] = 'refl';
			sks['Von'] = 'vont';
			let skills = statblock.replace(/\n/g,' ').match(/(Acrobacia|Adestramento|Atletismo|Atuação|Cavalgar|Conhecimento|Cura|Defesa|Diplomacia|Enganação|Fortitude|Furtividade|Guerra|Iniciativa|Intimidação|Intuição|Investigação|Jogatina|Ladinagem|Luta|Misticismo|Ocultismo|Nobreza|Ofício|Percepção|Pilotagem|Pontaria|Reflexos|Religião|Sobrevivência|Vontade|Fort|Ref|Von) ([\+|\-]\d+)/g);
			skills = skills.map( m => {return {[sks[m.split(' ')[0]]]: {value: parseInt(m.split(' ')[1])} }});
			skills = Object.assign({}, ...skills);
			msg = '';
			for (let [key, skill] of Object.entries(skills)) {
				if ( skill.value >= topsave ) {
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

	parseAbilities(statblock, schema, items, log){
		let msg ='';
		try {
			
			let actions = Object.fromEntries( Object.entries(CONFIG.T20.abilityActivationTypes).map(([key, value]) => [value, key]) );
			let magias = [];
			let abilities = statblock.replace(/\.\n/g,'</abl>#<abl>').split('#');
			abilities.shift();
			abilities.pop();
			abilities = abilities.filter( m => !m.match(/(For ([\-|\–]?[\d|\—]+), Des)|(Perícias )|(Equipamento )|(Tesouro )/) );
			// magias = abilities.filter( m => m.match(/• /) );
			// abilities = abilities.filter( m => !m.match(/• /) );
			abilities = abilities.map( m =>  m.replace(/<abl>|<\/abl>/g,'').replace(/\n/g,' ').trim());
			abilities = abilities.map( m => {return {desc:m}});
			abilities.forEach( (ability) => {
				
				let spell = ability.desc.match(/• /) ? true : false;
				if ( spell ) ability.desc = ability.desc.replace('•','').trim();
				// Identificando o nome
				let idx = false;
				let ablL = ability.desc.split(' ').map(m => m[0]);
				ablL.forEach( (l, k) => {
					if ( idx ) return;
					
					if ( l.match(/\(|\d/) ) { 
						idx = k;
						return;
					}
					
					if ( l.match(/[A-Z]/) ) {
						let k1 = ablL[k+1] ?? false;
						let k2 = ablL[k+2] ?? false;
						if ( !k1 || !k2 ) return;
						if ( k1.match(/[a-z]/) && k2.match(/[a-z]/) ) {
							idx = k;
						}
					}
				});
				if ( !idx ) return;
				ability.name = ability.desc.split(' ', idx).join(' ');
				ability.action = '';
				ability.pm = 0;
				ability.desc = ability.desc.replace(ability.name, '').trim();
				ability.descOri = ability.desc;
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
				
				let itemTemplate;
				itemTemplate = game.items.find( f => f.name == ability.name && f.type == (spell?'magia':'poder') );
				if ( spell && !itemTemplate ) {
					itemTemplate = game.packs.get("tormenta20.magias").index.find(i => i.name == ability.name );
				} else if ( !spell && !itemTemplate ) {
					itemTemplate = game.packs.get("tormenta20.poderes").index.find(i => i.name == ability.name );
				}
				if ( !itemTemplate ) {
					itemTemplate = new game.tormenta20.entities.ItemT20({name: ability.name, type:(spell?'magia':'poder')});
				}
				itemTemplate = itemTemplate.toObject();
				delete itemTemplate._id;
				if ( spell ) {
					console.log(itemTemplate, ability);
					itemTemplate.system.description.value = `<section class="secret">${ability.descOri}</section>${itemTemplate.system.description.value}`;
				}
				if ( !spell ) {
					itemTemplate.system.ativacao.custo = ability.pm;
					itemTemplate.system.ativacao.execucao = ability.action;
					itemTemplate.system.description.value = ability.desc;
				}
				ability.spell = spell;
				console.log(itemTemplate);
				ability.item = itemTemplate;
			});
			items.push(...abilities.map( m => m.item));

			msg = `Poderes encontrados ${abilities.filter(m => !m.spell).length} `;
			msg += `(${abilities.map( m => m.name ).join(',')})`;
			log.push({success: true, message: `${msg}`});
			msg = `Magias encontradas ${abilities.filter(m => m.spell).length}`;
			msg += `(${abilities.map( m => m.name ).join(',')})`;
			log.push({success: true, message: `${msg}`});
		} catch (error) {
			console.warn(error);
			log.push({success: false, message: `Poderes e Magias`});
		}
	}

	parseWeapons(statblock, schema, items, log){
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
			// TODO Limpar o nome - remover quantidades (dois, quatro, x2), características (aumentada, da tormenta)
	
			armaData.forEach( (arma) => {
				let item = game.items.find( f => f.name == arma.name && f.type == 'arma' );
				if ( !item ) {
					item = game.packs.get("tormenta20.equipamentos").index.find(i => i.name == arma.name );
				}
				if ( !item ) {
					item = new game.tormenta20.entities.ItemT20({name: arma.name, type:'arma'});
				}
				item = item.toObject();
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
					item.system.criticoM = crit.margem || 20;
					item.system.criticoX = crit.multi || 2;
					
				}
				item.system.rolls = rolls;
				
				arma.item = item;
			});
			items.push( ...armaData.map( arma => arma.item) );
			
			msg += `Armas Identificadas: ${armaData.length}; `;
			msg += `(${armaData.map(m=> m.name).join(',')})`;
			log.push({success: true, message: `${msg}`});
		} catch (error) {
			console.warn(error);
			log.push({success: false, message: `Armas`});
		}
	}

	
	parseTreasure(statblock, schema, items, log){
		let msg = '';
		try {
			let equipamentos = statblock.replace(/\n/g,' ').match(/Equipamento .* Tesouro/);
			equipamentos = equipamentos ? equipamentos[0] : false;
			if ( equipamentos ) {
				equipamentos = equipamentos.replace(/Equipamento|Tesouro/ig, '').split(',').map( m => m.replace('.','').trim());
				equipamentos.forEach( (equip) => {
					let itemSearch = [
						equip.match(/(?:[A-Za-z]+ ){2}[A-Za-z]+/)[0],
						equip.match(/(?:[A-Za-z]+ ){1}[A-Za-z]+/)[0],
						equip.match(/(?:[A-Za-z]+ ){0}[A-Za-z]+/)[0]
					];
					itemSearch.push(...itemSearch.map( m => m.replace(/(s|es)(\s|$)/g,' ').trim() ));
					let itemTemplate;
					let jaExiste = false;
					for (const itm of itemSearch ) {
						jaExiste = equip.find( i => i.name == itm );
						
						itemTemplate = game.items.find( f => f.name == itm.capitalize() && ['arma','equipamento','consumivel','tesouro'].includes[f.type] );
						if ( itemTemplate ) break;
						itemTemplate = game.packs.get("tormenta20.equipamentos").index.find(i => i.name == itm.capitalize() );
					}
					if ( jaExiste ) return;
					if ( !itemTemplate ) {
						itemTemplate = new game.tormenta20.entities.ItemT20({name: itm.capitalize(), type:'tesouro'});
					}
					if ( itemTemplate ) itemTemplate = itemTemplate.toObject();
					let qtd = equip.match(/x(?<qtd>\d+)/);
					if ( qtd ) itemTemplate.system.qtd = qtd.groups?.qtd || 1;
					itemTemplate.system.description.value = item + '<br>' + itemTemplate.system.description.value;
					delete itemTemplate._id;
					equip.item = itemTemplate;
				});
				
				items.push( ... equipamentos.map( m => m.item ) );
	
				msg += `Equipamentos Identificados: ${equipamentos.length}; `;
				msg += `(${equipamentos.map(m=> m.name).join(',')})`;
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

	async _updateObject(event, formData) {
		const data = expandObject(formData);
		// console .log(data);
		// await this.object._calcPVPM();
		return;
	}

}
