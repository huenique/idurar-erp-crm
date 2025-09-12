// Service to handle interaction data storage using client entity as storage mechanism

export const interactionStorage = {
  // Transform interaction data to taxes entity format for storage
  toTaxesEntity: (interactionData) => {
    return {
      name: interactionData.subject || '',
      description: interactionData.description || '',
      value: interactionData.type || 'call',
      client: interactionData.client || '',
      status: interactionData.interactionStatus || 'completed',
      notes: JSON.stringify({
        additionalNotes: interactionData.notes || '',
        ticketIds: interactionData.ticketIds || [],
        date: interactionData.date || new Date().toISOString(),
        duration: interactionData.duration || 0,
        isInteraction: true, // Flag to identify this as interaction data
        originalData: interactionData
      })
    };
  },

  // Transform taxes entity data back to interaction format for display
  fromTaxesEntity: (taxesData) => {
    let extraData = {};
    
    try {
      extraData = JSON.parse(taxesData.notes || '{}');
    } catch (e) {
      extraData = { additionalNotes: taxesData.notes || '', ticketIds: [], isInteraction: false };
    }

    // Only return as interaction if it was originally stored as one
    if (!extraData.isInteraction) {
      return null;
    }

    return {
      _id: taxesData._id,
      subject: taxesData.name || '',
      description: taxesData.description || '',
      type: taxesData.value || 'call',
      client: taxesData.client || '',
      interactionStatus: taxesData.status || 'completed',
      notes: extraData.additionalNotes || '',
      ticketIds: extraData.ticketIds || [],
      date: extraData.date || taxesData.created,
      duration: extraData.duration || 0,
      created: taxesData.created,
      updated: taxesData.updated,
      enabled: taxesData.enabled
    };
  },

  // Filter taxes data to only show interactions
  filterInteractions: (taxesList) => {
    return taxesList
      .map(taxes => interactionStorage.fromTaxesEntity(taxes))
      .filter(interaction => interaction !== null);
  },

  // Transform interaction form data for submission
  prepareForSubmission: (formData) => {
    const interactionData = {
      subject: formData.name,
      description: formData.description,
      type: formData.value,
      client: formData.client,
      interactionStatus: formData.status,
      notes: formData.notes,
      ticketIds: formData.ticketIds || [],
      date: new Date().toISOString()
    };

    return interactionStorage.toTaxesEntity(interactionData);
  }
};

export default interactionStorage;