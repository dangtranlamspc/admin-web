import { useEffect, useState } from 'react';
import { Button, Input, Space, Table, Upload, Modal, Form, Select, message, Popconfirm } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { User } from '../../types/user'
import { userApi } from '../../api/usersApi'

export default function UserList() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    // setLoading(true);
    // try {
    //   const res = await userApi.getAll({ search });
    //   setData(res.data);
    // } finally {
    //   setLoading(false);
    // }
    setLoading(true);
    try {
      const data = await userApi.getAll({ search });
      setData(data);
    } catch (err) {
      message.error("Lỗi tải danh sách người dùng");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleDelete = async (id: string) => {
    await userApi.delete(id);
    message.success('Đã xóa user');
    fetchData();
  };

  const handleSave = async (values: any) => {
    // const formData = new FormData();
    // formData.append('name', values.name);
    // formData.append('email', values.email);
    // formData.append('password', values.password);
    // if (values.avatar?.file) {
    //   formData.append('avatar', values.avatar.file.originFileObj);
    // }

    if (editingUser) {
      if (!values.password) {
        delete values.password
      }
      await userApi.update(editingUser._id, values);
      message.success('Cập nhật user thành công');
    } else {
      await userApi.create(values);
      message.success('Thêm user thành công');
    }
    setModalOpen(false);
    fetchData();
  };

  const columns: ColumnsType<User> = [
    // {
    //   title: 'Avatar',
    //   dataIndex: 'avatar',
    //   render: (avatar) =>
    //     avatar ? <img src={avatar} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} /> : null,
    // },
    { title: 'Tên', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (role, record) => (
        <Select
          value={role}
          onChange={async (newRole) => {
            await userApi.update(record._id, { role: newRole }); // JSON object
            message.success('Đổi role thành công');
            fetchData();
          }}
          style={{ width: 120 }}
        >
          <Select.Option value="admin">Admin</Select.Option>
          <Select.Option value="user">User</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Hành động',
      render: (_, record) => (
        <Space>
          <Button
            onClick={() => {
              setEditingUser(record);
              form.setFieldsValue(record);
              setModalOpen(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm title="Xóa user này?" onConfirm={() => handleDelete(record._id)}>
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search placeholder="Tìm user..." onSearch={setSearch} enterButton />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingUser(null); form.resetFields(); setModalOpen(true); }}>
          Thêm User
        </Button>
      </Space>

      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={data}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
      />

      <Modal
        title={editingUser ? 'Sửa User' : 'Thêm User'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {/* <Form.Item name="password" label="Password">
            <Input />
          </Form.Item> */}
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="user">User</Select.Option>
            </Select>
          </Form.Item>
          {/* <Form.Item name="avatar" label="Avatar">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item> */}
        </Form>
      </Modal>
    </div>
  );
}