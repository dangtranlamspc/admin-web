// src/pages/BlogAdmin.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Table, Button, Modal, Form, Input, Select, Upload, Space,
  Popconfirm, message, Row, Col, Alert, Descriptions,
  Switch
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { PlusOutlined, EditOutlined, EyeOutlined, UploadOutlined } from "@ant-design/icons";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {getListTinTuc, createListTinTuc, updateListTinTuc, deleteListTinTuc, getListTinTucById, getCategoriesTinTuc} from "../../api/tintuc/tintucApi"

const DEFAULT_PAGE_SIZE = 10;

export interface User {
  _id: string,
  email: string,
}

export interface CategoriesTinTuc {
  _id: string;
  name: string;
}

export interface TinTuc {
  _id?: string;
  title: string;
  summary: string;
  description: string;
  isActive?: boolean;
  isMoi?: boolean;
  images?: string;
  categoryTinTuc?: CategoriesTinTuc | string;
  createdAt?: string;
  creatorId?: User | string;
}

const toUploadFileFromUrl = (url?: string): UploadFile[] => {
  if (!url) return [];
  return [
    {
      uid: "old-0",
      name: url.split("/").pop() || "thumbnail.jpg",
      status: "done",
      url,
    } as UploadFile,
  ];
};

const TinTucAdmin: React.FC = () => {
  const [tintucs, setTinTucs] = useState<TinTuc[]>([]);
  const [categorieTinTucs, setCategorieTinTucs] = useState<CategoriesTinTuc[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });
  const [search, setSearch] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);

  const [editingBlog, setEditingBlog] = useState<TinTuc | null>(null);
  const [viewingBlog, setViewingBlog] = useState<TinTuc | null>(null);

  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);
  const [alert, setAlert] = useState<{ type: "success" | "error" | "info"; message: string; description?: string } | null>(null);

  const [form] = Form.useForm();

  // description của CKEditor quản lý riêng bằng state
  const [description, setDescription] = useState<string>("");

  // giữ ref editor nếu muốn gọi editor.setData khi mở modal
  const editorRef = useRef<any>(null);

  const showAlert = (type: "success" | "error" | "info", msg: string, description?: string) => {
    setAlert({ type, message: msg, description });
    setTimeout(() => setAlert(null), 2800);
  };

  const fetchData = async (page = 1, pageSize = DEFAULT_PAGE_SIZE, searchTerm = "", categoryTinTucId: string | null = null) => {
    try {
      setLoading(true);
      const data = await getListTinTuc(page, pageSize, searchTerm, categoryTinTucId);
      setTinTucs(data.tintucs ?? []);
      setPagination({ current: data.page ?? page, pageSize, total: data.total ?? 0 });
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải danh sách blog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    (async () => {
      try {
        const cats = await getCategoriesTinTuc();
        setCategorieTinTucs(cats ?? []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const openAddModal = () => {
    setEditingBlog(null);
    form.resetFields();
    setDescription("");           // reset CKEditor
    setUploadFileList([]);        // không có ảnh cũ
    setModalVisible(true);
  };

  const openEditModal = (b: TinTuc) => {
    setEditingBlog(b);
    form.setFieldsValue({
      title: b.title,
      summary: b.summary,
      isActive: b.isActive,
      isMoi: b.isMoi,
      categoryTinTuc: typeof b.categoryTinTuc === "string" ? b.categoryTinTuc : (b.categoryTinTuc?._id ?? ""),
    });

    // Set CKEditor data vào state; onReady sẽ set vào editor
    setDescription(b.description || "");
    setUploadFileList(toUploadFileFromUrl(b.images));
    setModalVisible(true);
  };

  const openViewModal = async (id?: string) => {
    if (!id) return;
    try {
      const res = await getListTinTucById(id);
      setViewingBlog(res);
      setViewVisible(true);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi lấy chi tiết blog");
    }
  };

  const handleUploadChange = ({ fileList }: { fileList: UploadFile[] }) => {
    // chỉ 1 ảnh
    setUploadFileList(fileList.slice(-1));
  };

  const handleRemoveFile = (file: UploadFile) => {
    setUploadFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true)
      const hasNewThumb = uploadFileList.some((f) => (f as any).originFileObj);

      if (!editingBlog) {
        // CREATE: yêu cầu có thumbnail
        if (!hasNewThumb) {
          return message.error("Vui lòng chọn 1 ảnh thumbnail");
        }
        const fd = new FormData();
        fd.append("title", values.title);
        fd.append("summary", values.summary);
        fd.append("isActive", values.isActive);
        fd.append("isMoi", values.isMoi);
        fd.append("description", description || "");
        fd.append("categoryTinTuc", values.categoryTinTuc);

        const file = (uploadFileList[0] as any).originFileObj as File;
        fd.append("images", file);

        await createListTinTuc(fd);
        showAlert("success", "Tạo bài viết thành công");
      } else {
        if (hasNewThumb) {
          // UPDATE có đổi ảnh ⇒ multipart
          const fd = new FormData();
          fd.append("title", values.title);
          fd.append("summary", values.summary);
          fd.append("description", description || "");
          fd.append("isActive", values.isActive);
          fd.append("isMoi", values.isMoi);
          fd.append("categoryTinTuc", values.categoryTinTuc);

          const file = (uploadFileList[0] as any).originFileObj as File;
          fd.append("images", file);

          await updateListTinTuc(editingBlog._id!, fd);
        } else {
          // UPDATE không đổi ảnh ⇒ JSON
          await updateListTinTuc(editingBlog._id!, {
            title: values.title,
            summary: values.summary,
            description: description || "",
            isActive: values.isActive ?? editingBlog.isActive,
            isMoi: values.isMoi ?? editingBlog.isMoi,
            categoryTinTuc: values.categoryTinTuc,
          });
        }
        showAlert("success", "Cập nhật bài viết thành công");
      }

      setModalVisible(false);
      setEditingBlog(null);
      form.resetFields();
      setUploadFileList([]);
      setDescription("");
      fetchData(pagination.current, pagination.pageSize, search);
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Lỗi khi lưu blog");
    } finally {
      setLoading(false)
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      await deleteListTinTuc(id);
      showAlert("success", "Xóa blog thành công");
      fetchData(pagination.current, pagination.pageSize, search);
    } catch (err) {
      console.error(err);
      showAlert("error", "Xóa thất bại");
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Thumbnail",
        dataIndex: "images",
        render: (url: string) =>
          url ? <img src={url} style={{ width: 160, height: 100, objectFit: "cover", borderRadius: 6 }} /> : "-",
      },
      { title: "Tiêu đề", dataIndex: "title" },
      {
        title: "Danh mục",
        dataIndex: "categoryTinTuc",
        render: (cat: TinTuc["categoryTinTuc"]) => (typeof cat === "object" ? (cat as any)?.name : cat),
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdAt",
        render: (d: string) => (d ? new Date(d).toLocaleString() : "-"),
      },
      {
        title: "Người tạo",
        dataIndex: ["creatorId", "email"],
      },
      {
        title: "Hành động",
        render: (_: any, record: TinTuc) => (
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => openViewModal(record._id!)}>Xem</Button>
            <Button icon={<EditOutlined />} onClick={() => openEditModal(record)}>Sửa</Button>
            <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record._id!)}>
              <Button danger>Xoá</Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [pagination, search]
  );

  return (
    <div style={{ padding: 20 }}>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          description={alert.description}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Space wrap>
            <Button
              type={!selectedCategory ? "primary" : "default"}
              onClick={() => {
                setSelectedCategory(null);
                fetchData(1, pagination.pageSize, search, null);
              }}
            >
              Tất cả
            </Button>
            {categorieTinTucs.map((cat) => (
              <Button
                key={cat._id}
                type={selectedCategory === cat._id ? "primary" : "default"}
                onClick={() => {
                  setSelectedCategory(cat._id);
                  fetchData(1, pagination.pageSize, search, cat._id);
                }}
              >
                {cat.name}
              </Button>
            ))}
          </Space>
        </Col>
      </Row>

      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Input.Search
            placeholder="Tìm theo tiêu đề"
            allowClear
            onSearch={(val) => { setSearch(val); fetchData(1, pagination.pageSize, val); }}
            style={{ width: 320 }}
          />
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
            Thêm bài viết
          </Button>
        </Col>
      </Row>

      <Table
        rowKey={(r: TinTuc) => r._id!}
        dataSource={tintucs}
        columns={columns as any}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => fetchData(page, pageSize, search),
        }}
      />

      {/* Modal Thêm/Sửa */}
      <Modal
        title={editingBlog ? "Chỉnh sửa bài viết" : "Thêm bài viết"}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingBlog(null); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: "Nhập tiêu đề" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="summary" label="Tóm tắt" rules={[{ required: true, message: "Nhập tóm tắt" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="categoryTinTuc" label="Danh mục" rules={[{ required: true, message: "Chọn danh mục" }]}>
            <Select
              placeholder="Chọn danh mục"
              options={categorieTinTucs.map((c) => ({ label: c.name, value: c._id }))}
            />
          </Form.Item>

          <Form.Item label="Mô tả (CKEditor)">
            <CKEditor
              editor={ClassicEditor as any}
              onReady={(editor: any) => {
                editorRef.current = editor;
                editor.setData(description || ""); // đổ dữ liệu khi mở modal sửa
              }}
              onChange={(_evt: any, editor: any) => {
                const html = editor.getData();
                setDescription(html);
              }}
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Hoạt động"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="isMoi"
            label="Hàng mới"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>

          <Form.Item label="Thumbnail (1 ảnh)">
            <Upload
              listType="picture-card"
              fileList={uploadFileList}
              onChange={handleUploadChange}
              onRemove={handleRemoveFile}
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
            >
              {uploadFileList.length >= 1 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button htmlType="submit" type="primary" loading={loading}>
                {editingBlog ? "Cập nhật" : "Tạo"}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setUploadFileList([]);
                  setDescription("");
                  setEditingBlog(null);
                }}
                disabled={loading}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem chi tiết */}
      <Modal
        title="Chi tiết bài viết"
        open={viewVisible}
        onCancel={() => setViewVisible(false)}
        footer={null}
        width={900}
      >
        {viewingBlog ? (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tiêu đề">{viewingBlog.title}</Descriptions.Item>
            <Descriptions.Item label="Tóm tắt">{viewingBlog.summary}</Descriptions.Item>
            <Descriptions.Item label="Danh mục">
              {typeof viewingBlog.categoryTinTuc === "object" ? (viewingBlog.categoryTinTuc as any)?.name : viewingBlog.categoryTinTuc}
            </Descriptions.Item>
            <Descriptions.Item label="Images">
              {viewingBlog.images ? (
                <img src={viewingBlog.images} style={{ width: 160, borderRadius: 8, objectFit: "cover" }} />
              ) : (
                "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Nội dung">
              <div
                style={{ padding: "8px 0" }}
                dangerouslySetInnerHTML={{ __html: viewingBlog.description || "-" }}
              />
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div>Đang tải...</div>
        )}
      </Modal>
    </div>
  );
};

export default TinTucAdmin;
