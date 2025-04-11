

export default class Tormenta20DataModel extends foundry.abstract.DataModel {
	
	get document () {
		let parent = this.parent;
		while ( parent ) {
			if ( parent.documentName ) break;
			parent = parent.parent;
		}
		return parent;
	}

	get getDataFields(){
		const data = this;
		const schema = data.schema;
		const dataFields = foundry.utils.flattenObject(data.toObject());
		
		for (const fieldPath of Object.keys(dataFields)) {
			dataFields[fieldPath] = schema.getField(fieldPath);
			if ( dataFields[fieldPath].hasOwnProperty('fieldPath') ) continue;
			
		}
		
		return foundry.utils.expandObject(dataFields);
	}
	
}