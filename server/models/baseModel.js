class BaseModel {
  constructor(schemaName = "dc-bot") {
    this.schemaName = schemaName;
  }

  /**
   * Executes a query with the schema name set.
   * @param {Object} transaction - The pg-promise transaction object.
   */
  async setSchema(transaction) {
    await transaction.none(`SET search_path TO "${this.schemaName}"`);
  }
}

export default BaseModel;