import React, { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Input, Popconfirm, Alert } from "antd";
import {getCategoriesBSCT, createCategoryBSCT, updateCategoryBSCT, deleteCategoryBSCT, } from "../../api/categoryBsctAPi"

const CategoryBSCTPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error" | "info"; message: string; description?: string } | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getCategoriesBSCT();
      setData(res.data);
    } catch {
      showAlert("error", "Lỗi tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Hàm hiển thị Alert trong 3 giây
  const showAlert = (type: "success" | "error" | "info", message: string, description?: string) => {
    setAlert({ type, message, description });
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  const handleSave = async (values: any) => {
    try {
      if (editingCategory) {
        await updateCategoryBSCT(editingCategory._id, values);
        showAlert("success", "Cập nhật danh mục thành công");
      } else {
        await createCategoryBSCT(values);
        showAlert("success", "Thêm danh mục thành công");
      }
      setModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
      fetchData();
    } catch {
      showAlert("error", "Lỗi khi lưu danh mục");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategoryBSCT(id);
      showAlert("success", "Xoá danh mục thành công");
      fetchData();
    } catch {
      showAlert("error", "Lỗi khi xoá danh mục");
    }
  };

  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setEditingCategory(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xoá?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger type="link">
              Xoá
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Alert động */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          description={alert.description}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={() => {
            setEditingCategory(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Thêm danh mục
        </Button>
      </Space>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
      />

      <Modal
        title={editingCategory ? "Cập nhật danh mục" : "Thêm danh mục"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="Lưu"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            label="Tên danh mục"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryBSCTPage;
