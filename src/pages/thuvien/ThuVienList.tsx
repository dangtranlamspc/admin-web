// src/pages/BlogAdmin.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Table, Button, Modal, Form, Input, Select, Space,
    Popconfirm, message, Row, Col, Descriptions,
    Switch
} from "antd";
import { PlusOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import {
    getListThuVien, createListThuVien, updateListThuVien, deleteListThuVien, getListThuVienById, getCategoriesThuVien
} from "../../api/thuvien/thuvienApi";

const DEFAULT_PAGE_SIZE = 10;

export interface User {
    _id: string,
    email: string,
}

export interface CategoriesThuVien {
    _id: string;
    name: string;
}

export interface ThuVien {
    _id?: string;
    title: string;
    videoId: string;
    isActive?: boolean;
    isMoi?: boolean;
    categoryThuVien?: CategoriesThuVien | string;
    createdAt?: string;
    creatorId?: User | string;
}

const ThuVienAdmin: React.FC = () => {
    const [thuviens, setThuViens] = useState<ThuVien[]>([]);
    const [categorieThuViens, setCategorieThuViens] = useState<CategoriesThuVien[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [pagination, setPagination] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });
    const [search, setSearch] = useState("");

    const [modalVisible, setModalVisible] = useState(false);
    const [viewVisible, setViewVisible] = useState(false);

    const [editingBlog, setEditingBlog] = useState<ThuVien | null>(null);
    const [viewingBlog, setViewingBlog] = useState<ThuVien | null>(null);

    const [alert, setAlert] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

    const [form] = Form.useForm();

    const showAlert = (type: "success" | "error" | "info", msg: string) => {
        setAlert({ type, message: msg });
        setTimeout(() => setAlert(null), 2800);
    };

    const fetchData = async (page = 1, pageSize = DEFAULT_PAGE_SIZE, searchTerm = "", categoryThuVienId: string | null = null) => {
        try {
            setLoading(true);
            const data = await getListThuVien(page, pageSize, searchTerm, categoryThuVienId);
            setThuViens(data.thuviens ?? []);
            setPagination({ current: data.page ?? page, pageSize, total: data.total ?? 0 });
        } catch (err) {
            console.error(err);
            message.error("Lỗi khi tải danh sách thư viện");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        (async () => {
            try {
                const cats = await getCategoriesThuVien();
                setCategorieThuViens(cats ?? []);
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    const openAddModal = () => {
        setEditingBlog(null);
        form.resetFields();
        setModalVisible(true);
    };

    const openEditModal = (b: ThuVien) => {
        setEditingBlog(b);
        form.setFieldsValue({
            title: b.title,
            videoId: b.videoId,
            isActive: b.isActive,
            isMoi: b.isMoi,
            categoryThuVien: typeof b.categoryThuVien === "string" ? b.categoryThuVien : (b.categoryThuVien?._id ?? ""),
        });
        setModalVisible(true);
    };

    const openViewModal = async (id?: string) => {
        if (!id) return;
        try {
            const res = await getListThuVienById(id);
            setViewingBlog(res);
            setViewVisible(true);
        } catch (err) {
            console.error(err);
            message.error("Lỗi khi lấy chi tiết blog");
        }
    };


    const handleSave = async (values: any) => {
        try {
            if (!editingBlog) {
                await createListThuVien({
                    title: values.title,
                    videoId: values.videoId,
                    categoryThuVien: values.categoryThuVien,
                    isActive: values.isActive,
                    isMoi: values.isMoi,
                });
                showAlert("success", "Tạo bài viết thành công");
            } else {
                await updateListThuVien(editingBlog._id!, {
                    title: values.title,
                    videoId: values.videoId,
                    categoryThuVien: values.categoryThuVien,
                    isActive: values.isActive,
                    isMoi: values.isMoi,
                });
                showAlert("success", "Cập nhật bài viết thành công");
            }

            setModalVisible(false);
            setEditingBlog(null);
            form.resetFields();
            fetchData(pagination.current, pagination.pageSize, search);
        } catch (err: any) {
            console.error(err);
            message.error(err?.response?.data?.message || "Lỗi khi lưu blog");
        }
    };


    const handleDelete = async (id?: string) => {
        if (!id) return;
        try {
            await deleteListThuVien(id);
            showAlert("success", "Xóa thành công");
            fetchData(pagination.current, pagination.pageSize, search);
        } catch (err) {
            console.error(err);
            showAlert("error", "Xóa thất bại");
        }
    };

    const columns = useMemo(
        () => [
            { title: "Tiêu đề", dataIndex: "title" },
            { title: "YouTube ID", dataIndex: "videoId" },
            {
                title: "Danh mục",
                dataIndex: "categoryThuVien",
                render: (cat: ThuVien["categoryThuVien"]) => (typeof cat === "object" ? (cat as any)?.name : cat),
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
                render: (_: any, record: ThuVien) => (
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
                        {categorieThuViens.map((cat) => (
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
                rowKey={(r: ThuVien) => r._id!}
                dataSource={thuviens}
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
                    <Form.Item name="videoId" label="Youtube Id" rules={[{ required: true, message: "Nhập youtube id" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="categoryThuVien" label="Danh mục" rules={[{ required: true, message: "Chọn danh mục" }]}>
                        <Select
                            placeholder="Chọn danh mục"
                            options={categorieThuViens.map((c) => ({ label: c.name, value: c._id }))}
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
                    <Form.Item>
                        <Space>
                            <Button htmlType="submit" type="primary" loading={loading}>
                                {editingBlog ? "Cập nhật" : "Tạo"}
                            </Button>
                            <Button
                                onClick={() => {
                                    setModalVisible(false);
                                    form.resetFields();
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
                        <Descriptions.Item label="Youtub Id">{viewingBlog.videoId}</Descriptions.Item>
                        <Descriptions.Item label="Danh mục">
                            {typeof viewingBlog.categoryThuVien === "object" ? (viewingBlog.categoryThuVien as any)?.name : viewingBlog.categoryThuVien}
                        </Descriptions.Item>
                    </Descriptions>
                ) : (
                    <div>Đang tải...</div>
                )}
            </Modal>
        </div>
    );
};

export default ThuVienAdmin;
