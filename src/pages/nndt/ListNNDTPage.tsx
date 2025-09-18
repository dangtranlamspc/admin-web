// src/pages/ProductAdmin.tsx
import React, { useEffect, useState } from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Upload,
    Space,
    Popconfirm,
    message,
    Descriptions,
    Row,
    Col,
    Alert,
    Switch,
} from "antd";
import { UploadOutlined, PlusOutlined, EyeOutlined, EditOutlined, LeftOutlined, RightOutlined, CloseOutlined } from "@ant-design/icons";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { getProducts, createProduct, updateProduct, deleteProduct, getProductById, getCategories } from "../../api/nndt/nndtApi"

import type { UploadFile } from "antd/es/upload/interface";



interface CategoryNNDT {
    _id: string;
    name: string;
}

interface ProductImage {
    url: string;
    imageId: string;
}

interface User {
    _id: string;
    email: string;
}

interface ProductUpdateData {
    name: string;
    description?: string;
    categorynndt?: string;
    isActive?: boolean;
    isMoi?: boolean;
}

interface Product {
    _id?: string;
    name: string;
    description?: string;
    isActive?: boolean;
    isMoi?: boolean;
    categorynndt?: CategoryNNDT | string;
    images?: ProductImage[];
    createdAt?: string;
    creatorId?: User | string;
}

const toFileListFromUrls = (urls: string[] = []) =>
    urls.map<UploadFile>((url, i) => ({
        uid: `old-${i}`,
        name: url.split("/").pop() ?? `image-${i}`,
        status: "done",
        url,
    }));

const DEFAULT_PAGE_SIZE = 10;

const ProductNNDTAdmin: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<CategoryNNDT[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });
    const [search, setSearch] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewVisible, setViewVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const [description, setDescription] = useState<string>("");
    const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);
    const [form] = Form.useForm();

    const [alert, setAlert] = useState<{ type: "success" | "error" | "info"; message: string; description?: string } | null>(null);



    const fetchData = async (page = 1, pageSize = DEFAULT_PAGE_SIZE, searchText = "", categoryId: string | null = null) => {
        try {
            setLoading(true);
            const data = await getProducts(page, pageSize, searchText, categoryId);
            setProducts(data.products ?? []);
            setPagination({ current: data.page ?? page, pageSize, total: data.total ?? 0 });
        } catch (err) {
            console.error(err);
            message.error("Lỗi khi tải danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    const images = viewingProduct?.images?.map(img => img.url) || [];

    const openViewer = (index: any) => {
        setCurrentIndex(index);
        setIsOpen(true);
    };

    const closeViewer = () => {
        setIsOpen(false);
    };

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    useEffect(() => {
        fetchData();
        (async () => {
            try {
                const cats = await getCategories();
                setCategories(cats ?? []);
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    const openAddModal = () => {
        setEditingProduct(null);
        form.resetFields();
        setDescription("");
        setUploadFileList([]);
        setModalVisible(true);
    };

    const openViewModal = async (id?: string) => {
        if (!id) return;
        try {
            const res = await getProductById(id);
            const normalized = { ...res, images: Array.isArray(res.images) ? res.images : [] } as Product;
            setViewingProduct(normalized);
            setViewVisible(true);
        } catch (err) {
            console.error(err);
            message.error("Lỗi khi lấy chi tiết");
        }
    };

    const handleUploadChange = ({ fileList }: { fileList: UploadFile[] }) => {
        setUploadFileList(fileList);
    };

    const handleRemoveFile = (file: UploadFile) => {
        setUploadFileList(prev => prev.filter(f => f.uid !== file.uid));
    };

    const showAlert = (type: "success" | "error" | "info", message: string, description?: string) => {
        setAlert({ type, message, description });
        setTimeout(() => {
            setAlert(null);
        }, 3000);
    };

    const handleSave = async (values: any) => {
        try {
            setLoading(true);

            // Tách file mới & file cũ
            const newFiles = uploadFileList.filter(f => !!(f as any).originFileObj);

            // Lấy danh sách ảnh cũ còn giữ lại (có cấu trúc {url, imageId})
            const oldImages = uploadFileList
                .filter(f => !f.originFileObj && f.url) // chỉ giữ lại ảnh cũ còn tồn tại
                .map(f => {
                    // Tìm ảnh tương ứng trong editingProduct để lấy imageId
                    const originalImage = editingProduct?.images?.find(img => img.url === f.url);
                    return {
                        url: f.url!,
                        imageId: originalImage?.imageId || '' // lấy imageId từ data gốc
                    };
                });

            if (!editingProduct) {
                // CREATE
                if (newFiles.length === 0) {
                    message.error("Vui lòng chọn ít nhất 1 ảnh để tạo sản phẩm");
                    return;
                }

                const formData = new FormData();
                formData.append("name", values.name);
                formData.append("description", description || "");
                formData.append("categorynndt", values.categorynndt ?? "");
                formData.append("isActive", values.isActive ?? "");
                formData.append("isMoi", values.isMoi ?? "");

                newFiles.forEach(f => {
                    formData.append("images", (f as any).originFileObj as File);
                });

                await createProduct(formData);
                showAlert("success", "Thêm sản phẩm thành công");

            } else {
                // UPDATE
                if (newFiles.length > 0 || oldImages.length !== (editingProduct.images?.length ?? 0)) {
                    // Có thay đổi ảnh (thêm mới hoặc xóa bớt) → multipart
                    const formData = new FormData();
                    formData.append("name", values.name);
                    formData.append("description", description || "");
                    formData.append("categorynndt", values.categorynndt ?? "");
                    formData.append("isActive", values.isActive ?? "");
                    formData.append("isMoi", values.isMoi ?? "");

                    // Gửi danh sách ảnh cũ còn giữ lại (với imageId)
                    formData.append("oldImages", JSON.stringify(oldImages));

                    // Thêm ảnh mới
                    newFiles.forEach(f => {
                        formData.append("images", (f as any).originFileObj as File);
                    });

                    await updateProduct(editingProduct._id!, formData);

                } else {
                    // Không đổi ảnh → chỉ update text fields
                    const updateData: ProductUpdateData = {
                        name: values.name,
                        description: description || "",
                        categorynndt: values.categorynndt ?? "",
                        isActive: values.isActive ?? "",
                        isMoi: values.isMoi ?? "",
                    };
                    await updateProduct(editingProduct._id!, updateData);
                }

                showAlert("success", "Cập nhật sản phẩm thành công");
            }

            // Reset state
            setModalVisible(false);
            setEditingProduct(null);
            form.resetFields();
            setUploadFileList([]);
            setDescription("");
            fetchData(pagination.current, pagination.pageSize, search);

        } catch (err) {
            console.error("Error saving product:", err);
            showAlert("error", "Lỗi khi lưu sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record: Product) => {
        setEditingProduct(record);
        form.setFieldsValue({
            name: record.name,
            categorynndt: typeof record.categorynndt === "string" ? record.categorynndt : (record.categorynndt?._id ?? ""),
            isActive: record.isActive,
            isNew: record.isMoi,
        });
        setDescription(record.description || ""); // fix CKEditor value
        setUploadFileList(
            (record.images || []).map((img: any, index: number) => ({
                uid: String(index),
                name: `images-${index}`,
                status: "done",
                url: img.url,  // ✅ dùng img.url thay vì img
            }))
        );
        setModalVisible(true);
    };

    const handleDelete = async (id?: string) => {
        if (!id) return;
        try {
            await deleteProduct(id);
            showAlert("success", "Xóa thành công")
            fetchData(pagination.current, pagination.pageSize, search);
        } catch (err) {
            console.error(err);
            showAlert("error", "Xóa thất bại")
        }
    };

    const columns = [
        {
            title: "Hình",
            dataIndex: "images",
            render: (images: { url: string; imageId: string }[] = []) => (
                <img
                    src={images.length > 0 ? images[0].url : undefined}
                    alt=""
                    style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6 }}
                />
            ),
        },
        { title: "Tên", dataIndex: "name" },
        { title: "Danh mục", dataIndex: ["categorynndt", "name"] },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            render: (d: any) => (d ? new Date(d).toLocaleString() : "-"),
        },
        { title: "Người tạo", dataIndex: ["creatorId", "email"] },
        {
            title: "Hành động",
            render: (_: any, record: Product) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => openViewModal(record._id)}>Xem</Button>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
                    <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record._id)}>
                        <Button danger> Xóa </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

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
                        {categories.map((cat) => (
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
                        placeholder="Tìm theo tên"
                        allowClear
                        onSearch={(val) => { setSearch(val); fetchData(1, pagination.pageSize, val, selectedCategory); }}
                        style={{ width: 320 }}
                    />
                </Col>
                <Col>
                    <Space>
                        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>Thêm sản phẩm</Button>
                    </Space>
                </Col>
            </Row>

            <Table
                rowKey={(r: Product) => r._id!}
                columns={columns}
                dataSource={products}
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
                title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
                open={modalVisible}
                onCancel={() => { setModalVisible(false); setEditingProduct(null); }}
                footer={null}
            >
                <Form layout="vertical" form={form} onFinish={handleSave}>
                    <Form.Item name="name" label="Tên" rules={[{ required: true, message: "Nhập tên" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <CKEditor
                            editor={ClassicEditor as any} // cast to any to avoid type mismatch issues
                            onReady={(editor: any) => {
                                // ensure editor has current description when opening modal for edit
                                editor.setData(description || "");
                            }}
                            onChange={(_event: any, editor: any) => {
                                const data = editor.getData();
                                setDescription(data);
                            }}
                        />
                    </Form.Item>

                    <Form.Item name="categorynndt" label="Danh mục" rules={[{ required: true, message: 'Hãy chọn danh mục' }]}>
                        <Select options={categories.map(c => ({ label: c.name, value: c._id }))} />
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

                    <Form.Item label="Hình ảnh">
                        <Upload
                            listType="picture-card"
                            fileList={uploadFileList}
                            onRemove={handleRemoveFile}
                            onChange={handleUploadChange}
                            beforeUpload={() => false}
                            multiple
                        >
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                            </div>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button loading={loading} htmlType="submit" type="primary">{editingProduct ? "Cập nhật" : "Tạo"}</Button>
                            <Button onClick={() => { setModalVisible(false); form.resetFields(); setUploadFileList([]); setEditingProduct(null); }} disabled={loading}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Xem + lightGallery */}
            <Modal
                title="Chi tiết sản phẩm"
                open={viewVisible}
                onCancel={() => setViewVisible(false)}
                footer={null}
                width={900}
            >
                {viewingProduct ? (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Tên">{viewingProduct.name}</Descriptions.Item>
                        <Descriptions.Item label="Mô tả"><div
                            style={{ padding: "8px 0" }}
                            dangerouslySetInnerHTML={{ __html: viewingProduct.description || "-" }}
                        /></Descriptions.Item>
                        <Descriptions.Item label="Danh mục">{(viewingProduct.categorynndt && typeof viewingProduct.categorynndt === "object") ? viewingProduct.categorynndt.name : viewingProduct.categorynndt ?? "-"}</Descriptions.Item>
                        <Descriptions.Item label="Hình ảnh">
                            {images.length > 0 ? (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {images.map((src, idx) => (
                                        <img
                                            key={idx}
                                            src={src}
                                            alt={`img-${idx}`}
                                            style={{
                                                width: 110,
                                                height: 110,
                                                objectFit: "cover",
                                                borderRadius: 6,
                                                border: "1px solid #f0f0f0",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => openViewer(idx)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div>- Không có ảnh -</div>
                            )}

                            {isOpen && (
                                <div
                                    style={{
                                        position: "fixed",
                                        inset: 0,
                                        backgroundColor: "rgba(0,0,0,0.9)",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        zIndex: 2000,
                                    }}
                                >
                                    <img
                                        src={images[currentIndex]}
                                        alt="full"
                                        style={{
                                            maxHeight: "90%",
                                            maxWidth: "90%",
                                            borderRadius: 8,
                                            transition: "transform 0.3s ease",
                                        }}
                                    />
                                    {/* Close button */}
                                    <CloseOutlined
                                        onClick={closeViewer}
                                        style={{
                                            position: "absolute",
                                            top: 20,
                                            right: 30,
                                            fontSize: 30,
                                            color: "#fff",
                                            cursor: "pointer",
                                        }}
                                    />
                                    {/* Prev button */}
                                    {images.length > 1 && (
                                        <LeftOutlined
                                            onClick={prevImage}
                                            style={{
                                                position: "absolute",
                                                left: 30,
                                                fontSize: 40,
                                                color: "#fff",
                                                cursor: "pointer",
                                            }}
                                        />
                                    )}
                                    {/* Next button */}
                                    {images.length > 1 && (
                                        <RightOutlined
                                            onClick={nextImage}
                                            style={{
                                                position: "absolute",
                                                right: 30,
                                                fontSize: 40,
                                                color: "#fff",
                                                cursor: "pointer",
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </Descriptions.Item>
                    </Descriptions>
                ) : (
                    <div>Đang tải...</div>
                )}
            </Modal>
        </div>
    );
};

export default ProductNNDTAdmin;