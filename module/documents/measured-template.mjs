/**
 * The client-side MeasuredTemplate document which extends the common BaseMeasuredTemplate document model.
 * @extends foundry.documents.BaseMeasuredTemplate
 * @mixes ClientDocumentMixin
 *
 * @see {@link Scene}                     The Scene document type which contains MeasuredTemplate documents
 * @see {@link MeasuredTemplateConfig}    The MeasuredTemplate configuration application
 */
export default class Tormenta20MeasuredTemplateDocument extends MeasuredTemplateDocument
{

  /* -------------------------------------------- */
  /*  Model Properties                            */
  /* -------------------------------------------- */
	
	/** @inheritDoc */
	_onUpdate(data, options, userId) {
		super._onUpdate(data, options, userId);
		this.object.refresh();
	}
}
