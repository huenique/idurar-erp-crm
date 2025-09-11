// Simple task/todo fields for interaction tracking
export const fields = {
  // Temporarily disable date field to fix crash
  // date: {
  //   type: 'date',
  //   required: true,
  // },
  type: {
    type: 'select',
    options: [
      { value: 'task', label: 'Task' },
      { value: 'follow-up', label: 'Follow-up' },
      { value: 'call', label: 'Phone Call' },
      { value: 'email', label: 'Email' },
      { value: 'meeting', label: 'Meeting' },
      { value: 'support', label: 'Support' },
      { value: 'other', label: 'Other' }
    ],
    required: true,
  },
  subject: {
    type: 'string',
    required: true,
  },
  description: {
    type: 'textarea',
    required: true,
  },
  status: {
    type: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' }
    ],
    required: true,
  },
  priority: {
    type: 'select',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' }
    ],
    required: true,
  },
  notes: {
    type: 'textarea',
  },
  ticketIds: {
    type: 'array',
    disableForForm: true,
  },
  created: {
    type: 'string',
    disableForForm: true,
  },
  updated: {
    type: 'string',
    disableForForm: true,
  },
};

export const readColumns = [
  {
    title: 'Subject',
    dataIndex: 'subject',
  },
  {
    title: 'Type',
    dataIndex: 'type',
  },
  {
    title: 'Status',
    dataIndex: 'status',
  },
  {
    title: 'Priority', 
    dataIndex: 'priority',
  },
  {
    title: 'Description',
    dataIndex: 'description',
  },
  {
    title: 'Notes',
    dataIndex: 'notes',
  },
  {
    title: 'Number of Tickets',
    dataIndex: 'ticketIds',
    render: (value) => (value && value.length) || 0,
  },
  {
    title: 'Created',
    dataIndex: 'created',
    isDate: true,
  },
  {
    title: 'Updated', 
    dataIndex: 'updated',
    isDate: true,
  },
];