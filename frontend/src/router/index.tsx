import React, { Suspense, lazy } from 'react';
import {
  createBrowserRouter,
  isRouteErrorResponse,
  Navigate,
  useLocation,
  useRouteError,
} from 'react-router-dom';
import { Spin } from 'antd';
import AppLayout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

const safeLazy = (importFn: () => Promise<any>) =>
  lazy(async () => {
    try {
      return await importFn();
    } catch (error: any) {
      const isChunkError =
        error?.name === 'ChunkLoadError' ||
        /failed to fetch dynamically imported module/i.test(error?.message || '') ||
        /importing a module script failed/i.test(error?.message || '');

      if (isChunkError) {
        const reloadKey = 'chunk_reload_timestamp';
        const lastReload = sessionStorage.getItem(reloadKey);
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem(reloadKey, String(now));
          window.location.reload();
          return new Promise(() => {});
        }
      }
      throw error;
    }
  });

const Login = safeLazy(() => import('../pages/Login'));
const KnowledgeAssets = safeLazy(() => import('../pages/KnowledgeAssets'));
const KnowledgeAssetDetail = safeLazy(() => import('../pages/KnowledgeAssets/Detail'));
const ResumesList = safeLazy(() => import('../pages/Resumes/List'));
const ResumeUpload = safeLazy(() => import('../pages/Resumes/Upload'));
const ResumeDetail = safeLazy(() => import('../pages/Resumes/Detail'));
const ProfileSettings = safeLazy(() => import('../pages/Settings/Profile'));
const SystemSettingsPage = safeLazy(() => import('../pages/Settings/System'));

const PageFallback = () => (
  <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
    <Spin size="large" />
  </div>
);

const lazyPage = (page: React.ReactNode) => (
  <Suspense fallback={<PageFallback />}>
    {page}
  </Suspense>
);

const RouteErrorBoundary = () => {
  const error = useRouteError();
  const errorMessage = error instanceof Error ? error.message : '';
  const isChunkError =
    (error instanceof Error && error.name === 'ChunkLoadError') ||
    /failed to fetch dynamically imported module/i.test(errorMessage) ||
    /importing a module script failed/i.test(errorMessage);
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  const title = isNotFound
    ? '页面不存在'
    : isChunkError
      ? '页面资源加载失败'
      : '页面加载失败';
  const description = isNotFound
    ? '当前地址没有对应功能，请返回知识资产库后重新选择。'
    : isChunkError
      ? '页面资源未能完整载入，请刷新后重试。'
      : '当前页面发生异常，请返回知识资产库后重试。';

  const handleAction = () => {
    sessionStorage.removeItem('chunk_reload_timestamp');
    if (isChunkError) {
      window.location.reload();
      return;
    }
    window.location.assign('/knowledge-assets');
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '70vh', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
          {title}
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: 20 }}>
          {description}
        </p>
        <button
          type="button"
          onClick={handleAction}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {isChunkError ? '刷新重试' : '返回知识资产库'}
        </button>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: lazyPage(<Login />),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/knowledge-assets" replace />,
      },
      {
        path: 'dashboard',
        element: <Navigate to="/knowledge-assets" replace />,
      },
      {
        path: 'workbench',
        element: <Navigate to="/knowledge-assets" replace />,
      },
      {
        path: 'customer-projects',
        element: <Navigate to="/knowledge-assets" replace />,
      },
      {
        path: 'customer-projects/:id',
        element: <Navigate to="/knowledge-assets" replace />,
      },
      {
        path: 'knowledge-assets',
        element: lazyPage(<KnowledgeAssets />),
      },
      {
        path: 'knowledge-assets/intake',
        element: <Navigate to="/knowledge-assets" replace />,
      },
      {
        path: 'knowledge-assets/:id',
        element: lazyPage(<KnowledgeAssetDetail />),
      },
      {
        path: 'resumes',
        element: lazyPage(<ResumesList />),
      },
      {
        path: 'resumes/upload',
        element: lazyPage(<ResumeUpload />),
      },
      {
        path: 'resumes/:id',
        element: lazyPage(<ResumeDetail />),
      },
      {
        path: 'ai-employees',
        element: <Navigate to="/knowledge-assets" replace />,
      },
      {
        path: 'ai-solution-assistant',
        element: <Navigate to="/knowledge-assets" replace />,
      },
      {
        path: 'ai-product-manager',
        element: <Navigate to="/knowledge-assets" replace />,
      },
      {
        path: 'industry-agent',
        element: <Navigate to="/knowledge-assets" replace />,
      },
      {
        path: 'settings',
        element: <Navigate to="/settings/system" replace />,
      },
      {
        path: 'settings/users',
        element: <Navigate to="/settings/system?tab=users" replace />,
      },
      {
        path: 'settings/profile',
        element: lazyPage(<ProfileSettings />),
      },
      {
        path: 'settings/system',
        element: lazyPage(<SystemSettingsPage />),
      },
    ],
  },
]);

export default router;
