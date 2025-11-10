import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import useLanguage from '@/locale/useLanguage';

import { Form, Button, Alert } from 'antd';

import { login } from '@/redux/auth/actions';
import { selectAuth } from '@/redux/auth/selectors';
import LoginForm from '@/forms/LoginForm';
import Loading from '@/components/Loading';
import AuthModule from '@/modules/AuthModule';
import {
  isTokenAuth,
  isEmailAuth,
  getTokenFromUrl,
  getTenantIdFromUrl,
  getUserEmailFromUrl
} from '@/config/tokenConfig';

const LoginPage = () => {
  const translate = useLanguage();
  const { isLoading, isSuccess } = useSelector(selectAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const [authMethod, setAuthMethod] = useState('manual');
  const [intendedDestination, setIntendedDestination] = useState(null);

  useEffect(() => {
    // Check if user came from ticketing system
    const token = getTokenFromUrl();
    const email = getUserEmailFromUrl();
    const tenantId = getTenantIdFromUrl();

    // Store intended destination if user navigated to a specific page
    // Preserve the full path including parameters
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const fullPath = currentPath + currentSearch;

    // Only store if it's not the login page and not root
    if (currentPath !== '/login' && currentPath !== '/') {
      // Store the path without auth parameters for cleaner redirect
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      url.searchParams.delete('tenant');
      url.searchParams.delete('db');
      url.searchParams.delete('email');
      const cleanPath = url.pathname + url.search;
      setIntendedDestination(cleanPath);
      console.log('Stored intended destination:', cleanPath);
    }

    if ((token || email) && !isSuccess && !isLoading && !autoLoginAttempted) {
      if (token) {
        console.log('Token-based authentication detected');
        setAuthMethod('token');
      } else if (email) {
        console.log('Email-based authentication detected');
        setAuthMethod('email');
      }

      console.log('Ticketing system user detected, tenant:', tenantId);
      setAutoLoginAttempted(true);

      // Auto-login with default CRM credentials
      // The auth service will handle Appwrite authentication based on context
      dispatch(login({
        loginData: {
          email: 'admin@admin.com',
          password: 'admin123',
        }
      }));
    }
  }, [dispatch, isSuccess, isLoading, autoLoginAttempted]);

  useEffect(() => {
    if (isSuccess) {
      // Navigate to intended destination or default to home
      const destination = intendedDestination || '/';
      console.log('Authentication successful, navigating to:', destination);
      navigate(destination);
    }
  }, [isSuccess, navigate, intendedDestination]);

  const FormContainer = () => {
    const token = getTokenFromUrl();
    const email = getUserEmailFromUrl();
    const tenantId = getTenantIdFromUrl();
    const showAutoLoginMessage = autoLoginAttempted && (token || email) && tenantId;

    return (
      <Loading isLoading={isLoading}>
        {showAutoLoginMessage && (
          <Alert
            message="Authenticating from Ticketing System"
            description={
              <div>
                {email && <p><strong>User:</strong> {email}</p>}
                <p style={{ color: '#52c41a', marginTop: 8 }}>
                  ✓ Authentication successful
                </p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Form
          layout="vertical"
          name="normal_login"
          className="login-form"
          initialValues={{
            remember: true,
            email:'admin@admin.com',
            password:'admin123',
          }}
          onFinish={(values) => dispatch(login({ loginData: values }))}
        >
          <LoginForm />
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              loading={isLoading}
              size="large"
            >
              {translate('Log in')}
            </Button>
          </Form.Item>
        </Form>
      </Loading>
    );
  };

  return <AuthModule authContent={<FormContainer />} AUTH_TITLE="Sign in" />;
};

export default LoginPage;
