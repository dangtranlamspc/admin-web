import { Layout, Menu, Avatar, Dropdown, Button } from "antd";
import {
  DashboardOutlined,
  AppstoreOutlined,
  TagsOutlined,
  PictureOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import type { User } from "../types/user"
import { useEffect, useState } from "react";

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
  user: User | null;
}



export default function MainLayout({ children, user }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storeUser = localStorage.getItem("user");
    if (storeUser) {
      setCurrentUser(JSON.parse(storeUser));
    }
  }, [location.pathname])

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: 'sub1',
      icon: <AppstoreOutlined />,
      label: <Link to="">SẢN PHẨM</Link>,
      children: [
        {
          key: "/categories",
          icon: <TagsOutlined />,
          label: <Link to="/categories">DANH MỤC SẢN PHẨM</Link>,
        },
        {
          key: "/products",
          icon: <AppstoreOutlined />,
          label: <Link to="/products">DANH SÁCH SẢN PHẨM</Link>,
        },
      ]
    },
    {
      key: 'sub2',
      icon: <AppstoreOutlined />,
      label: <Link to="">BÁC SĨ CÂY TRỒNG</Link>,
      children: [
        {
          key: "/categoriesBSCT",
          icon: <TagsOutlined />,
          label: <Link to="/categoriesBSCT">DANH MỤC</Link>,
        },
        {
          key: "/bscts",
          icon: <AppstoreOutlined />,
          label: <Link to="/bscts">DANH SÁCH</Link>,
        },
      ]
    },
    {
      key: 'sub3',
      icon: <AppstoreOutlined />,
      label: <Link to="">THƯ VIỆN</Link>,
      children: [
        {
          key: "/categoriesThuVien",
          icon: <TagsOutlined />,
          label: <Link to="/categoriesThuVien">DANH MỤC</Link>,
        },
        {
          key: "/thuviens",
          icon: <AppstoreOutlined />,
          label: <Link to="/thuviens">DANH SÁCH</Link>,
        },
      ]
    },
    {
      key: 'sub4',
      icon: <AppstoreOutlined />,
      label: <Link to="">NÔNG NGHIỆP ĐÔ THỊ</Link>,
      children: [
        {
          key: "/categoriesNNDT",
          icon: <TagsOutlined />,
          label: <Link to="/categoriesNNDT">DANH MỤC</Link>,
        },
        {
          key: "/nndts",
          icon: <AppstoreOutlined />,
          label: <Link to="/nndts">DANH SÁCH</Link>,
        },
      ]
    },
    {
      key: 'sub5',
      icon: <AppstoreOutlined />,
      label: <Link to="">CÔN TRÙNG GIA DỤNG</Link>,
      children: [
        {
          key: "/categoryCTGD",
          icon: <TagsOutlined />,
          label: <Link to="/categoryCTGD">DANH MỤC</Link>,
        },
        {
          key: "/ctgds",
          icon: <AppstoreOutlined />,
          label: <Link to="/ctgds">DANH SÁCH</Link>,
        },
      ]
    },
        {
      key: 'sub6',
      icon: <AppstoreOutlined />,
      label: <Link to="">TIN TỨC</Link>,
      children: [
        {
          key: "/categoryTinTuc",
          icon: <TagsOutlined />,
          label: <Link to="/categoryTinTuc">DANH MỤC</Link>,
        },
        {
          key: "/tintucs",
          icon: <AppstoreOutlined />,
          label: <Link to="/tintucs">DANH SÁCH</Link>,
        },
      ]
    },
    {
      key: "/sliders",
      icon: <PictureOutlined />,
      label: <Link to="/sliders">Sliders</Link>,
    },
    ...(user?.role === "admin"
      ? [
        {
          key: "/users",
          icon: <UserOutlined />,
          label: <Link to="/users">Users</Link>,
        },
      ]
      : []),
  ];

  const userMenu: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: logout,
    },
  ];


  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider width="15%" style={{ width: 256 }} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ marginTop: 16 }}>
          <Button type="primary" onClick={toggleCollapsed} style={{ marginBottom: 16 }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
        </div>
        <div style={{ height: 50, margin: 16, color: "white", textAlign: "center", fontWeight: "bold" }}>
          {collapsed ? "A" : "Admin Panel"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>

      {/* Main layout */}
      <Layout>
        {/* Header */}
        <Header style={{ background: "#fff", padding: "0 16px", display: "flex", justifyContent: "flex-end" }}>
          <Dropdown menu={{ items: userMenu }} trigger={["click"]}>
            <div style={{ display: "flex", alignItems: "center", cursor: "pointer", width: 256 }}>
              <span style={{ marginLeft: 8 }}>{currentUser?.name}</span>
            </div>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content style={{ margin: "16px" }}>
          <div style={{ background: "#fff", padding: 16, minHeight: 360 }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}
