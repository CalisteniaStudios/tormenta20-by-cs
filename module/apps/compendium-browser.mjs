export default class CompendiumBrowser extends FormApplication {
	
	constructor(object={}, options={}) {
		super(object, options);

		const packs = game.packs.filter( p => p.documentName == "Item");
		for (const p of packs ) {
			p.getIndex();
		}
		this.object.packs = packs;
	}
	// pack = game.packs.get('tormenta20.poderes')
	// await pack.getIndex();
	// pack.index.filter( f => f.system.tags.includes('Mana') )
	getData(){
		const sheetData = super.getData();
		sheetData.filters = {
			name: "",
			itemType: [],
			tags: [],

		}
	}
}

function itemKeysList() {
	arrSchemas = []
	Item.TYPES.forEach( t => {
		i = new Item.implementation({type:t,name:'temp'})
		arrSchemas.push( foundry.utils.flattenObject(i.system.toObject()) );
	})
	arrKeys = [];
	arrSchemas.map( m=> Object.keys(m)).forEach(f=>{
		arrKeys.push(...f);
	})
	arrKeys = [...new Set(arrKeys)];
	arrKeys.join("|");
}

function actorKeysList() {
	arrSchemas = []
	Actor.TYPES.forEach( t => {
		i = new Actor.implementation({type:t,name:'temp'})
		arrSchemas.push( foundry.utils.flattenObject(i.system.toObject()) );
	})
	arrKeys = [];
	arrSchemas.map( m=> Object.keys(m)).forEach(f=>{
		arrKeys.push(...f);
	})
	arrKeys = [...new Set(arrKeys)];
	arrKeys.join("|");
}

const _itemKeysList = {
  "system.description.value": "Descrição",
  "system.description.chat": "Descrição Chat [Não Implementado]",
  "system.description.unidentified": "Descrição Não Identificado [Não Implementado]",
  "system.source": "Livro de Origem",
  "system.equipado": "Equipado",
  "system.carregado": "Carregado",
  "system.peso": "Peso [Deprecated]",
  "system.espacos": "Espaços",
  "system.qtd": "Quantidade",
  "system.preco": "Preço",
  "system.pv.value": "Pontos de Vida [Não Implementado]",
  "system.pv.min": "Pontos de Vida Min [Não Implementado]",
  "system.pv.max": "Pontos de Vida Max [Não Implementado]",
  "system.rd": "Redução de Dano",
  "system.rolls": "Rolagens",
  "system.criticoM": "Margem de Crítico",
  "system.criticoX": "Multiplicador de Crítico",
  "system.alcance": "Alcance",
  "system.tipoUso": "Tipo",
  "system.propriedades.ada": "Adaptável",
  "system.propriedades.agi": "Ágil",
  "system.propriedades.alo": "Alongda",
  "system.propriedades.arr": "Arremesso",
  "system.propriedades.dst": "A Distância",
  "system.propriedades.dms": "Duas Mãos",
  "system.propriedades.dup": "Dupla",
  "system.propriedades.lev": "Leve",
  "system.propriedades.mun": "Disparo",
  "system.propriedades.ver": "Versátil",
  "system.origin": "Origem [Não Implementado]",
  "system.tags": "Tags",
  "system.chatFlavor": "Personalização da Menssagem do Chat",
  "system.ativacao.custo": "Custo",
  "system.ativacao.execucao": "Execução",
  "system.ativacao.qtd": "Execução Quantidade",
  "system.ativacao.condicao": "Condição de Execução",
  "system.ativacao.special": "Execução Personalizado",
  "system.consume.amount": "Consumir Quantidade",
  "system.consume.mpMultiplier": "Consumir Quantidade Multiplicador",
  "system.consume.type": "Consumir Tipo",
  "system.consume.target": "Consumir Recurso",
  "system.size": "Tamanho",
  "system.melhorias": "Melhorias Superiores",
  "system.encantos": "Encantos",
  "system.tipo": "Tipo",
  "system.armadura.value": "Defesa",
  "system.armadura.penalidade": "Penalidade de Armadura",
  "system.armadura.maxAtr": "Defesa Bônus Máximo de Atributo",
  "system.niveis": "Nível",
  "system.pvPorNivel": "PV por Nível",
  "system.pmPorNivel": "PM por Nível",
  "system.inicial": "Inicial",
  "system.pericias.numero": "Perícias de Classe [Não Implementado]",
  "system.pericias.inatas": "Perícias de Classe [Não Implementado]",
  "system.pericias.escolhas": "Perícias de Classe [Não Implementado]",
  "system.pericias.value": "Perícias de Classe [Não Implementado]",
  "system.duracao.value": "Duração",
  "system.duracao.units": "Duração Unidades",
  "system.duracao.special": "Duração Personalizado",
  "system.target.value": "Alvo [Não Implementado]",
  "system.target.width": "Alvo Largura? [Não Implementado]",
  "system.target.type": "Alvo Tipo [Não Implementado]",
  "system.range.value": "Alcance Valor (m|km)",
  "system.range.units": "Alcance Unidade [Não Implementado]",
  "system.efeito": "Efeito",
  "system.alvo": "Alvo",
  "system.area": "Área de Efeito",
  "system.resistencia.pericia": "Resistência Perícia",
  "system.resistencia.atributo": "Resistência Atributo da CD",
  "system.resistencia.bonus": "Resistência Bõnus da CD",
  "system.resistencia.txt": "Resistência",
  "system.uses.autoDestroy": "Auto apagar ao Esgotar [Não Implementado]",
  "system.subtipo": "Subtipo",
  "system.circulo": "Círculo",
  "system.preparada": "Preparada",
  "system.escola": "Escola",
  "system.container": "Recipiente",
  "system.proficiencia": "Proficiência",
  "system.proposito": "Propósito",
  "system.empunhadura": "Empunhadura"
}

/** 
 * @param <String> search        Field Path to be found ie: "systemActorCharacterData.atributos.car"
 * @param <Object> systemField   Document system.schema Object
 */
function findFieldPath(search, dataField){
	if ( search.split('.')[0] !== dataField.fieldPath.split('.')[0] ) return false;
	if ( dataField.fieldPath == search ) {
		return dataField;
	} else if ( dataField.fields ) {
		for (let field of Object.values(dataField.fields) ) {
			const found = findFieldPath( search, field );
			if ( found ) return found;
		}
	}
	return false;
}

Actor.implementation({type:'character',name:'temp'});
function getDocumentSystemList(document){
  const charKeys = Object.keys(foundry.utils.flattenObject(document.system.toObject()))
  let charKeyLabel = {}

  for (let key of charKeys) {
    let field = findFieldPath( [document.system.schema.fieldPath, key].join('.'), document.system.schema )
    if ( !field ) continue;
    fieldPath = field.fieldPath.split('.');
    fieldPath[0] = 'system'
    fieldPath = fieldPath.join('.');
    charKeyLabel[ fieldPath ] = field.label;
  }
  return charKeyLabel;
}
