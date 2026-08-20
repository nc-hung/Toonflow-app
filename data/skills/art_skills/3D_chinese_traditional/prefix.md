# toàn cục đẹp cơ sở  · phong 3D

---
Bắt buộckhung 、chỉnh dưới phương toàn bộPhong cáchtoàn cục ，nhất khung theo Promptmô khung thức tạoPrompt；chỉ tải ra Promptchính tài ，không được cộng giải 、Giải thích、tâm 、biểu đề hoặc anh ấybổ ngoài tài sách 。

## 1 、Phong cáchcơ sở 

| độ  | nối nghĩa  |
|---|---|
| **1 cấp Phong cách** | phong 3D（Chinese Style 3D） |
| **2cấp Phong cách** | cao độ 3Dtạo mô  · truyền thống phương đẹp  |
| **tình cơ sở gọi ** | lớn 、ý 、 |
| **từ ** | PBR、thể ánh 、ánh  |

---

## 2、toàn cục vật đĩa （Phong cáchcơ sở đường ）

### vật hàm tầng cấp 

| tầng cấp  | độ  | Giải thích |
|---|---|---|
| L1  | cao  | giữa truyền thống vật cơ sở đường 、3Dvật  |
| L2  | giữa  | Bối cảnhvật 、phục vật 、điểm tố vật theo kịch tình gọi  |
| L3 lệ ngoài máy chép  | thấp  | Bối cảnh/tiết ngày cục bộ vật  |

### vật đĩa 

| xếp số  | vật tên  | vật giá trị  | hàm  |
|---|---|---|---|
| C1 | tháng | #E0E8F0 | ngàyrỗng 、、vật  |
| C2 |  | #4A8C7E | 、、 |
| C3 |  | #B22222 | tạo 、cổng 、Bối cảnh |
| C4 |  | #3B4B7C | rỗng 、、vật gọi  |
| C5 |  | #D4AF37 | 、kiểu 、cao ánh  |
| C6 |  | #1C1C1C | đường mục 、、bộ  |
| C7 |  | #A94A5F | ngườivật 、vật 、 |
| C8 |  | #965E3E | tạo 、địa mặt 、gọi  |
| C9 |  | #F0E442 | điểm tố 、、ánh  |
| C10 |  | #B8B8B8 | 、、giữa gian gọi  |

### vật （Mặc địnhnối ）

| vật  | đúng hồi vật  |  |
|---|---|---|
| chỉnh thể vật gọi  | giữa truyền thống vật gọi chính  | Nghiêm cấmcao  và ánh vật  |
|  | PBRlý  | Nghiêm cấm/không  |
| Ánh sángphương  | tự ánh  + ngườiánh kết hợp  | Nghiêm cấmđơn ánh nguồn ánh  |

### tình xúc vật đĩa 

| tình xúc Bối cảnh | chính vật  | vật  | ánh hiệu đúng tỷ Khuyến nghị | vẽ mặt liên từ  |
|---|---|---|---|---|
|  | C3  + C5  | C1 tháng + C6  | ánh dẫn ，cao ánh gọi ，bối tầng lần  | 、、phái  |
| ý  | C2  + C1 tháng | C4  + C10  |  và thể ánh ，bối hóa ，Không khí | ý 、、rỗng  |
|  | C7  + C1 tháng | C5  + C10  |  và ánh ，cục bộ cao ánh ，Cận cảnh (close-up)Đặc tả (close-up) | đẹp 、、 |
|  | C6  + C4  | C8  + C10  | gọi sáng ，ánh đúng tỷ ，Không khínén  | 、、 |
| tiết ngày  | C3  + C9  | C5  + C7  | cao  và ánh ，toàn cục cao ，vật  | 、nhanh 、lớn  |
| thángsạch  | C4  + C1 tháng | C6  + C5 điểm tố  | vật gọi thángánh ，cục bộ ánh ，dẫn đúng tỷ  | 、sạch 、đẹp  |

### vật 

| tham số | giá trị  | Giải thích |
|---|---|---|
| chỉnh thể vật  | giữa  4800-5500K（khuyến nghị ） | tự ánh chính cơ sở gọi  |
| đúng tỷ độ  | giữa  45-65%（Khuyến nghịkhu gian ） | tầng lần  |
|  và độ  | giữa cao  55-75%（Khuyến nghịkhu gian ） | truyền thống vật đĩa đầy  |

### dung lệ ngoài 

| dự án | Khuyến nghịdung  |
|---|---|
| vật  | ±8° |
|  và độ  | ±10% |
| dẫn độ  | ±12% |

---

## 3、toàn cục 

### bắt （tất cảthể ）

| chỉnh số  |  |
|---|---|
| R1 | Bắt buộcgói 「3DPhong cách」Phong cáchnối từ  |
| R2 | Bắt buộcthanh dẫn 「PBR + cao độ tạo mô 」 |
| R3 | Bắt buộcthanh dẫn 「giữa truyền thống vật  + phương đẹp 」 |
| R4 | Bắt buộcthanh dẫn 「sáng cấp Ánh sáng」 |
| R5 | Bắt buộcthanh dẫn 「phong 3Dđẹp 」 |

### （tất cảthể ）

| chỉnh số  | nội dung |
|---|---|
| X1 | 「sáng /cấp thật 」 |
| X2 | 「cao  và ánh vật /vật /số mã 」 |
| X3 | 「phương //」 |
| X4 | 「thấp độ tạo mô /ảnh /」 |
| X5 | 「vật /Ánh sánglỗi/video lỗi」 |