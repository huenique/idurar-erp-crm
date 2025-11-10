import { Card, Descriptions, Divider, Tag, Space, Typography } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function CustomerReadItem({ config, selectedItem }) {
  if (!selectedItem) {
    return (
      <Card>
        <Title level={4}>Customer not found</Title>
      </Card>
    );
  }

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return dayjs(date).format('DD/MM/YYYY HH:mm');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div>
            <Title level={2}>
              <UserOutlined /> {selectedItem.name || 'Unnamed Customer'}
            </Title>
            <div style={{ marginTop: '8px' }}>
              <Tag color="blue">Customer ID: {selectedItem._id}</Tag>
              {selectedItem.abn && <Tag color="green">ABN: {selectedItem.abn}</Tag>}
            </div>
          </div>

          <Divider />

          {/* Contact Information */}
          <div>
            <Title level={4}>Contact Information</Title>
            <Descriptions bordered column={1}>
              <Descriptions.Item
                label={<><UserOutlined /> Contact Person</>}
              >
                {selectedItem.contact || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item
                label={<><PhoneOutlined /> Phone</>}
              >
                {selectedItem.phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item
                label={<><MailOutlined /> Email</>}
              >
                {selectedItem.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item
                label={<><HomeOutlined /> Address</>}
              >
                {selectedItem.address || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </div>

          <Divider />

          {/* Business Information */}
          <div>
            <Title level={4}>Business Information</Title>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="ABN">
                {selectedItem.abn || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {formatDate(selectedItem.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Last Modified">
                {formatDate(selectedItem.updatedAt || selectedItem.modified)}
              </Descriptions.Item>
            </Descriptions>
          </div>

          {/* Related Records Section - Placeholder for future implementation */}
          <Divider />
          <div>
            <Title level={4}>Related Records</Title>
            <Card style={{ marginTop: '16px', textAlign: 'center', color: '#999' }}>
              <p>Related invoices, quotes, and tickets will appear here</p>
            </Card>
          </div>
        </Space>
      </Card>
    </div>
  );
}
