import { useState, useEffect } from 'react';
import { Card, List, Tag, Input, Button, Space, Typography, Badge, Empty, Spin } from 'antd';
import { SearchOutlined, ReloadOutlined, LinkOutlined, DisconnectOutlined } from '@ant-design/icons';
import appwriteTickets from '@/request/appwriteTickets';
import useLanguage from '@/locale/useLanguage';

const { Title, Text } = Typography;
const { Search } = Input;

const getStatusColor = (status) => {
  const colors = {
    'open': 'blue',
    'in-progress': 'orange',
    'resolved': 'green',
    'closed': 'default',
    'pending': 'purple',
    'New': 'blue',
    'Awaiting Customer Response': 'orange',
    'In Progress': 'orange',
    'Completed': 'green',
    'On Hold': 'red'
  };
  return colors[status] || 'default';
};

const getPriorityColor = (priority) => {
  const colors = {
    'low': 'green',
    'medium': 'orange',
    'high': 'red',
    'urgent': 'magenta'
  };
  return colors[priority] || 'default';
};

export default function TicketsDisplay({ 
  selectedTicketIds = [], 
  onTicketSelect, 
  onTicketDeselect,
  clientId = '',
  height = 400,
  readOnly = false
}) {
  const translate = useLanguage();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTickets, setFilteredTickets] = useState([]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await appwriteTickets.list({
        options: {
          items: 100,
          search: searchTerm,
          clientId: clientId
        }
      });
      
      if (response.success) {
        setTickets(response.result);
        setFilteredTickets(response.result);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []); // Remove clientId dependency since we're not using it for filtering yet

  useEffect(() => {
    if (!searchTerm) {
      setFilteredTickets(tickets);
    } else {
      const filtered = tickets.filter(ticket => 
        ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.workflow?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTickets(filtered);
    }
  }, [searchTerm, tickets]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleTicketToggle = (ticket) => {
    const ticketId = ticket._id || ticket.$id || ticket.id;
    const isSelected = selectedTicketIds.includes(ticketId);
    
    if (isSelected) {
      onTicketDeselect && onTicketDeselect(ticketId);
    } else {
      onTicketSelect && onTicketSelect({ ...ticket, _id: ticketId });
    }
  };

  const renderTicketItem = (ticket) => {
    const ticketId = ticket._id || ticket.$id || ticket.id;
    const isSelected = selectedTicketIds.includes(ticketId);
    
    // Now using the transformed data fields
    const displayTitle = ticket.title || 'No Title';
    const displayTicketNumber = ticket.ticketNumber;
    const displayStatus = ticket.status || 'open';
    const displayCustomer = ticket.clientName || '';
    
    return (
      <List.Item
        key={ticketId}
        style={{
          backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
          border: isSelected ? '1px solid #1890ff' : '1px solid #f0f0f0',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '8px',
          cursor: readOnly ? 'default' : 'pointer'
        }}
        onClick={() => !readOnly && handleTicketToggle(ticket)}
        actions={readOnly ? [] : [
          <Button
            size="small"
            type={isSelected ? "primary" : "default"}
            icon={isSelected ? <DisconnectOutlined /> : <LinkOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleTicketToggle(ticket);
            }}
          >
            {isSelected ? 'Unlink' : 'Link'}
          </Button>
        ]}
      >
        <List.Item.Meta
          title={
            <Space>
              <Text strong style={{ fontSize: '14px' }}>{displayTitle}</Text>
              {displayTicketNumber && <Text type="secondary" style={{ fontSize: '12px' }}>#{displayTicketNumber.slice(-8)}</Text>}
            </Space>
          }
          description={
            <div>
              <Text ellipsis style={{ marginBottom: '4px', display: 'block', fontSize: '12px' }}>
                {ticket.description || 'No description'}
              </Text>
              <Space wrap>
                <Tag color={getStatusColor(displayStatus)} size="small">
                  {displayStatus}
                </Tag>
                {displayCustomer && (
                  <Tag color="blue" size="small">{displayCustomer}</Tag>
                )}
                {ticket.assignee_ids && ticket.assignee_ids.length > 0 && (
                  <Tag color="green" size="small">
                    {ticket.assignee_ids.length} assigned
                  </Tag>
                )}
                {ticket.total_hours > 0 && (
                  <Tag color="orange" size="small">
                    {ticket.total_hours}h
                  </Tag>
                )}
              </Space>
            </div>
          }
        />
      </List.Item>
    );
  };

  return (
    <Card
      title={
        <Space>
          <Title level={5} style={{ margin: 0 }}>
            {translate('tickets')} 
          </Title>
          <Badge count={selectedTicketIds.length} showZero />
        </Space>
      }
      extra={
        !readOnly && (
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchTickets}
            size="small"
            loading={loading}
          />
        )
      }
      style={{ height: '100%' }}
      styles={{ 
        body: {
          padding: '12px',
          height: height - 60,
          overflow: 'hidden'
        }
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {!readOnly && (
          <Search
            placeholder={translate('search_tickets')}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            style={{ marginBottom: '12px' }}
            prefix={<SearchOutlined />}
          />
        )}

        <div style={{ 
          height: height - 160, 
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin />
            </div>
          ) : filteredTickets.length === 0 ? (
            <Empty 
              description={searchTerm ? translate('no_tickets_found') : translate('no_tickets_available')}
              style={{ marginTop: '20px' }}
            />
          ) : (
            <List
              dataSource={filteredTickets}
              renderItem={renderTicketItem}
              split={false}
              style={{ marginTop: '8px' }}
            />
          )}
        </div>
      </Space>
    </Card>
  );
}