/* Class defined to hold game common formulas and stuff */

import { damageRoll } from "../dice";

class systemRules {
	
	getModifier(ability = {}){
		// original Math.floor((ability.value + Number(ability.bonus || 0) - 10) / 2);
		rollData = {};
		rollData['abl'] = ability.value + Number(ability.bonus || 0);
		let formula = 'floor( ( @abl - 10 ) / 2 )';
		formula = Roll.replaceFormulaData(formula, rollData);
		return Roll.safeEval(formula);
	}

	getTraining( level = 1 ){
		return (level > 14 ? 6 : (level > 6 ? 4 : 2));
	}

	/* MODIFICADORES
	* @pericias
	* @periciasRes 
	* @ataque @corpoacorpo @adistancia
	* @!ataque
	* @investida @flanque @altura
	* @manobraTamanho @periciasTamanho
	* @periciasFor @periciasDes @periciasCon
	* @periciasInt @periciasSab @periciasCar
	* @periciasFisicas @periciasMentais @periciasSociais
	* 
	* @dano @cura
	* @danocorpoacorpo @adistancia @danomagia @danoalquimia
	* 
	* @cd @cdmagia @cdClasse [@cdbarb]
	* @GolpeDivino @MarcaDaPresa @AtaqueEspecial
	*/
	getSkill( actor, skill = {}){
		rollData = actor.getRollData();
		rollData['halflevel'] = Math.floor( actor.system.attributes.nivel.value / 2 );
		rollData['training'] = actor.system.attributes.treino;
		rollData['abl'] = actor.system.atributos[skill.atributo]?.mod || 0;
		rollData['other'] = actor.system.atributos[skill.atributo]?.outros || 0;
		rollData['bonus'] = actor.system.atributos[skill.atributo]?.bonus || 0;
		modificador.pericia.geral
		rollData['mod'] = 1;
		rollData['armorpenalty'] = 1;
		let formula = '@halflevel + @training + @abl + @other + @bonus + @armorpenalty';
		formula = Roll.replaceFormulaData(formula, rollData);
		return Roll.safeEval(formula);
	}

	
	/* Skyfall Alternate rule to defense as a skill */
	getDefenseSkyfall( actor ){
		let training = (level > 14 ? 6 : (level > 6 ? 4 : 2));
		return training;
	}

	getDefense( actor ){
		rollData = actor.getRollData();
		let defense = actor.system.attributes.defesa;
		let armor = actor.items.find(i=> i.type === 'equipamento' && i.system.equipado && ['leve','pesada'].includes(i.system.tipo) );
		rollData['abl'] = armor.system.tipo == 'pesada' ? Math.max(0,rollData[defense.atributo]) : rollData[defense.atributo];
		rollData['armor'] = armor.system.armadura.value
		rollData['shield'] = 0;
		rollData['trinket'] = 0;
		rollData['other'] = 0;
		rollData['bonus'] = 0;
		let formula = '10 + @abl + @armor + @shield + @trinket + @other + @bonus';
		formula = Roll.replaceFormulaData(formula, rollData);
		return Roll.safeEval(formula);
	}

}