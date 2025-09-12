import React, { useLayoutEffect, useEffect, useState } from 'react';
import { Row, Col, Button, Form, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import CreateForm from '@/components/CreateForm';
import UpdateForm from '@/components/UpdateForm';
import DeleteModal from '@/components/DeleteModal';
import ReadItem from '@/components/ReadItem';
import SearchItem from '@/components/SearchItem';
import InteractionDataTable from '@/components/InteractionDataTable';
import TicketsDisplay from '@/components/TicketsDisplay';
import Loading from '@/components/Loading';

import { useDispatch, useSelector } from 'react-redux';

import { selectCurrentItem, selectCreatedItem, selectUpdatedItem } from '@/redux/crud/selectors';
import useLanguage from '@/locale/useLanguage';
import { crud } from '@/redux/crud/actions';
import { useCrudContext } from '@/context/crud';
import interactionStorage from '@/services/interactionStorage';

import { CrudLayout } from '@/layout';

function InteractionCreateForm({ config, formElements }) {
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);
  const [clientId, setClientId] = useState('');
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const translate = useLanguage();
  const { isLoading, isSuccess } = useSelector(selectCreatedItem);
  const { crudContextAction } = useCrudContext();
  const { panel, collapsedBox, readBox } = crudContextAction;
  let { entity } = config;
  
  const handleTicketSelect = (ticket) => {
    setSelectedTicketIds(prev => [...prev, ticket._id]);
  };

  const handleTicketDeselect = (ticketId) => {
    setSelectedTicketIds(prev => prev.filter(id => id !== ticketId));
  };

  const handleFormValuesChange = (changedValues, allValues) => {
    if (changedValues.client) {
      setClientId(changedValues.client);
    }
  };

  const onSubmit = (fieldsValue) => {
    const formDataWithTickets = {
      ...fieldsValue,
      ticketIds: selectedTicketIds
    };
    
    dispatch(crud.create({ entity, jsonData: formDataWithTickets }));
  };

  useEffect(() => {
    if (isSuccess) {
      readBox.open();
      collapsedBox.open();
      panel.open();
      form.resetFields();
      setSelectedTicketIds([]);
      setClientId('');
      dispatch(crud.resetAction({ actionType: 'create' }));
      dispatch(crud.list({ entity }));
    }
  }, [isSuccess]);

  return (
    <Row gutter={16} style={{ height: '70vh' }}>
      <Col span={12}>
        <Loading isLoading={isLoading}>
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={onSubmit}
            onValuesChange={handleFormValuesChange}
          >
            {formElements}
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {translate('Submit')}
              </Button>
            </Form.Item>
          </Form>
        </Loading>
      </Col>
      <Col span={12}>
        <TicketsDisplay
          selectedTicketIds={selectedTicketIds}
          onTicketSelect={handleTicketSelect}
          onTicketDeselect={handleTicketDeselect}
          clientId={clientId}
          height={500}
        />
      </Col>
    </Row>
  );
}

function InteractionUpdateForm({ config, formElements }) {
  const { result: currentItem } = useSelector(selectCurrentItem);
  const { isLoading, isSuccess } = useSelector(selectUpdatedItem);
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);
  const [clientId, setClientId] = useState('');
  const [isFormReady, setIsFormReady] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const translate = useLanguage();
  const { crudContextAction, state } = useCrudContext();
  const { editBox, readBox } = crudContextAction;
  const { isEditBoxOpen } = state;
  let { entity } = config;

  useEffect(() => {
    if (currentItem && isEditBoxOpen) {
      setSelectedTicketIds(currentItem.ticketIds || []);
      setClientId(currentItem.client || '');
      
      // Add small delay to ensure form is rendered before setting values
      setTimeout(() => {
        form.resetFields();
        form.setFieldsValue(currentItem);
      }, 100);
    }
  }, [currentItem, form, isEditBoxOpen]);

  const handleTicketSelect = (ticket) => {
    setSelectedTicketIds(prev => [...prev, ticket._id]);
  };

  const handleTicketDeselect = (ticketId) => {
    setSelectedTicketIds(prev => prev.filter(id => id !== ticketId));
  };

  const handleFormValuesChange = (changedValues, allValues) => {
    if (changedValues.client) {
      setClientId(changedValues.client);
    }
  };

  const onSubmit = (fieldsValue) => {
    const formDataWithTickets = {
      ...fieldsValue,
      ticketIds: selectedTicketIds
    };
    
    dispatch(crud.update({ entity, id: currentItem._id, jsonData: formDataWithTickets }));
  };

  useEffect(() => {
    if (isSuccess) {
      readBox.open();
      editBox.close();
      dispatch(crud.resetAction({ actionType: 'update' }));
      dispatch(crud.list({ entity }));
    }
  }, [isSuccess]);

  const show = isEditBoxOpen ? { display: 'block', opacity: 1 } : { display: 'none', opacity: 0 };
  
  return (
    <div style={show}>
      <Row gutter={16} style={{ height: '70vh' }}>
        <Col span={12}>
          <Loading isLoading={isLoading}>
            <Form 
              key={currentItem?._id}
              form={form} 
              layout="vertical" 
              onFinish={onSubmit}
              onValuesChange={handleFormValuesChange}
            >
              {React.cloneElement(formElements, { key: `form-${currentItem?._id}` })}
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  {translate('Update')}
                </Button>
              </Form.Item>
            </Form>
          </Loading>
        </Col>
        <Col span={12}>
          <TicketsDisplay
            selectedTicketIds={selectedTicketIds}
            onTicketSelect={handleTicketSelect}
            onTicketDeselect={handleTicketDeselect}
            clientId={clientId}
            height={500}
          />
        </Col>
      </Row>
    </div>
  );
}

function InteractionReadView({ config }) {
  const { result: currentItem } = useSelector(selectCurrentItem);
  const { state } = useCrudContext();
  const { isReadBoxOpen } = state;
  const translate = useLanguage();
  
  const show = isReadBoxOpen ? { display: 'block', opacity: 1 } : { display: 'none', opacity: 0 };
  
  if (!currentItem) return null;
  
  return (
    <div style={show}>
      <Row gutter={16}>
        <Col span={24}>
          <h3 style={{ marginBottom: '16px' }}>{currentItem.subject}</h3>
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginBottom: '12px' }}>
        <Col span={8}><strong>Type:</strong></Col>
        <Col span={16}>{currentItem.type}</Col>
      </Row>
      
      <Row gutter={16} style={{ marginBottom: '12px' }}>
        <Col span={8}><strong>Status:</strong></Col>
        <Col span={16}>{currentItem.status}</Col>
      </Row>
      
      <Row gutter={16} style={{ marginBottom: '12px' }}>
        <Col span={8}><strong>Priority:</strong></Col>
        <Col span={16}>{currentItem.priority}</Col>
      </Row>
      
      <Row gutter={16} style={{ marginBottom: '12px' }}>
        <Col span={8}><strong>Description:</strong></Col>
        <Col span={16}>{currentItem.description}</Col>
      </Row>
      
      {currentItem.notes && (
        <Row gutter={16} style={{ marginBottom: '12px' }}>
          <Col span={8}><strong>Notes:</strong></Col>
          <Col span={16}>{currentItem.notes}</Col>
        </Row>
      )}
      
      <Row gutter={16} style={{ marginBottom: '12px' }}>
        <Col span={8}><strong>Tickets:</strong></Col>
        <Col span={16}>{currentItem.ticketIds?.length || 0} tickets attached</Col>
      </Row>
      
      {currentItem.ticketIds && currentItem.ticketIds.length > 0 && (
        <Row gutter={16} style={{ marginTop: '16px' }}>
          <Col span={24}>
            <TicketsDisplay 
              selectedTicketIds={currentItem.ticketIds}
              readOnly={true}
              height={300}
            />
          </Col>
        </Row>
      )}
    </div>
  );
}

function SidePanelTopContent({ config, formElements, withUpload }) {
  const translate = useLanguage();
  const { crudContextAction, state } = useCrudContext();
  const { deleteModalLabels } = config;
  const { modal, editBox } = crudContextAction;

  const { isReadBoxOpen, isEditBoxOpen } = state;
  const { result: currentItem } = useSelector(selectCurrentItem);
  const dispatch = useDispatch();

  const [labels, setLabels] = useState('');
  useEffect(() => {
    if (currentItem) {
      const currentlabels = deleteModalLabels.map((x) => currentItem[x]).join(' ');
      setLabels(currentlabels);
    }
  }, [currentItem]);

  const removeItem = () => {
    dispatch(crud.currentAction({ actionType: 'delete', data: currentItem }));
    modal.open();
  };
  
  const editItem = () => {
    dispatch(crud.currentAction({ actionType: 'update', data: currentItem }));
    editBox.open();
  };

  const show = isReadBoxOpen || isEditBoxOpen ? { opacity: 1 } : { opacity: 0 };
  
  return (
    <>
      <Row style={show} gutter={(24, 24)}>
        <Col span={10}>
          <p style={{ marginBottom: '10px' }}>{labels}</p>
        </Col>
        <Col span={14}>
          <Button
            onClick={removeItem}
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            style={{ float: 'right', marginLeft: '5px', marginTop: '10px' }}
          >
            {translate('remove')}
          </Button>
          <Button
            onClick={editItem}
            type="text"
            icon={<EditOutlined />}
            size="small"
            style={{ float: 'right', marginLeft: '0px', marginTop: '10px' }}
          >
            {translate('edit')}
          </Button>
        </Col>

        <Col span={24}>
          <div className="line"></div>
        </Col>
        <div className="space10"></div>
      </Row>
      <InteractionReadView config={config} />
      <InteractionUpdateForm config={config} formElements={formElements} withUpload={withUpload} />
    </>
  );
}

function FixHeaderPanel({ config }) {
  const { crudContextAction } = useCrudContext();
  const { collapsedBox, panel } = crudContextAction;
  const translate = useLanguage();

  const addNewItem = () => {
    collapsedBox.close();
    panel.open();
  };

  return (
    <Row gutter={8}>
      <Col className="gutter-row" span={18}>
        <SearchItem config={config} />
      </Col>
      <Col className="gutter-row" span={6}>
        <Button 
          onClick={addNewItem} 
          type="primary"
          block={true} 
          icon={<PlusOutlined />}
        >
          Add New
        </Button>
      </Col>
    </Row>
  );
}

function InteractionModule({ config, createForm, updateForm, withUpload = false }) {
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    dispatch(crud.resetState());
  }, []);

  return (
    <CrudLayout
      config={config}
      sidePanelBottomContent={
        <InteractionCreateForm config={config} formElements={createForm} withUpload={withUpload} />
      }
      sidePanelTopContent={
        <SidePanelTopContent config={config} formElements={updateForm} withUpload={withUpload} />
      }
    >
      <div style={{ marginBottom: '16px' }}>
        <FixHeaderPanel config={config} />
      </div>
      <InteractionDataTable config={config} />
      <DeleteModal config={config} />
    </CrudLayout>
  );
}

export default InteractionModule;