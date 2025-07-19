'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { subscriptionService } from '@/services/subscriptionService';
import { toast } from 'react-toastify';

export default function PaymentRedirect() {
  const [status, setStatus] = useState('processing');
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      toast.error('Không tìm thấy thông tin thanh toán');
      return;
    }

    let interval;
    let timeout;

    const checkPaymentStatus = async () => {
      interval = setInterval(async () => {
        try {
          const response = await subscriptionService.checkPaymentStatus(orderId);
          if (response.status === 'completed' || response.status === 'success' || response.status === 'PAID') {
            clearInterval(interval);
            setStatus('success');
            toast.success('Thanh toán thành công!');
            setTimeout(() => {
              router.push('/candidates-dashboard/packages');
            }, 2000);
          } else if (response.status === 'failed' || response.status === 'FAILED') {
            clearInterval(interval);
            setStatus('failed');
            toast.error('Thanh toán thất bại');
          }
        } catch (error) {
          clearInterval(interval);
          setStatus('error');
          toast.error('Lỗi khi kiểm tra trạng thái thanh toán');
        }
      }, 3000);

      timeout = setTimeout(() => {
        clearInterval(interval);
        if (status === 'processing') {
          setStatus('timeout');
          toast.error('Thời gian chờ thanh toán đã hết');
        }
      }, 2 * 60 * 1000);
    };

    checkPaymentStatus();

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line
  }, [orderId]);

  return (
    <div className="payment-redirect-container">
      <div className="payment-status-card">
        <h2>Trạng thái thanh toán</h2>
        {status === 'processing' && (
          <>
            <div className="spinner"></div>
            <p>Đang xử lý thanh toán...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <p>Thanh toán thành công!</p>
            <p>Đang chuyển hướng...</p>
          </>
        )}
        {status === 'failed' && (
          <>
            <div className="failed-icon">✗</div>
            <p>Thanh toán thất bại.</p>
            <button onClick={() => router.push('/candidates-dashboard/packages/buy')}>Thử lại</button>
          </>
        )}
        {(status === 'error' || status === 'timeout') && (
          <>
            <div className="error-icon">!</div>
            <p>Có lỗi xảy ra khi xử lý thanh toán.</p>
            <button onClick={() => router.push('/candidates-dashboard/packages/buy')}>Quay lại</button>
          </>
        )}
      </div>
    </div>
  );
} 