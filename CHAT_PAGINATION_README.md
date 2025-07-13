# Chat Pagination Implementation

## Tổng quan

Tính năng pagination cho chat đã được implement để cải thiện hiệu suất khi load tin nhắn. Thay vì load toàn bộ tin nhắn cùng lúc, hệ thống sẽ:

- Load 20 tin nhắn gần nhất khi mở chat
- Load thêm 20 tin nhắn cũ hơn khi user scroll lên đầu
- Hiển thị loading indicator khi đang load thêm tin nhắn

## Các thay đổi chính

### 1. MessageService (`services/messageService.js`)
- Thêm method `getMessageHistoryWithPagination()` để hỗ trợ pagination
- Giữ lại method cũ `getMessageHistory()` để tương thích ngược

### 2. ChatBox Components
- **Candidates**: `components/dashboard-pages/candidates-dashboard/messages/components/index.jsx`
- **Employers**: `components/dashboard-pages/employers-dashboard/messages/components/index.jsx`

Các thay đổi:
- Thêm state cho pagination: `currentPage`, `hasMoreMessages`, `loadingMoreMessages`, `totalMessages`
- Thêm function `loadMessages()` để load tin nhắn với pagination
- Thêm function `loadMoreMessages()` để load thêm tin nhắn khi scroll
- Reset pagination khi chuyển đổi chat partner

### 3. ContentField Components
- **Candidates**: `components/dashboard-pages/candidates-dashboard/messages/components/ContentField.jsx`
- **Employers**: `components/dashboard-pages/employers-dashboard/messages/components/ContentField.jsx`

Các thay đổi:
- Thêm `messagesContainerRef` để theo dõi scroll
- Implement infinite scroll với `handleScroll()`
- Hiển thị loading indicator khi đang load thêm tin nhắn
- Chỉ auto-scroll khi có tin nhắn mới, không scroll khi load tin nhắn cũ

### 4. Styling
- Tạo file `styles/chat.css` với các style cho chat
- Import CSS vào `app/layout.js`

## Cách hoạt động

### Khi mở chat:
1. Load 20 tin nhắn gần nhất
2. Hiển thị loading skeleton trong khi đang load
3. Auto-scroll xuống tin nhắn mới nhất

### Khi scroll lên đầu:
1. Kiểm tra xem còn tin nhắn cũ không (`hasMoreMessages`)
2. Nếu có và không đang load, gọi `loadMoreMessages()`
3. Hiển thị loading indicator "Loading more messages..."
4. Append tin nhắn cũ vào đầu danh sách
5. Giữ nguyên vị trí scroll để user không bị nhảy

### Khi có tin nhắn mới:
1. Tin nhắn mới được thêm vào cuối danh sách
2. Auto-scroll xuống tin nhắn mới
3. Cập nhật contact list với tin nhắn mới nhất

## API Requirements

Backend cần hỗ trợ pagination với format response:

```json
{
  "messages": [...], // Array tin nhắn
  "total": 150,      // Tổng số tin nhắn
  "page": 1,         // Trang hiện tại
  "pageSize": 20     // Số tin nhắn mỗi trang
}
```

Hoặc nếu backend chưa hỗ trợ pagination, có thể trả về array tin nhắn trực tiếp và frontend sẽ tính toán pagination.

## Configuration

Có thể thay đổi số tin nhắn mỗi lần load bằng cách sửa `PAGE_SIZE` trong ChatBox components:

```javascript
const PAGE_SIZE = 20; // Có thể thay đổi thành 10, 30, 50...
```

## Performance Benefits

- **Giảm thời gian load ban đầu**: Chỉ load 20 tin nhắn thay vì toàn bộ
- **Giảm memory usage**: Không load tất cả tin nhắn vào memory
- **Cải thiện UX**: Loading nhanh hơn, smooth scrolling
- **Scalable**: Có thể handle chat với hàng nghìn tin nhắn

## Testing

Để test tính năng:
1. Tạo nhiều tin nhắn trong một conversation (> 20 tin nhắn)
2. Mở chat và verify chỉ load 20 tin nhắn gần nhất
3. Scroll lên đầu và verify loading indicator xuất hiện
4. Verify tin nhắn cũ được load và append vào đầu
5. Test với tin nhắn mới để verify auto-scroll hoạt động đúng

## Troubleshooting

### Tin nhắn không load thêm:
- Kiểm tra `hasMoreMessages` state
- Kiểm tra API response format
- Verify scroll event listener được attach đúng

### Scroll position bị nhảy:
- Kiểm tra logic trong `useEffect` cho `scrollToBottom()`
- Verify `loadingMoreMessages` state được set đúng

### Performance issues:
- Giảm `PAGE_SIZE` nếu cần
- Implement virtual scrolling cho chat rất dài (> 1000 tin nhắn) 