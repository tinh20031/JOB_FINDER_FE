import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  // Định nghĩa các path cần bảo vệ và role yêu cầu
  const protectedRoutes = [

    { path: '/company-dashboard', requiredRole: 'Company' },
    { path: '/candidates-dashboard', requiredRole: 'Candidate' },
    { path: '/admin-dashboard', requiredRole: 'Admin' },


  ];

  // Kiểm tra các route cần bảo vệ
  for (const routeInfo of protectedRoutes) {
    if (pathname.startsWith(routeInfo.path)) {
      // Nếu không có token hoặc role không đúng
      if (!token || role !== routeInfo.requiredRole) {
        // Chuyển hướng đến trang login
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // Cho phép truy cập nếu không nằm trong protectedRoutes hoặc có quyền
  return NextResponse.next();
}

// Cấu hình matcher để middleware chỉ chạy trên các path cụ thể
export const config = {
  matcher: ['/company-dashboard/:path*', '/candidates-dashboard/:path*', '/admin-dashboard/:path*'],
}; 