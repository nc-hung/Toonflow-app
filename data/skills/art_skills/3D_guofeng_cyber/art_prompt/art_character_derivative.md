---
name: art_character_derivative
description: 3Dphong ngườisinh Tài nguyêntạo · sổ tay
metaData: art_skills
---

# 3Dphong ngườisinh Tài nguyêntạo · sổ tay
## （phong truyền thống Bối cảnh+Đô Thị Hiện ĐạiBối cảnh đôi nối bản ）

---

## 1 、cộng gốc （đôi Bối cảnhthông hàm ）

1. **mặt dung không ** — cộng sau 5Bắt buộcmô toàn 1 ，Nghiêm cấmmặt dung 、dạng 、Phong cáchhóa sửa 
2. **thái không ** — lưu giữ mô tự trạm lập thái ，Nghiêm cấmthái /động tác vụ /thể thái hóa 
3. **tầng sát ** — tầng lập Mô tả，phong /phúttầng lập ，với theo tầng đổi （đổi không đổi 、đổi không đổi phong cơ sở ）
4. **Phong cáchthống 1 ** — tất cảphục hóa phục từ cùng 1 đẹp thể dòng ，**phong Bối cảnhphương truyền thống đẹp ，lượng Tùy chọnhợp ；đều Bối cảnhphong dạng chép cơ sở ，máy thể bảng **，toàn trình Nghiêm cấmphong rời đúng lập 
5. **không ** — cộng sau biểu không thấp với mô ，3D PBR、sáng cấp Ánh sángtoàn Bối cảnhthông hàm đường 
6. **thuần phục hóa ** — chỉ cộng dung /phát kiểu /phục /nối ，Nghiêm cấmvào Đạo cụ、Bối cảnh、、động tác vụ 
7. **đôi Bối cảnh1 nối ** — không dẫn /đều đường kiếm ，Mặc địnhdung thuần phong tạo；có dẫn /đều đường kiếm ，tự động khớpphong đều thể dòng ，không cần trùng cấu tầng logic

---

## 2、cộng tầng cấp （đôi Bối cảnhtoàn dung phúttầng kết cấu ）

| tầng cấp  | nội dung | đôi Bối cảnhnối Giải thích |
|---|---|---|
| L0 | mô  | cơ sở dạng tượng mô ，mặt dung 、thể thái 、trạm lập thái toàn nối ，phong /đều Bối cảnhthông hàm ，không sửa  |
| L1 | dung （Tầng quyết định） | trước phúttích hàm dùng đường kiếm ，quyết định「cơ sở  /  / chính thức  / máy thể  / đều thông 」độ Phong cách，phong riêng biệt truyền thống tạo 、đều riêng biệt ánh hiệu tạo 2thể dòng  |
| L2 | phát kiểu tạo kiểu  | phong phát /phát /chỉnh phát  + truyền thống phát /máy thể phát tệp ，phong truyền thống tạo kiểu 、đều lượng hóa tạo kiểu 2thể dòng ，cao độ phát biểu toàn Bối cảnhthông hàm  |
| L3 | giữa /trong  | đổi vật cơ sở giữa ，phong Bối cảnhhàm truyền thống giữa ，đều Bối cảnhhàm phong máy thể mặt trong ，vào sát đường 、ánh kèm  |
| L4 | ngoài /chính phục  | đôi nối tầng ：phong Bối cảnhhàm giữa thức truyền thống phục /phục /thường phục ；đều Bối cảnhhàm **phong dạng chép  của máy thể phục **（Bắt buộclưu lưu lập //đĩa /giữa thức kết cấu ），Nghiêm cấmkhông phong trong  của thuần thức máy thể phục  |
| L5 | nối  | truyền thống đầu ////tay  + phong máy thể nối /ánh nhóm tệp ，phong Bối cảnhhàm truyền thống nối chính 、lượng điểm tố ；đều Bối cảnhhàm phong +hợp nối ，toàn trình Nghiêm cấmthuần thức nối  |

> **giới **：ngườisinh Tài nguyênchỉ gói  L0–L5 tầng cấp （phục hóa tạo ），không gói Đạo cụ（////tay giữ ）、Bối cảnh（trong /ngoài /ngày）、thái động tác vụ （thi chạy /trả /tay ）。nàynhững biệt với anh ấyTài nguyênLoại của ；máy thể chỉ hạn L1-L5phục hóa tạo ，không được vượt ra giới sửa mô thể kết cấu 。

---

## 3、dung （L1·phong +đều đôi thể dòng ）

### mô đến sinh tạo （liên ）

> Nhân vậtmô ，nhưng sinh Tài nguyênMặc địnhtiến vào tạo trình 。dòng thống hồi dựa theohàm dùng nhắc nhà  của đường kiếm phúttích tạo cần cầu ，trước khớpphong /đều Bối cảnhbiệt ，ở đúng hồi tạo thể dòng trong quyết địnhđộ ，không dẫn Bối cảnhđường kiếm Mặc địnhphong thể dòng ，không được tự đổi 。

### L1 đường kiếm phúttích dung quyết định

| bước  | xử lý nội dung | quyết địnhkết quả |
|---|---|---|
| S1 | trích xuấthàm dùng đường kiếm ：mặt bộ trạng tháitừ 、tình xúc từ 、độ từ 、Phong cáchtừ 、Bối cảnhtừ （phong /đều ） | dạng tạo 「Bối cảnh+dung 」đôi độ cần cầu cần  |
| S2 | lọc phi dung đường kiếm ：Đạo cụ/Bối cảnh/động tác vụ /thái từ không tác vụ trên phụ liệu  |  |
| S3 | trước khớpphong /đều Bối cảnhthể dòng ，khớpdung Phong cáchnhất cho ra độ liệu  | phong thể dòng ：cơ sở  /  / chính thức ；đều thể dòng ：thông  / cấp vụ  / máy thể  |
| S4 | tạonhất  L1 Prompt | chỉ tải ra kết ，không tải ra phúttích trình  |

### đường kiếm đến dung （thực thicổng kính ·đôi Bối cảnhnối ）

| đường kiếm Loại | kiểu đường kiếm  | Bối cảnhkhớp | L1 quyết định |
|---|---|---|---|
| không dẫn Bối cảnh/mặt bộ gọi đường kiếm  | chỉ phục /phát kiểu hóa ，chưa gọi tình xúc trạng thái | phong Mặc định | cơ sở  |
| mặt bộ đường kiếm  | 、、、vật nhắc  | phong /đều thông hàm  | （） |
| dẫn phong ngày thường đường kiếm  | ngày thường 、giữa 、ngoài ra 、、tài ngườitập  | phong Bối cảnh | cơ sở （tự sạch ） |
| dẫn phong chính thức thức đường kiếm  | lớn 、、、trùng cần trường hợp  | phong Bối cảnh | chính thức （） |
| dẫn đều ngày thường đường kiếm  | thông 、đều ngày thường 、ra thi  | đều Bối cảnh | đều thông （sạch tự +lý ） |
| dẫn đều chính thức đường kiếm  | cấp vụ 、toàn sẽ thức 、đều  | đều Bối cảnh | đều cấp vụ （ánh +gọi ） |
| dẫn máy thể đường kiếm  | 、máy thể 、thi 、tác vụ 、、chưa  | đều Bối cảnh | máy thể （sát ánh hiệu ，phong hợp ） |

> nối gốc ：
> 1. tất cảsinh Tài nguyênđều cần có tạo ；trước xem Bối cảnhđường kiếm khớpthể dòng ，xem mặt bộ đường kiếm nối độ Phong cách，Đạo cụ、Bối cảnh、thái hóa không được đơn cao dung độ 
> 2. máy thể đường kiếm chỉ phát đều thể dòng dung ，không đúng hồi đường kiếm không được tự thêmánh hiệu dung 
> 3. phong Bối cảnhkhông dẫn đường kiếm ，Nghiêm cấmthêmánh hiệu /máy thể dung ，lưu thuần phong Bối cảnhtoàn nối 

### nữ dung Phong cách（đôi Bối cảnhtoàn ）

| thể dòng  | Phong cách | hàm Bối cảnh | Prompt |
|---|---|---|---|
| phong thể dòng  | sạch  | phong ngày thường 、、giữa 、tài ngườitập  | dung sạch 、、sạch  |
| phong thể dòng  |  | phong 、chính thức 、thực lực 、 | dung 、dạng 、vật  |
| phong thể dòng  |  | phong sẽ 、động 、Bối cảnh | 、đuôi 、vật  |
| phong thể dòng  | lớn  | phong lớn 、 | đẹp 、 |
| phong thể dòng  | tiết ngày  | phong tiết ngày 、sẽ  | vật dẫn 、dung  |
| đều thể dòng  | đều thông  | đều ngày thường 、thông 、ra thi  | sạch 、tự dạng 、、không bức vật  |
| đều thể dòng  | đều cấp vụ  | đều cấp vụ 、toàn sẽ thức 、chính thức trường hợp  | ánh gọi 、dạng 、、vật thấp  và  |
| đều thể dòng  | ánh  | đều thi 、Bối cảnh、máy thể  | đuôi ánh hiệu 、đường 、vật kèm ánh 、mặt sạch không dày trùng  |
| đều thể dòng  | máy thể gọi  | đều tác vụ 、thi động 、trường Bối cảnh | ánh gọi 、dạng 、、cục bộ ánh máy thể lý 、không bức ánh hiệu  |

### thông hàm （tất cảdung ·đôi Bối cảnh）

| dự án |  | Prompt |
|---|---|---|
|  | PBR、tự 、sát lý ，3Dtoàn Bối cảnhthống 1  | PBR、tự ánh 、 và 、lý  |
| độ  | cơ sở gọi 、thông không  | cơ sở gọi 、 |
| trong ánh  | từ trong ngoài ánh  | trong ánh 、thông phát ánh  |
| nối  | chỉ đều thể dòng thêmcấp đường 、ánh hiệu ，không được mô ；phong thể dòng hàm  | đường 、sát ánh hiệu 、tự hợp  |
| Nghiêm cấm | ánh ///ánh /、lớn mặt mô  của 、ánh 、phong Bối cảnhtự thêm | — |

### cơ sở hóa （phong Mặc địnhliệu ·đôi Bối cảnhthông hàm ）

| dự án |  | Prompt |
|---|---|---|
| bộ  | đang mô dạng ，không sửa kiểu  | tự 、dạng  |
| bộ  | bộ ，gọi sạch có  | bộ sạch 、sáng  |
| mặt  | vật nhắc ， | mặt vật tự 、 |
| bộ  | hoặc trau chuốt，lưu giữ chép  | vật tự 、vật  |
| chỉnh thể  | xem được ra có tạo ，nhưng phi thường  | cơ sở 、tự 、 và  |

### nam dung （đôi Bối cảnhnối ）

| thể dòng  | dự án |  | Prompt |
|---|---|---|---|
| phong thông hàm  |  | PBR、、sạch tự  | PBR、、tự ánh  |
| phong thông hàm  | Nguyên tắc cốt lõi | ——xem đang chưa hóa nhưng tốt  | 、ngàysinh tốt  |
| phong thông hàm  |  | tự 、không sửa mô dạng  | tự 、dạng  |
| phong thông hàm  | vật  | tự vật 、 | vật tự 、vật  |
| đều thể dòng  | nối  | chỉ thêmcục bộ ánh máy thể lý 、đường ，không bức ánh hiệu ，không dẫn đường kiếm hàm  | đường 、ánh máy thể lý 、không ánh  |
| đều thể dòng  | đều cấp vụ  | ánh sạch 、dạng 、không nhiều  | sạch ánh 、dạng 、 |

---

## 4、phát kiểu tạo kiểu （L2·phong +đều đôi thể dòng ）

### nữ tạo kiểu Loại（đôi Bối cảnhtoàn ）

| thể dòng  | tạo kiểu  | Mô tả | hàm Bối cảnh | Prompt |
|---|---|---|---|---|
| phong thể dòng  | cao  | cao đĩa phát  + truyền thống phát  | phong 、chính thức 、 | cao 、đĩa phát 、truyền thống giữa thức dạng chép  |
| phong thể dòng  | đôi  | đôi đúng 、ít nữ  | phong nămNhân vật、ngày thường  | đôi 、ít nữ Phong cách、giữa thức truyền thống tạo kiểu  |
| phong thể dòng  |  | thấp 、 | phong ngày thường 、、giữa  | 、、giữa thức truyền thống tạo kiểu  |
| phong thể dòng  | phát  | dài phát toàn 、tự  | phong giữa 、mật 、gian  | dài phát 、tự 、giữa thức truyền thống  |
| phong thể dòng  | phát cao đuôi  | cao 、 | phong 、thi động Bối cảnh | cao đuôi 、、giữa thức truyền thống phát  |
| phong thể dòng  | nửa phát  | phát nửa  + sau phương phát  | phong ngày thường 、ra thi  | nửa 、tự phát 、giữa thức truyền thống tạo kiểu  |
| đều thể dòng  | phong nửa thấp đuôi  | giữa thức nửa phát +thấp đuôi 、không  | đều thông 、ngày thường ra thi  | phong nửa thấp đuôi 、giữa thức chỉnh phát điểm tố 、ngày thường 、cao độ phát  |
| đều thể dòng  | phong cao máy thể  | giữa thức cao +máy thể kết cấu nối 、trong ánh kèm  | đều chính thức 、toàn 、máy thể Bối cảnh | phong cao máy thể 、hợp phát tệp nối 、trong sát ánh kèm  |
| đều thể dòng  | phong nửa máy chỉnh phát  | giữa thức 3chỉnh +máy thể chỉnh 、ánh điểm tố  | đều 、thi 、Bối cảnh | phong nửa máy chỉnh phát 、giữa thức chỉnh phát cơ sở 、máy thể chỉnh 、ánh điểm tố  |
| đều thể dòng  | phong cao đuôi  | giữa thức phát +cao đuôi 、máy thể phát nối  | đều máy thể 、thi động 、tác vụ Bối cảnh | phong cao đuôi 、giữa thức phát cơ sở 、máy thể phát nối 、 |

### nữ phát （đôi Bối cảnhnối ）

| thể dòng  |  | Prompt |
|---|---|---|
| phong thể dòng  | 、phục nối 、thuần truyền thống giữa thức ，không （không dẫn đường kiếm hàm ） | phát 、、phát 、đầy đầu 、 |
| đều thể dòng  | phong dạng chép 、phục nối 、truyền thống +máy thể hợp ，ánh hiệu sát  | phong phát 、、+hợp máy thể tệp 、sát ánh kèm 、toàn sáng điểm tố  |

### nam tạo kiểu Loại（đôi Bối cảnhtoàn ）

| thể dòng  | tạo kiểu  | hàm Bối cảnh | Prompt |
|---|---|---|---|
| phong thể dòng  | phát nửa  | phong ngày thường 、tài người、tập  | phát nửa 、phát 、giữa thức truyền thống tạo kiểu  |
| phong thể dòng  | toàn cao  | phong chính thức 、、 | toàn cao 、phát 、giữa thức truyền thống dạng chép  |
| phong thể dòng  | phát  | phong mật 、gian Bối cảnh | phát 、dài phát như 、giữa thức truyền thống  |
| phong thể dòng  | phát cao đuôi  | phong 、Bối cảnh | cao phát 、đuôi 、giữa thức truyền thống phát  |
| đều thể dòng  | phong máy thể nửa phát  | đều ngày thường 、thông 、cấp vụ Bối cảnh | phong máy thể nửa phát 、giữa thức phát cơ sở 、ánh hợp phát tệp 、 |
| đều thể dòng  | phong thấp đuôi phát  | đều 、ngày thường ra thi  | phong thấp đuôi phát 、giữa thức phát cơ sở 、máy thể phát 、tự  |
| đều thể dòng  | phong cao máy thể phát  | đều máy thể 、tác vụ 、thi Bối cảnh | phong cao máy thể phát 、giữa thức phát cơ sở 、toàn gói thức máy thể phát 、ánh  |

---

## 5、phục （L3+L4·đôi Bối cảnhnối tầng ）

### đường （đôi Bối cảnhthông hàm ·không ）
**tất cảphục Bắt buộcgiữa thức truyền thống dạng chép đúng **，phong Bối cảnhkhung giữa thức phục logic；đều Bối cảnhBắt buộclưu lưu lập //đĩa //đúng /lớn đến ít 1giữa thức kết cấu ，Nghiêm cấmra không phong trong  của thuần thức 、thuần máy thể 、thuần thức phục ，lưu phong +đều Bối cảnhphong cơ sở không thất 。

### nữ phục （đôi Bối cảnhtoàn ）

| thể dòng  | Phong cách | thức  | hàm Bối cảnh | Prompt |
|---|---|---|---|---|
| phong thể dòng  | phong ngày thường dài  | giữa thức dạng chép 、、truyền thống  | phong ngày thường 、giữa 、tập 、ra thi  | phong dài 、、、truyền thống kiểu 、nhiều tầng  |
| phong thể dòng  | phục  | giữa thức phục dạng chép 、lớn 、tầng 、 | phong 、chính thức 、、thực lực Bối cảnh | phong phục 、、giữa thức lớn 、đường 、tầng  |
| phong thể dòng  | thường phục  | giữa thức ngắn 、lập 、nhận 、không  | phong thi động 、、ra thi Bối cảnh | phong thường phục 、ngắn 、lập 、、 |
| phong thể dòng  |  | mỏng giữa 、vật 、rộng  | phong trong 、gian 、mật Bối cảnh | phong 、rộng 、mỏng 、vật  |
| phong thể dòng  | lớn  | dạng chép 、tầng 、truyền thống phục kiểu  | phong 、lớn  | phong lớn 、、tầng 、đường 、giữa thức phục dạng chép  |
| đều thể dòng  | phong thông thường phục  | giữa thức lập /、sửa ngắn 、máy thể mặt ghép tiếp 、ngày thường không bức  | đều ngày thường 、thông 、ra thi  | phong thông thường phục 、giữa thức lập 、sửa 、ánh máy thể mặt ghép tiếp 、、ngày thường  |
| đều thể dòng  | phong cấp vụ phục  | giữa thức đúng dạng chép 、sửa kết cấu 、cao cấp ánh mặt 、 | đều cấp vụ 、toàn sẽ thức 、chính thức trường hợp  | phong cấp vụ phục 、giữa thức đúng cơ sở 、cao cấp ánh mặt 、lập thể 、giữa thức kiểu 、thấp gọi  |
| đều thể dòng  | máy thể phong thường phục  | giữa thức ngắn +máy thể 、đĩa +、nhận 、 | đều thi động 、thi 、máy thể Bối cảnh | máy thể phong thường phục 、giữa thức ngắn 、máy thể ghép tiếp 、đĩa 、ánh máy thể mặt 、 |
| đều thể dòng  | phong lớn /phục  | giữa thức /phục dạng chép 、hợp lập thể kết cấu 、tầng 、sát ánh kèm  | đều lớn 、toàn 、trùng cần trường hợp  | phong phục 、giữa thức phục dạng chép 、3Dmở kết cấu ghép tiếp 、đường đường hợp 、sát ánh kèm  |
| đều thể dòng  | phong máy thể  | giữa thức giữa 、mỏng máy thể ghép tiếp 、rộng 、ánh lý  | đều trong 、gian 、mật Bối cảnh | phong máy thể 、giữa thức dạng chép 、rộng 、mỏng máy thể mặt ghép tiếp 、ánh lý  |

### nữ phục thông hàm （đôi Bối cảnhnối ）

| dự án |  | Prompt |
|---|---|---|
| chính vật  | phong Bối cảnhMặc địnhgiữa truyền thống vật gọi ；đều Bối cảnhnối thấp  và gọi vật 、sát vật điểm tố ，Nghiêm cấmcao  và nối vật  | giữa truyền thống vật gọi 、phong nối vật 、thấp  và vật 、sát vật điểm tố  |
|  | phong Bối cảnhMặc định++ánh mặt ；đều Bối cảnhghép tiếp ánh máy thể mặt 、cao phụ ánh mục 、3Dmở kết cấu tệp ，Bắt buộclưu lưu phong mặt cơ sở  | 、tiết 、phong Bối cảnhthuần truyền thống mặt ；đều Bối cảnhtruyền thống mặt máy thể mặt ghép tiếp 、3Dmở lập thể kết cấu  |
| lý  | phong Bối cảnhMặc địnhgiữa thức truyền thống kiểu ；đều Bối cảnhhợp truyền thống kiểu đường lý 、，lý vượt sạch ，Nghiêm cấmkhông phong trong  của thuần lý  | phục sạch 、lý vượt sạch 、phong Bối cảnhthuần giữa thức truyền thống kiểu ；đều Bối cảnhtruyền thống kiểu đường lý độ hợp  |
| bộ  | phong Bối cảnhMặc địnhphong /；đều Bối cảnhnối máy thể /kết cấu ，Bắt buộcgiữa thức dạng chép thống 1  | phong Bối cảnhđẹp 、；đều Bối cảnhphong điểm tố 、chỉnh thể dạng chép thống 1  |
| tầng lần  | nhiều tầng 、tầng lần phútdẫn 、phong trong ngoài logicthống 1 ，đều Bối cảnhmáy thể kết cấu không được xấu logic | nhiều tầng 、tầng lần phútdẫn 、giữa thức dạng chép logicthống 1  |
| ánh hiệu  | chỉ đều Bối cảnhthêmtrong thức ánh kèm ，ánh hiệu sát không 、không xấu phục ，không ；phong Bối cảnhkhông dẫn đường kiếm hàm  | đều Bối cảnhtrong ánh kèm 、sát ánh hiệu 、không 、phục tự hợp  |

### nam phục （đôi Bối cảnhtoàn ）

| thể dòng  | Phong cách | hàm Bối cảnh | Prompt |
|---|---|---|---|
| phong thể dòng  | tài người | phong ngày thường 、、tập 、ra thi  | phong tài người、dài dạng chép 、lập 、、truyền thống kiểu  |
| phong thể dòng  |  | phong 、、thi động Bối cảnh | phong 、dạng chép 、lập nhận 、mặt 、 |
| phong thể dòng  | phục phục  | phong 、、 | phong phục 、chính thức phục dạng chép 、lớn rộng 、mặt 、truyền thống kiểu  |
| phong thể dòng  | thường phục  | phong 、mật 、ngày thường ra thi  | phong thường phục 、Phong cách、mặt 、giữa thức lập 、rộng được thể  |
| phong thể dòng  | lớn phục  | phong chính thức 、、trùng cần trường hợp  | phong lớn phục 、、giữa thức phục dạng chép 、cao cấp mặt 、đường  |
| đều thể dòng  | phong cấp vụ thông  | đều ngày thường 、thông 、cấp vụ sẽ thức  | phong cấp vụ thông 、giữa thức lập cơ sở 、sửa 、cao cấp ánh mặt 、giữa thức kiểu 、được thể  |
| đều thể dòng  | phong máy thể  | đều ngày thường 、ra thi 、máy thể Bối cảnh | phong máy thể 、giữa thức ngắn 、máy thể mặt ghép tiếp 、đĩa 、rộng 、ngày thường trăm  |
| đều thể dòng  | máy thể  | đều thi động 、tác vụ 、thi Bối cảnh | phong máy thể 、giữa thức cơ sở 、ánh máy thể mặt 、lập thể kết cấu 、lập nhận 、 |
| đều thể dòng  | phong phục  | đều toàn 、chính thức trường hợp 、lớn  | phong phục 、giữa thức phục dạng chép 、mặt 、hợp kết cấu điểm tố 、truyền thống kiểu đường hợp  |

---

## 6、nối （L5·đôi Bối cảnhnối ）

### nữ nối （đôi Bối cảnhphútthể dòng ）

| thể dòng  | Loại |  | Prompt |
|---|---|---|---|
| phong thể dòng  | đầu  | 、không đơn mỏng 、thuần giữa thức truyền thống ，phát kiểu phục nối  | đầu 、đầy đầu 、phát 、bước 、 |
| phong thể dòng  |  | truyền thống /，chỉnh thể Phong cáchthống 1  | 、、、 |
| phong thể dòng  |  | truyền thống /，giữa thức truyền thống dạng chép  | đẹp 、、 |
| phong thể dòng  |  | truyền thống /，giữa thức truyền thống  | 、gian 、bước 、chỉnh  |
| phong thể dòng  | tay  | truyền thống /，giữa thức truyền thống dạng chép  | thông 、、 |
| đều thể dòng  | đầu  | phong dạng chép 、truyền thống +máy thể hợp ，phát kiểu phục nối ，ánh hiệu sát  | phong đầu 、+hợp máy thể tệp 、sát ánh kèm 、toàn sáng điểm tố 、 |
| đều thể dòng  |  | truyền thống +máy thể hợp ，ánh sát không bức  | phong máy thể 、+hợp 、sát ánh 、nhỏ  |
| đều thể dòng  |  | truyền thống +máy thể hợp ，giữa thức dạng chép  | phong máy thể 、kết cấu +hợp 、trong sát ánh 、hợp  |
| đều thể dòng  |  | truyền thống /+máy thể hợp ，、lập thể kết cấu  | phong máy thể 、rộng +ghép tiếp 、gian 、hợp 、phútdẫn  |
| đều thể dòng  | tay  | truyền thống +máy thể tay hợp ，giữa thức dạng chép ，không bức thiết tính  | phong máy thể tay 、thông +hợp 、sát ánh 、hợp  |

### nam nối （đôi Bối cảnhphútthể dòng ）

| thể dòng  | Loại |  | Prompt |
|---|---|---|---|
| phong thể dòng  | phát  | truyền thống /、、giữa thức truyền thống dạng chép ，phát kiểu phục nối  | phát 、phát 、、 |
| phong thể dòng  |  | truyền thống rộng /kèm 、giữa thức truyền thống dạng chép 、phútdẫn  | rộng 、kèm 、kèm hook 、phútdẫn  |
| phong thể dòng  |  | truyền thống thông 、giữa thức truyền thống ，gian  | gian 、thông 、 và 、 |
| phong thể dòng  | gian nối  | //chỉ hạn gian nối nối ，**Nghiêm cấmtay giữ Đạo cụ**，giữa thức truyền thống dạng chép  | gian nối nối 、、、không tay giữ tác vụ  |
| đều thể dòng  | phát  | truyền thống dạng chép +hợp máy thể 、ánh 、tạo mô ，phát kiểu phục nối  | phong máy thể phát 、giữa thức cơ sở 、ánh hợp 、、 |
| đều thể dòng  |  | truyền thống rộng dạng chép +máy thể kết cấu 、、lập thể 、phútdẫn  | phong máy thể 、giữa thức cơ sở 、ánh máy thể mặt 、hợp 、lập thể kết cấu  |
| đều thể dòng  |  | truyền thống dạng chép +lực ánh 、thông 、sát ánh ，gian  | phong ánh 、truyền thống dạng chép 、lực +、thông 、sát ánh  |
| đều thể dòng  | gian nối  | truyền thống dạng chép +máy thể ，chỉ hạn gian nối nối ，**Nghiêm cấmtay giữ Đạo cụ** | gian máy thể nối nối 、hợp 、không tay giữ tác vụ  |

---

## 7、phục hóa nhóm hợp tra （đôi Bối cảnhtoàn Bối cảnh）

| thể dòng  | Bối cảnh | dung  | phát kiểu  | phục  | nối  |
|---|---|---|---|---|---|
| phong thể dòng  | giữa ngày thường  | sạch  | phát /nửa phát  | phong ngày thường dài  | giữa （truyền thống nối ） |
| phong thể dòng  | lần /tập  | sạch  | nửa phát / | phong ngày thường dài  | giữa nhiều （truyền thống nối ） |
| phong thể dòng  | động  |  | nửa phát / | phong ngày thường dài /thường phục  | giữa  |
| phong thể dòng  | chính thức  |  | cao  | phong phục  | （truyền thống nối ） |
| phong thể dòng  | gian mật  | sạch / | phát / | phong  | （không nhiều nối ） |
| phong thể dòng  | lớn  | lớn  | cao  | phong lớn  | （toàn nối ） |
| phong thể dòng  | /thi động  | （） | phát cao đuôi  | phong thường phục / | （chỉ cơ sở nối nối ） |
| đều thể dòng  | đều thông ngày thường  | đều thông  | phong nửa thấp đuôi  | phong thông thường phục  | giữa thấp （phong máy thể nối ） |
| đều thể dòng  | đều cấp vụ chính thức trường hợp  | đều cấp vụ  | phong máy thể nửa phát  | phong cấp vụ phục  | giữa （thấp gọi phong máy thể nối ） |
| đều thể dòng  | đều toàn  | /ánh  | phong cao máy thể  | phong phục  | （phong +hợp nối ） |
| đều thể dòng  | đều thi /máy thể tác vụ  | máy thể gọi  | phong cao đuôi  | máy thể phong thường phục /máy thể  | （chỉ máy thể nối nối ） |
| đều thể dòng  | đều sẽ  | /ánh  | phong nửa máy chỉnh phát  | phong thông thường phục /máy thể thường phục  | giữa （ánh phong nối ） |
| đều thể dòng  | gian mật Bối cảnh | sạch  | phát /thấp đuôi  | phong máy thể  | （không nhiều nối ） |
| đều thể dòng  | đều lớn  | lớn  | phong cao máy thể  | phong lớn phục  | （phong +hợp toàn nối ） |

---

> **🔍 chưa Bối cảnhkhuyến （đôi Bối cảnhthông hàm ）**
>
> khi hàm dùng Mô tả của Bối cảnh/tình không ở trên bảng ，dựa theosách Phong cáchcơ sở tự thi khuyến ，**trước nối phong /đều Bối cảnhthể dòng ，khớpđúng hồi độ **：
>
> | khuyến độ  | phong thể dòng cơ sở  | đều thể dòng cơ sở  |
> |---|---|---|
> | dung độ  | Mặc địnhsạch ；/thực lực /chính thức →；động /→；lớn /→lớn ；tiết ngày sẽ →tiết ngày  | Mặc địnhđều thông ；cấp vụ /chính thức →đều cấp vụ ；động /→；/lớn →；/máy thể /thi →ánh /máy thể gọi  |
> | phát kiểu  | ngày thường /giữa →nửa phát hoặc ；/chính thức /→cao ；mật /Ban đêm→phát ；/thi động →phát cao đuôi  | ngày thường /thông →nửa thấp đuôi ；cấp vụ /chính thức →máy thể nửa phát ；/lớn →cao máy thể ；mật /Ban đêm→phát /thấp đuôi ；máy thể /thi động →cao đuôi  |
> | phục  | giữa thức truyền thống dạng chép đúng ；tình Bối cảnh→dài ；thực lực /chính thức →phục ；thi động →thường phục ；PBRban đầu nối ；thuần giữa thức truyền thống kiểu Mặc định | giữa thức dạng chép đúng cơ sở ；ngày thường /thông →phong thông thường phục ；cấp vụ /chính thức →phong cấp vụ phục ；thi động /máy thể →máy thể thường phục ；PBRban đầu nối ；truyền thống kiểu đường lý hợp Mặc định |
> | nối độ  | ngày thường →giữa ；chính thức /→；mật →；thi động →；thuần truyền thống giữa thức nối  | ngày thường →giữa thấp ；cấp vụ /→；mật →；thi động →；phong +hợp nối ，ánh hiệu sát  |
> | cơ sở  | PBR+sáng cấp ánh ban đầu nối ；thể ánh trước với mặt ；không ánh hiệu （không dẫn đường kiếm hàm ） | PBR+sáng cấp Ánh sángban đầu nối ；thể ánh trước với mặt ；ánh hiệu trong sát ，Nghiêm cấm；phong độ hợp ，không rời  |

## 8、4video ảnh thiết nối ảnh （đôi Bối cảnhthông hàm ·3Dbiểu thống 1 ）

> sinh phục hóa cộng sau cần tải ra 4video ảnh thiết nối ảnh ，lưu phục hóa tạo 、kiểu 、ánh hiệu 、kết cấu tệp ở các nhân độ  của toàn 1 ，phong /đều Bối cảnhthông hàm 。

### video ảnh nối nghĩa 

| vị trí trí  | video ảnh  | nhân độ  | Cỡ cảnh | Yêu cầu | Prompt |
|---|---|---|---|---|---|
| trái 1  | ngườiĐặc tả (close-up) | chính mặt video  | mặt bộ đến  | mặt bộ 60%+，5/dung /hiệu tiết 100%sạch  | portrait closeup、face detail、makeup detail |
| trái 2 | chính video ảnh  | chính mặt  0° | toàn lập  | mặt đúng Ống kính、phục chính mặt toàn 、kết cấu /kiểu /ánh kèm vị trí trí sạch  | front view、height mark、costume detail |
| phải 2 | video ảnh  | phải  90° | toàn lập  | thuần mặt 、phục mặt tầng lần 、kết cấu mặt dạng thái sạch  | side view、profile、height mark、costume profile detail |
| phải 1  | sau video ảnh  | sau phương  180° | toàn lập  | sau phát /bộ phục /phát đuôi /bộ kết cấu sạch  | back view、rear view、height mark、rear costume detail |

### vẽ mặt （đôi Bối cảnhthông hàm ·không ）

| dự án |  |
|---|---|
| cục  | cùng 1 vẽ mặt từ trái đến phải nhất sắp 4video ảnh ，phong /đều Bối cảnhthông hàm cục  |
| bối  | thuần vật  #B8B8B8，**Nghiêm cấmthêmBối cảnh//ngày**，phong /đều Bối cảnhthông hàm  |
| trạm  | tự trạm lập 、đôi thi phút、đôi tự dưới hoặc （**Nghiêm cấmthái hóa **），phong /đều Bối cảnhthông hàm  |
| bảng tình  | hợp dung Phong cách của bảng tình ，chỉ hạn mặt bộ bảng tình ，không thể động tác vụ ，phong /đều Bối cảnhthông hàm  |
| ánh đường  | thông hàm biểu ：ánh ，trước phương chính ánh  + đôi bổ ánh ，không sáng ；đều Bối cảnhcộng sát tự phát ánh phụ ，không xấu chỉnh thể Ánh sángthống 1 ，không  |
| 1  | 4video ảnh  của mặt dung /dung /phát kiểu /phát /phục /nối /kiểu /ánh hiệu /kết cấu tệp toàn 1 ，không  |
| vẽ mặt Tỷ lệ | Khuyến nghị 4:1 hoặc  3:1，phong /đều Bối cảnhthông hàm  |
| 3Dbiểu  | toàn Bối cảnhthống 1 cao độ tạo mô 、PBR、8Kvượt cao sạch 、sáng cấp ，phong /đều Bối cảnhkhông bất  |

---

## 9、Promptmô （đôi Bối cảnh1 nối ·3Dphong riêng hàm ）

### Định Dạng Đầu Ra（đôi Bối cảnhthông hàm ·）

| dự án |  |
|---|---|
| tải ra nội dung | **chỉ tải ra Prompttài sách **，không tải ra anh ấynội dung |
| Nghiêm cấmtải ra  | tra bảng 、phúttầng cấu tạo phương 、trực quanbảng 、Nghiêm cấmviệc bảng 、sinh phương 、tải ra Khuyến nghị、cần bảng 1 phi Promptnội dung |
| Nghiêm cấmBối cảnh | ngườisinh Tài nguyên**không gói Bối cảnh/Mô tả**，không tải ra Bối cảnh//ngày/bối việc nội dung（Bối cảnhbiệt với Bối cảnhTài nguyên） |
| Nghiêm cấmĐạo cụ | **không gói Đạo cụtác vụ **，không tải ra /////tay giữ hoặc tác vụ （Đạo cụbiệt với Đạo cụTài nguyên） |
| Nghiêm cấmthái hóa  | **không sửa mô thái **，không tải ra thi chạy /trả /tay //động tác vụ hoặc thể thái hóa ，lưu giữ tự trạm lập  |
| khung thức  | trực tiếp tải ra hàm  của Promptmã ，không cần biểu đề 、bảng khung 、giải 、phương đúng tỷ  |

### chỉnh phục hóa cộng （4video ảnh ·đôi Bối cảnh1 nối ）

```
Nhân vậtcơ sở dạng tượng ảnh ảnh ，img2imgcộng phục hóa tạo ，
3Dphong Phong cách，{Bối cảnhthể dòng ：phong /đều }，cao độ tạo mô ，PBR，giữa thức đẹp ，{phong lượng hợp /đều máy thể hợp }，sáng cấp Ánh sáng，
phong {khác }Nhân vật4video ảnh thiết nối ảnh ，3D，cao tạo mô ，8K，vượt lưu thật 
character design sheet, character turnaround,
lưu giữ cơ sở dạng tượng mặt dung toàn 1 、tự trạm lập thái không ，{chỉnh thể },
【L1·dung 】dựa theohàm dùng đường kiếm quyết định：{cơ sở //chính thức /đều thông /cấp vụ /máy thể }；hàm  {dung Phong cách}, PBR, {}, {}, {}, {sát ánh hiệu /đường （theo cần thêm）},
【L2·phát kiểu 】{tạo kiểu Loại}, cao độ phát sạch , {phát Mô tả}, phong dạng chép ,
【L3+L4·phục 】{chính vật }{thức }, {}, {}, {truyền thống kiểu /truyền thống kiểu đường lý hợp }, phục sạch , PBR, {trong sát ánh kèm （theo cần thêm）},
【L5·nối 】{đầu }, {}, {}, {}, {tay }, phong dạng chép , phục hóa Phong cáchthống 1 ,
cùng 1 vẽ mặt trái đến phải nhất sắp ：ngườiĐặc tả (close-up)+chính video ảnh +video ảnh +sau video ảnh ,
tự trạm lập , thuần vật bối , ánh , không sáng , {ánh hiệu sát không （theo cần thêm）},
4video ảnh mặt dung /dung /phát kiểu /phục /nối /kiểu /ánh hiệu toàn 1 , 3Dphong tạo mô sạch , cao độ tạo mô sạch ,
ảnh giữa không cần có tài chữ 
```

---

## 10、（đôi Bối cảnhthông hàm ·bắt +）

### bắt （100%thực thi，không lệ ngoài ）

| chỉnh số  |  |
|---|---|
| R1 | cộng sau mặt dung Bắt buộcmô toàn 1 ，Nghiêm cấm5、dạng 、Phong cáchhóa sửa  |
| R2 | phục Bắt buộchàm 「phục sạch  + PBR」，không được xấu phục cơ sở phong dạng chép  |
| R3 | toàn Bối cảnhBắt buộcgiữa thức phong dạng chép đúng ，phong Bối cảnhthuần truyền thống phong ，đều Bối cảnhphong cơ sở không thất ，Nghiêm cấmkhông phong trong  của thuần thức thiết tính  |
| R4 | dung /phát kiểu /phục /nối /Phong cáchtoàn thống 1 ，Nghiêm cấmphong rời đúng lập  |
| R5 | Bắt buộctải ra 4video ảnh thiết nối ảnh （ngườiĐặc tả (close-up)+chính video ảnh +video ảnh +sau video ảnh ），phong /đều Bối cảnhthông hàm  |
| R6 | Bắt buộcnối 「thuần vật bối 」，Nghiêm cấmthêmBối cảnh//ngày，phong /đều Bối cảnhthông hàm  |
| R7 | Bắt buộcnối 「4video ảnh 1 」，tất cảphục hóa 、kiểu 、ánh hiệu 、kết cấu tệp ở 4video ảnh giữa toàn thống 1  |
| R8 | **chỉ tải ra Prompt**——Nghiêm cấmtải ra tra bảng /phúttầng phương /trực quan/Nghiêm cấmviệc /sinh phương /tải ra Khuyến nghịphi Promptnội dung |
| R9 | **Nghiêm cấmgói Bối cảnhMô tả**——ngườisinh Tài nguyênkhông Bối cảnh//ngày/bối việc ，Bối cảnhbiệt với lập Tài nguyênLoại |
| R10 | **Nghiêm cấmĐạo cụtác vụ **——không gói tay giữ /tác vụ （///），Đạo cụbiệt với lập Tài nguyênLoại，gian nối nối bỏ ngoài  |
| R11 | **thái lưu giữ không **——Bắt buộclưu giữ mô tự trạm lập thái ，Nghiêm cấmđộng tác vụ /thể thái /hóa  |
| R12 | **L1 Bắt buộctrước phúttích quyết định**——trước giải tích hàm dùng Bối cảnhđường kiếm 、mặt bộ đường kiếm 、Phong cáchđường kiếm ，khớpđúng hồi thể dòng ，nối dung liệu vị trí  |
| R13 | **tất cảsinh Tài nguyêncần tạo **——chính thường tình huống không lưu giữ ，đến ít hàm cơ sở  |
| R14 | **trên độ sát **——trên cũng cần chép ，không được ra /bức /ánh hiệu  |
| R15 | **Đạo cụ/Bối cảnh/động tác vụ không tác vụ độ cấp phụ liệu **——chỉ Đạo cụ，，động tác vụ thông tinkhông được đem cơ sở cao đổi dung  |
| R16 | **đôi Bối cảnhnối **——không dẫn /đều đường kiếm ，Mặc địnhdung thuần phong tạo；có dẫn đường kiếm ，khớpđều thể dòng ，không được tự đổi  |
| R17 | **khung sát **——chỉ đều thể dòng hàm ánh hiệu /máy thể ，phong Bối cảnhkhông dẫn đường kiếm hàm ；tất cảBắt buộcphong độ hợp ，Nghiêm cấmrời  |
| R18 | **chỉ hạn phục hóa **——máy thể kết cấu tệp 、ánh hiệu chỉ hạn phục hóa nối tầng cấp ，không được sửa mô  của 5、thể kết cấu cơ sở thể thái  |
| R19 | **3Dtoàn Bối cảnhthống 1 **——phong /đều Bối cảnhBắt buộclưu giữ thống 1  của cao độ tạo mô 、PBR、sáng cấp Ánh sángbiểu ，không được ra cấp  |

### （100%Nghiêm cấm，không lệ ngoài ）

| chỉnh số  |  |
|---|---|
| X1 | cộng sau mặt dung 、5dạng 、mô không 1  |
| X2 | phục thất phong dạng chép ，ra không giữa thức trong  của thuần thức 、thuần máy thể phục 、thuần thức thiết tính  |
| X3 | dung /phục /Phong cách、ra rời ，phong đúng lập  |
| X4 | lời Bối cảnhbối （Bắt buộcthuần vật ），Nghiêm cấmthêm/Bối cảnh/ngày |
| X5 | 4video ảnh gian phục hóa tạo 、kiểu 、ánh hiệu 、kết cấu tệp không 1  |
| X6 | tải ra Promptngoài  của nội dung（bảng khung /phương /Khuyến nghị/giải /thể ） |
| X7 | ở ngườisinh Tài nguyêngiữa cộng vào Bối cảnhMô tả（bối /bối /trong /đạo /ngày） |
| X8 | tải ra 「cần tra 」「phúttầng cấu tạo phương 」「trực quan」「Nghiêm cấmviệc 」「sinh phương 」Chương |
| X9 | cộng vào Đạo cụtác vụ （tay giữ /////） |
| X10 | sửa mô thái （thi chạy /trả /tay ///thấp đầu /động tác vụ Mô tả） |
| X11 | cộng vào bảng tình thái kết động Mô tả（như 「45°thi chạy nhân 」việc mô ） |
| X12 | chưa phúttích hàm dùng đường kiếm thì trực tiếp hàm nối dung /，tự đổi phong /đều thể dòng  |
| X13 | lỗilưu giữ ，dẫn sinh Tài nguyênít hồi có tạo  |
| X14 | chỉ Đạo cụ/Bối cảnh/động tác vụ từ đem dung cấp ，dẫn tạo độ quyết địnhlỗi |
| X15 | phong Bối cảnhkhông dẫn đường kiếm ，tự thêmánh hiệu /máy thể ，xấu phong Không khí |
| X16 | ánh hiệu 、、lớn mặt ，xấu vẽ mặt ngườimặt dung 、phục hóa tiết  |
| X17 | tự sửa mô thể kết cấu 、5dạng thái ，thêmphi phục hóa  của nghĩa thể sửa tạo 、thể  |
| X18 | đều Bối cảnhthất phong cơ sở ，ra thuần thức Phong cách，giữa thức dạng chép  |
| X19 | ra thấp 、bức 、không hợp phương đẹp  của thức thiết tính ，phong đẹp  |

---

## ✅ đối chiếu tạo Giải thích
1. **đôi Bối cảnh100%nối **：chỉnh tạo 「phong truyền thống thể dòng 」+「đều thể dòng 」2nhất thi ，không dẫn đường kiếm đẹp tạothuần phong nội dung，có đều đường kiếm tạophong nội dung，không 
2. **phong cơ sở 0**：toàn sổ tay「giữa thức dạng chép đúng 」 của đường ，đều Bối cảnhtất cảphục 、phát kiểu 、nối lưu lưu phong trong ，thuần thức 
3. **hợp sát hóa **：phút「Tùy chọnlượng 」 và 「đều hóa 」，giới sạch ，không sẽ ra phong Bối cảnhđộ hóa 、đều Bối cảnhphong thất  của hỏi đề 
4. **3Dbiểu toàn thống 1 **：phong /đều Bối cảnhhàm 1 cao độ 3Dbiểu ，PBR、Ánh sáng、tạo mô độ không bất ，lưu tạohiệu quả nối 
5. **không **：chỉnh lưu lưu gốc sổ tay của 「mặt dung không 、thái không 、tầng sát 、thuần phục hóa 」，tối ưusau không xấu gốc sổ tay của tầng logic
6. **toàn Bối cảnhkhông nhân **：bổ toàn phong +đều toàn phútBối cảnh của phục hóa nhóm hợp 、khuyến 、Promptmô ，trực tiếp địa hàm ，không cần 2lần gọi chỉnh 