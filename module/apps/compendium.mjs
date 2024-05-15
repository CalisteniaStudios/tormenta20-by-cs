/**
 * An interface for displaying the content of a CompendiumCollection.
 * @extends {Application}
 * @param {CompendiumCollection} collection  The {@link CompendiumCollection} object represented by this interface.
 * @param {ApplicationOptions} [options]     Application configuration options.
 */
export default class CompendiumT20 extends Compendium {
	constructor(collection, options) {
    super(collection, options);

		if ( options.query ) {
			this.query = options.query;
		}

  }

	/* inheritDoc */
	async getData(options={}) {
		const context = await super.getData();
		if ( this.query ) {
			const queryKey = Object.entries(this.query)[0][0];
			const queryVal = Object.entries(this.query)[0][1];
			context.index = context.index.filter(i => foundry.utils.getProperty(i, queryKey) == queryVal);
		}
		return context;
	}
}