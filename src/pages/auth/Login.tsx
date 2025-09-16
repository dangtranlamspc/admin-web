import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { authApi } from '../../api/authApi';


const { Title } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      const user = await authApi.login(values.email, values.password);
      message.success(user ?`Welcome ${user.name}!` : "Chưa đăng nhập");
      navigate("/"); // về dashboard
    } catch (error: any) {
      message.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f0f2f5"
    }}>
      <Card style={{ width: 350, padding: "20px 10px" }}>
        <Title level={3} style={{ textAlign: "center" }}>Admin Login</Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Please enter your email" }]}>
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: "Please enter your password" }]}>
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}