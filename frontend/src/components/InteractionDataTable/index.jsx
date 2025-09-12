import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Tag, Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { crud } from '@/redux/crud/actions';
import { selectListItems } from '@/redux/crud/selectors';
import { useCrudContext } from '@/context/crud';
import interactionStorage from '@/services/interactionStorage';
import useLanguage from '@/locale/useLanguage';

const getStatusColor = (status) => {
  const colors = {
    'pending': 'orange',
    'in-progress': 'blue',
    'completed': 'green'
  };
  return colors[status] || 'default';
};

const getTypeColor = (type) => {
  const colors = {
    'task': 'blue',
    'follow-up': 'green',
    'call': 'purple',
    'email': 'cyan',
    'meeting': 'magenta',
    'support': 'orange',
    'other': 'default'
  };
  return colors[type] || 'default';
};

export default function InteractionDataTable({ config }) {
  const translate = useLanguage();
  const dispatch = useDispatch();
  const { crudContextAction } = useCrudContext();
  const { panel, editBox, readBox, collapsedBox, modal } = crudContextAction;
  
  const { result: listResult, isLoading } = useSelector(selectListItems);
  const [interactions, setInteractions] = useState([]);

  // Use interaction data directly from API
  useEffect(() => {
    if (listResult && listResult.items && Array.isArray(listResult.items)) {
      setInteractions(listResult.items);
    } else if (listResult && Array.isArray(listResult)) {
      setInteractions(listResult);
    } else {
      setInteractions([]);
    }
  }, [listResult]);

  // Fetch data on mount
  useEffect(() => {
    dispatch(crud.list({ entity: config.entity }));
  }, [config.entity, dispatch]);

  const handleRead = (record) => {
    dispatch(crud.currentItem({ data: record }));
    dispatch(crud.currentAction({ actionType: 'read', data: record }));
    panel.open();
    collapsedBox.open();
    readBox.open();
  };

  const handleEdit = (record) => {
    dispatch(crud.currentItem({ data: record }));
    dispatch(crud.currentAction({ actionType: 'read', data: record }));
    panel.open();
    collapsedBox.open();
    readBox.open();
    
    // Small delay then switch to edit mode (simulates view->edit flow)
    setTimeout(() => {
      dispatch(crud.currentAction({ actionType: 'update', data: record }));
      editBox.open();
    }, 100);
  };

  const handleDelete = (record) => {
    dispatch(crud.currentAction({ actionType: 'delete', data: record }));
    modal.open();
  };

  const columns = [
    {
      title: translate('Subject'),
      dataIndex: 'subject',
      key: 'subject',
      render: (text) => <span>{text || '-'}</span>,
    },
    {
      title: translate('Type'),
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={getTypeColor(type)}>
          {type || 'other'}
        </Tag>
      ),
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status || 'completed'}
        </Tag>
      ),
    },
    {
      title: translate('Priority'),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colors = {
          'low': 'green',
          'medium': 'orange',
          'high': 'red'
        };
        return (
          <Tag color={colors[priority] || 'default'}>
            {priority || 'medium'}
          </Tag>
        );
      },
    },
    {
      title: translate('Tickets'),
      dataIndex: 'ticketIds',
      key: 'ticketIds',
      render: (ticketIds) => (
        <Tag color="blue">
          {(ticketIds && ticketIds.length) || 0} tickets
        </Tag>
      ),
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleRead(record)}
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={interactions}
        rowKey="_id"
        loading={isLoading}
        locale={{
          emptyText: interactions.length === 0 && !isLoading 
            ? 'No interactions found. Create your first interaction to get started!'
            : 'No data'
        }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            total > 0 ? `${range[0]}-${range[1]} of ${total} interactions` : '0 interactions',
        }}
      />
    </div>
  );
}