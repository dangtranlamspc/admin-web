import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Upload,
  Space,
  Image,
  message,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { sliderApi } from "../../api/sliderApi";

const SliderPage: React.FC = () => {
  const [sliders, setSliders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSlider, setEditingSlider] = useState<any>(null);
  const [form] = Form.useForm();
  const [uploadFileList, setUploadFileList] = useState<any[]>([]);

  const fetchSliders = async () => {
    setLoading(true);
    try {
      const res = await sliderApi.getAll();
      setSliders(res.data);
    } catch (err) {
      message.error("Lỗi khi tải slider");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const handleSubmit = async (values: any) => {
    const formData = new FormData();
    formData.append("title", values.title);

    if (uploadFileList.length > 0) {
      formData.append("image", uploadFileList[0].originFileObj);
    }

    try {
      if (editingSlider) {
        await sliderApi.update(editingSlider._id, formData);
        message.success("Cập nhật slider thành công");
      } else {
        await sliderApi.create(formData);
        message.success("Tạo slider thành công");
      }
      setModalVisible(false);
      form.resetFields();
      setUploadFileList([]);
      setEditingSlider(null);
      fetchSliders();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi khi lưu slider");
    }
  };

  const handleEdit = (record: any) => {
    setEditingSlider(record);
    form.setFieldsValue({ title: record.title });
    if (record.image) {
        setUploadFileList([
            {
                uid : "-1",
                name : "current-image.jpg",
                status: "done",
                url : record.image,
            },
        ]);
    }else {
        setUploadFileList([]);
    }
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Xác nhận xoá slider?",
      onOk: async () => {
        try {
          await sliderApi.delete(id);
          message.success("Xoá thành công");
          fetchSliders();
        } catch {
          message.error("Lỗi khi xoá slider");
        }
      },
    });
  };

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          setEditingSlider(null);
          form.resetFields();
          setUploadFileList([]);
          setModalVisible(true);
        }}
      >
        Thêm Slider
      </Button>

      <Table
        style={{ marginTop: 16 }}
        rowKey="_id"
        loading={loading}
        dataSource={sliders}
        columns={[
          { title: "Tiêu đề", dataIndex: "title" },
          {
            title: "Hình ảnh",
            dataIndex: "image",
            render: (img) => <Image width={100} src={img} />,
          },
          {
            title: "Hành động",
            render: (record) => (
              <Space>
                <Button onClick={() => handleEdit(record)}>Sửa</Button>
                <Button danger onClick={() => handleDelete(record._id)}>
                  Xoá
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        open={modalVisible}
        title={editingSlider ? "Cập nhật Slider" : "Tạo Slider"}
        onCancel={() => {
          setModalVisible(false);
          setEditingSlider(null);
          form.resetFields();
          setUploadFileList([]);
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: "Nhập tiêu đề slider" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Hình ảnh">
            <Upload
              listType="picture"
              beforeUpload={() => false}
              fileList={uploadFileList}
              onChange={({ fileList }) => setUploadFileList(fileList)}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button htmlType="submit" type="primary" loading={loading}>
                {editingSlider ? "Cập nhật" : "Tạo"}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setUploadFileList([]);
                  setEditingSlider(null);
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SliderPage;
