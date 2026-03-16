"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/AuthProvider';
import { Form, Input, Button, Checkbox, Alert, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: { email: string; password: string; remember: boolean }) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await signIn(values.email, values.password);
      // Wait a moment for auth context to update
      setTimeout(() => {
        router.push('/');
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <div className="text-center mb-8">
            <Title level={2} className="text-blue-600">
              I-PROJECT
            </Title>
            <Text type="secondary">
              Sign in to your account
            </Text>
          </div>

          {error && (
            <Alert
              message="Login Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              className="mb-6"
            />
          )}

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            initialValues={{ remember: true }}
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <div className="flex justify-between items-center">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <Link href="/forgot-password" className="text-blue-600 hover:text-blue-800">
                  Forgot password?
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                block
                className="h-12 text-base font-medium"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-6">
            <Text type="secondary">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign up
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
}
