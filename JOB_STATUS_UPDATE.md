# Job Status Update - Cập nhật trạng thái Job

## Tổng quan
Đã cập nhật hệ thống trạng thái job theo enum mới với 4 trạng thái cơ bản.

## Trạng thái mới (New Job Status)

### Enum JobStatus
```javascript
export const JobStatus = {
  DRAFT: 0,      // Bản nháp
  PENDING: 1,    // Chờ duyệt  
  ACTIVE: 2,     // Đang hoạt động
  INACTIVE: 3    // Tạm dừng
};
```

### So sánh với trạng thái cũ
| Trạng thái cũ | Trạng thái mới | Mô tả |
|---------------|----------------|-------|
| Status = 0 | Status = 0 | **Draft** (Bản nháp) - Mới thêm |
| Status = 0 | Status = 1 | **Pending** (Chờ duyệt) |
| Status = 1 | Status = 2 | **Active** (Đang hoạt động) |
| Status = 2 | Status = 3 | **Inactive** (Tạm dừng) |

## Files đã được cập nhật

### 1. Utils
- `utils/jobStatus.js` - Tạo mới file enum và helper functions

### 2. Services  
- `services/jobService.js` - Cập nhật logic status và sử dụng enum mới

### 3. Components
- `components/dashboard-pages/employers-dashboard/manage-jobs/components/JobListingsTable.jsx`
- `components/dashboard-pages/admin-dashboard/job-post-management/index.jsx`
- `components/job-listing-pages/job-list-v1/FilterJobsBox.jsx`
- `components/job-featured/JobFeatured1.jsx`
- `components/job-single-pages/related-jobs/RelatedJobs2.jsx`
- `components/dashboard-pages/candidates-dashboard/short-listed-jobs/components/JobFavouriteTable.jsx`
- `components/dashboard-pages/employers-dashboard/dashboard/components/TopCardBlock.jsx`
- `components/dashboard-pages/admin-dashboard/dashboard/components/TopCardBlock.jsx`

### 4. Pages
- `app/dashboard/employers-dashboard/edit-job/[id]/PostBoxForm.jsx`

## Các thay đổi chính

### 1. Thêm trạng thái Draft
- Status = 0 giờ là Draft thay vì Pending
- Draft jobs không hiển thị cho người dùng cuối
- Chỉ employer có thể xem và chỉnh sửa draft jobs

### 2. Cập nhật logic hiển thị
- Active jobs: `status === 2` (thay vì `status === 1`)
- Pending jobs: `status === 1` (thay vì `status === 0`)  
- Inactive jobs: `status === 3` (thay vì `status === 2`)

### 3. Cập nhật API calls
- Approve job: `newStatus=2` (thay vì `newStatus=1`)
- Reject job: `newStatus=3` (thay vì `newStatus=2`)

### 4. Helper Functions
- `getJobStatusLabel(status, language)` - Lấy label theo ngôn ngữ
- `getJobStatusColor(status)` - Lấy màu sắc cho UI
- `isJobActive(status)`, `isJobPending(status)`, etc. - Check functions

## Màu sắc UI
- **Draft**: `bg-info` (màu xanh dương nhạt)
- **Pending**: `bg-warning` (màu vàng)
- **Active**: `bg-success` (màu xanh lá)
- **Inactive**: `bg-secondary` (màu xám)

## Lưu ý quan trọng
1. **Backward Compatibility**: Cần đảm bảo backend cũng được cập nhật theo enum mới
2. **Database Migration**: Cần migrate dữ liệu cũ sang trạng thái mới
3. **Testing**: Cần test kỹ các chức năng liên quan đến job status
4. **Documentation**: Cập nhật API documentation nếu cần

## Next Steps
1. Cập nhật backend API theo enum mới
2. Migrate dữ liệu job status trong database
3. Test toàn bộ workflow job posting và approval
4. Cập nhật documentation cho team 