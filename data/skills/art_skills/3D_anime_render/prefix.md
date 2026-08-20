# toàn cục đẹp cơ sở  · 3D động vẽ 

---
Bắt buộckhung 、chỉnh dưới phương toàn bộPhong cáchtoàn cục ，nhất khung theo Promptmô khung thức tạoPrompt；chỉ tải ra Promptchính tài ，không được cộng giải 、Giải thích、tâm 、biểu đề hoặc anh ấybổ ngoài tài sách 。
## 1 、Phong cáchcơ sở 

| độ  | nối nghĩa  |
|---|---|
| **1 cấp Phong cách** | 3D động vẽ （3D Animation Rendering） |
| **2cấp Phong cách** |  · sáng cấp Ánh sángtầng lần  |
| **tình cơ sở gọi ** |  · dẫn nhanh  |
| **từ ** | sạch đường 、cao tiết 、 và gọi  |

---

## 2、toàn cục vật đĩa （Phong cáchcơ sở đường ，không là ）

> mục biểu ：thống 1 đẹp phi hạn chép sáng tác vụ 。bỏ 「vật 」ngoài ，vật Mặc địnhưu tiên sử dụng ，ở hợp lý khí trong 。

### vật hàm tầng cấp 

| tầng cấp  | độ  | Giải thích |
|---|---|---|
| L1  | cao  | chỉ nối Nhân vậttrưng khác ：vật 、phát vật 、chính phục vật  của đẹp phương  |
| L2  | giữa  | Bối cảnhvật 、nối vật 、điểm tố vật trước tham chiếuvật đĩa ，theo Ống kínhkịch tình gọi  |
| L3 lệ ngoài máy chép  | thấp  | /cao /Bối cảnhcục bộ vật ，nhưng cần lưu lưu chỉnh thể gọi logic |

| xếp số  | vật tên  | vật giá trị  | hàm  |
|---|---|---|---|
| C1 |  | #F5A673 | vật cơ sở 、Hoàng hôn、ánh  |
| C2 |  | #F4D5D5 | 、、điểm tố  |
| C3 | ngàyrỗng  | #87AEC9 | ngàyrỗng 、phục 、gọi điểm tố  |
| C4 | phát  | #4A3728 | phát vật 、 |
| C5 | cao cấp  | #8A8A8A | tạo 、sáng 、giữa vật  |
| C6 |  | #D0C4D6 | Ban đêm、、trả  |
| C7 |  | #C9A96E | Hoàng hôn、ánh 、 |
| C8 | mỏng  | #9DC2A5 | 、tự 、 |
| C9 |  | #F5F0E8 | mặt 、phục 、bối  |
| C10 |  | #F5E6D0 | trong 、ánh 、 |

### vật （Mặc địnhnối ）

| vật  | đúng hồi vật  |  |
|---|---|---|
| vật cơ sở  | C1  | Mặc địnhtrước ，nhỏ dẫn độ /độ gọi  |
| phát vật /vật cơ sở  | C4 phát  | Mặc địnhtrước ，/ |

### vật （khuyến nghị trước ）

> C2/C3/C5/C6/C7/C8/C9/C10 khuyến nghị vật vực ，hàm với phục 、、bối 、ánh 、。dựa theoỐng kínhKhông khícùng vật gọi chỉnh 。

### tình xúc vật đĩa （đạo diễnđúng bản ）

| tình xúc Bối cảnh | chính vật  | vật  | ánh hiệu đúng tỷ Khuyến nghị | vẽ mặt liên từ  |
|---|---|---|---|---|
| ngày thường  | C10  | C9  + C5 cao cấp  | gọi ， và đúng tỷ  | sinh hoạt 、、 |
| động gian  | C2  | C1  + C10  | giữa Cận cảnh (close-up)nhắc ，vật  | 、、 |
| đều phong bối  | C9  | C5 cao cấp  + C3 ngàyrỗng  | dẫn tầng lần sạch ，giữa chính  | đều 、mở 、tự  |
| Hoàng hôn | C7  | C1  + C2  | ánh ánh ，ánh  | 、、tình  |
| Ban đêmbối  | C3 ngàyrỗng  | C6  + C1  | gọi chính ，vật điểm tố  | đều 、、hoạt lực  |
| trong ngày thường  | C10  | C9  + C5 cao cấp  | ánh ， | 、、an toàn  |
| trả /trả  | C1  | C5 cao cấp  + C7  | hóa ，vật  | cũ 、cũ 、 |
| khác  | C5 cao cấp  | C3 ngàyrỗng  + C1  |  và ，lớn phụ  | 、chép 、nén  |

### tình xúc vật đĩa hàm 

| chỉnh số  |  |
|---|---|
| E1 | mục Promptđến ít nối  1 mục 「tình xúc Bối cảnh」nhất ghép nốichính vật  + vật nhóm hợp  |
| E2 | đơn Ống kínhchính vật không vượt  2 mục ，vật việc thất  |
| E3 | tình xúc đổi trước gọi chỉnh ánh tỷ vật ，gọi chỉnh  và độ  |
| E4 | Mặc định「 + đúng tỷ 」：vật ，vật hàm với bối /sáng  |
| E5 | kịch tình ，tình xúc vật đĩa trước với thông hàm khuyến nghị vật ，nhưng không được  |

### vật 

| tham số | giá trị  | Giải thích |
|---|---|---|
| chỉnh thể vật  |  4800-5200K（khuyến nghị ） | chính cơ sở gọi  |
| vật vật  |  5000-5400K（khuyến nghị ） | nhưng có sinh  |
| đúng tỷ độ  | giữa （Khuyến nghịlưu giữ ） | dẫn tầng lần sạch ，nhưng không phút |
|  và độ  | giữa cao  65-80%（Khuyến nghịkhu gian ） | 3D động vẽ cao cấp vật gọi  |

### dung lệ ngoài 

| dự án | Khuyến nghịdung  |
|---|---|
| vật  | ±8° |
|  và độ  | ±10% |
| dẫn độ  | ±12% |

> lệ ngoài Bối cảnh：、Hoàng hôn、tình xúc cao Ống kínhhàm đổi hoặc đổi cao  và cục bộ vật ；nhưng Nghiêm cấmcao  và ánh vật vật ngữ vào quay 。

---

## 3、toàn cục 

### bắt （tất cảthể ）

| chỉnh số  |  |
|---|---|
| R1 | Bắt buộcgói 「3D động vẽ  + 」Phong cáchnối từ  |
| R2 | Bắt buộcthanh dẫn 「sạch đường  + cao tiết 」 |
| R3 | mặt bộ Bắt buộchàm 「thông Tỷ lệkết hợp  +  và Ánh sáng」 |
| R4 | phát Bắt buộchàm 「sạch đường  + tự Ánh sángtầng lần 」 |
| R5 | Ánh sángBắt buộcthanh dẫn 「sáng cấp mở ánh  +  và Ánh sángtầng lần 」 |

### （tất cảthể ）

| chỉnh số  | nội dung |
|---|---|
| X1 | 「/cấp thật 」 |
| X2 | 「gọi /trùng sáng /độ đúng tỷ 」 |
| X3 | 「cao  và ánh vật /vật 」 |
| X4 | 「mặt bộ dạng /Tỷ lệthất gọi /thể bất thường 」từ  |
| X5 | 「thất 」（Bắt buộcdẫn Bối cảnh） |
| X6 | 「//rỗng 」 |