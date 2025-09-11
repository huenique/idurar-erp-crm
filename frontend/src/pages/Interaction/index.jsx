import InteractionModule from '@/modules/InteractionModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields, readColumns } from './config';

import useLanguage from '@/locale/useLanguage';

export default function Interaction() {
  const translate = useLanguage();
  const entity = 'interaction';
  const searchConfig = {
    displayLabels: ['subject', 'status'],
    searchFields: 'subject,description',
  };
  const deleteModalLabels = ['subject'];

  const Labels = {
    PANEL_TITLE: translate('interaction'),
    DATATABLE_TITLE: translate('interaction_list'),
    ADD_NEW_ENTITY: translate('add_new_interaction'),
    ENTITY_NAME: translate('interaction'),
  };
  
  const configPage = {
    entity,
    ...Labels,
  };
  
  const config = {
    ...configPage,
    fields,
    readColumns,
    searchConfig,
    deleteModalLabels,
  };
  
  
  return (
    <InteractionModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} />}
      config={config}
    />
  );
}