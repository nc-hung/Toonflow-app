---
name: storyboard_table_techniques
description: >-
  thông hàm Bảng phân cảnhthức tham chiếu。
  Phân cảnhphútgốc 、nối trường Ống kínhhợp nhất 、trực quan、chữ đoạn 、chuyển trường Phân cảnhthiết tính thông hàm thức ，nhà  Agent kích hoạt hàm 。
---
# Bảng phân cảnhthông hàm thức 

sách tài liệu Bảng phân cảnhthiết tính  của thông hàm thức tham chiếu，hàm với tất cảcần cần cấu tạo Bảng phân cảnh của  Agent Bối cảnh。

---

## Phân cảnhphútgốc 

**mới Phân cảnh**：Bối cảnh/địa điểm đổi 、thời gian、Ống kínhchính thể đổi 、Cỡ cảnhdẫn hóa 、trùng cần động tác vụ tiết điểm 

**không cần mới **：cùng vẽ mặt trong đúng lời 、bảng tình hoặc nhỏ động tác vụ 

độ ：một lập vẽ mặt  = 1 mục Phân cảnh， 50~100 chữ Kịch bảnđúng hồi  1~2 mục Phân cảnh。/chuyển trường như có dẫn mô cũng đơn phút。

---

## nối trường Ống kínhhợp nhất （）

**nối trường Ống kính**：mục mới Bối cảnh/đoạn  của nối trường nhất nhiều  1~2 mục Ống kínhtạo ，Nghiêm cấmtạo  3 mục trên 。
- khuyến nghị thức ：1 mục kèm khuyến  của Viễn cảnh (extreme wide shot)（nối trường +chính thể vào 1 quay tạo ），hoặc  1 mục lớn Viễn cảnh (extreme wide shot)nối trường  + 1 mục Toàn cảnh (wide shot)vào chính thể 
- Nghiêm cấmthức ：trước rỗng quay →cục bộ tiết →ngườiđến  của 3đoạn thức 

**Ống kínhhợp nhất tự kiểm **：
- thể 1 quay tác vụ  của không 2quay ——như quả một kèm Góc quay của Ống kínhthể cùng tạo nối trường +vào ，không cần tạo 2mục 
- Mô tảcùng 1 rỗng gian không cùng cục bộ  của Ống kính（cổng →→）hồi hợp nhất một Ống kính，hàm Mô tả hình ảnhnhiều tầng rỗng gian 
- thuần Ống kính（chỉ nhở tiết không việc Đẩy tới (push in / dolly in)）hồi hợp nhất đến có việc công thể  của Ống kínhgiữa 
- **đạo diễnkiểm chiếu **：sau tự kiểm ——như quả một thật ngườiđạo diễnsẽ đem  2~3 mục Ống kínhhợp tạo  1 mục ，Giải thíchđược ，hồi hợp nhất 

**1 quay đến **：khi Ống kính của gian lưu ở **động tác vụ hóa 、Bối cảnhđộ hóa （cùng Bối cảnhtrong vị trí ）、hoặc nhân độ **，ở  `cameraMove` hoặc  `description` giữa biểu tâm 「1 quay đến 」，nhiều mục Ống kínhhợp một Góc quaydài Ống kính。
- **hàm Bối cảnh**：Nhân vậtthi chạy rỗng gian 、động tác vụ từ Ađiểm đến Bđiểm 、Quay vòng (orbiting / surround)Nhân vậtnhở 、nối trường khuyến đến chính thể Đặc tả (close-up)
- **biểu tâm cách thức**：ở  `cameraMove` giữa dẫn Góc quayđường dẫn（như "1 quay đến ：khuyến Viễn cảnh (extreme wide shot)→đến trong →Toàn cảnh (wide shot)"），ở  `description` giữa Mô tả và  của vẽ mặt nội dung
- **Thời lượngmở rộng **：1 quay đến Ống kínhthông tinlượng giữ cập nhật，đơn quay  6s trên hạn ，nhưng không vượt  12s
- **phong nhắc nhở **：1 quay đến sẽ nhắc cao vẽ mặt tạo của độ （Yêu cầucao ），chỉ ở việc nhận dẫn lớn với hàm ，không hàm 

** 6 giây**：Không có lời thoạiỐng kínhtính vượt  6s chưa ra mới thông tin（Lời thoại/động tác vụ /chính thể hóa ），tâm ý lực 。nối trường +loại Ống kínhtâm ý ，hợp nhất nén nhỏ cũng không cần 

---

## trực quan（Phân cảnhthiết tính toàn trình ）

**① động tác vụ **：Ống kínhgian Nhân vật của vị trí trí 、động tác vụ Tiến độ、Bắt buộclý logic1 。trên 1 quay tay đến nửa rỗng →dưới 1 quay Bắt buộctừ nửa rỗng trạng tháitiếp ，không thể nhận trả 。

**② Cỡ cảnhtiến thức **：Cỡ cảnhđổi tiến hoặc tiến mở ——
- tiến ：Viễn cảnh (extreme wide shot)→Toàn cảnh (wide shot)→Trung cảnh (medium shot)→Cận cảnh (close-up)→Đặc tả (close-up)（tình xúc nhận ）
- tiến mở ：Đặc tả (close-up)→Cận cảnh (close-up)→Trung cảnh (medium shot)→Viễn cảnh (extreme wide shot)（tình xúc mở ）
- Nghiêm cấmkhông việc lý do  của cùng Cỡ cảnh（ 3 quay trên cùng Cỡ cảnh = trực quan）

**③ video **：180độ đường gốc ——đúng lời /đúng Bối cảnhgiữa Nhân vậtvẽ mặt vị trí trí toàn nối cùng ，không được 

**④ rỗng gian logic**：đúng lời đôi phương mặt ，thao tác vụ mặt ，tâm video phương mặt phương 。Nghiêm cấmkhông khác mặt Ống kính

**⑤ thông tinsát chép ý trưng **：quay buộc ý trưng đến "báo đạo sao、không báo đạo sao"——
- cho tay không cho  = ；trước thanh sau vẽ  = kỳ ；chỉ cho sáng  = ；toàn nhở  = cao 

**⑥ tiết mật độ **：đơn Ống kínhđộng tác vụ /sự kiệnsố lượng buộc Thời lượngkhớp，vào nhiều nội dung——
- 1 mục lý động tác vụ  = 1 ，1 lần Góc quay = 1 ，1 câu ngắn Lời thoại（≤10 chữ ）= 1 
- 2~3s Ống kính：nhất nhiều  1 ；4~6s Ống kính：nhất nhiều  2 ；7s+ Ống kính：nhất nhiều  3 

**⑦ đầu đuôi an toàn khu **：quay  của trước  0.5s  và sau  0.5s an toàn khu ，không mở liên động tác vụ hoặc Lời thoạiban đầu điểm 。trước  0.5s hàm với tạo lập hoặc chính thể thái ，sau  0.5s hàm với động tác vụ tự nhận 。

---

## chữ đoạn 

**description**（Mô tả hình ảnh）：1 câu lời Mô tảvẽ mặt nội dung（15~50 chữ ），gói thấy  của **chính thể  + động tác vụ /trạng thái + rỗng gian **，không lý hoạt động 。cần thể rỗng gian tầng lần （trước bối /Trung cảnh (medium shot)/bối đến ít 2tầng ）。như "trước bối ，Trung cảnh (medium shot)""tạo dưới ，mở lượng bại ，xử vào vật "

> **🚫 Nghiêm cấmÁnh sáng/vật gọi Mô tả**：description tất cảchữ đoạn đều **không được **ra  `ánh `/`sáng `/`vật `/`vật gọi `/`vật `/`vật `/`ánh `/`dẫn `/`cao đúng tỷ ` Ánh sángloại từ 。Ánh sángtoàn do Ống kínhnơi hàm  của Bối cảnhTài nguyênảnh tự động ——bối /ngày/ánh ánh cần cầu vui lòng thông quahàm đúng hồi **Bối cảnhsinh **（bối bản /ngàybản /ánh bản ）bảng 。như Ví dụgiữa Nguyên tác"dưới "biệt ，hồi xóa đi 。

**shotSize**（Cỡ cảnh）：

| Cỡ cảnh | Giải thích | việc ngữ nghĩa  |
|------|------|---------|
| lớn Viễn cảnh (extreme wide shot) | toàn  | nối trường  /  / nhỏ  |
| Viễn cảnh (extreme wide shot) | Bối cảnhngườiliên dòng  | rỗng gian liên dòng  / Không khí |
| Toàn cảnh (wide shot) | ngườitoàn  | Nhân vậtđăng trường  / toàn  |
| Trung cảnh (medium shot) | trên  | ngày thường việc  / đúng lời  |
| Cận cảnh (close-up) | bộ trên  | tình truyền  / đúng lời trùng điểm  |
| Đặc tả (close-up) | mặt bộ hoặc tệp cục bộ  | tình xúc hóa  / liên Đạo cụ |
| lớn Đặc tả (close-up) | cục bộ  | tình xúc  / nối gian （hàm ，toàn  2~3 lần ） |

**cameraMove**（Góc quay）：không Góc quay `Tĩnh (static)`。Góc quaybuộc biểu tâm điểm phương 。

| Góc quay | Giải thích | việc ngữ nghĩa  |
|------|------|---------|
| khuyến  | từ đến ，gọi chính thể  | tình xúc tiến  / phát  / video  |
|  | từ đến ，nhở  | tình xúc  / nhở toàn  / khác  |
|  | nối vị trí trí chuyển video  | tác vụ  / tìm kiếm  |
|  | chính thể động  |  /  |
|  | từ trên dưới  |  / nhỏ  / toàn cục  |
|  | từ dưới trên  | hóa  / nén  |

**action**（Hành động nhân vật）：vẽ mặt giữa Nhân vật/chính thể  của cụ thể động tác vụ Mô tả（5~40 chữ ），không Hành động nhân vật `rỗng quay `。khung thức  `(tiếp Giải thích)động tác vụ Mô tả`。Yêu cầu：
- **tiếp Giải thíchtrí với mở đầu **：hàm nửa nhân quát số gói ，trí với động tác vụ Mô tảnhất trước mặt 。quay  `(mở bài )`；anh ấyỐng kính `(tiếp trên quay :tiếp động tác vụ )`，như  `(tiếp trên quay :khuyến ~nối khung )`、`(tiếp trên quay :tay nửa trạng thái→trên )`
- **động tác vụ thức **：lý động tác vụ  + độ tiết （"phải tay →→"），Nghiêm cấmchỉ thái thái 。nhiều Nhân vậtcác tự động tác vụ hàm  `;` phútcách ，theo Tên tài nguyên liên kếtxếp sắp hàng ，như  `phải tay cổng →trái ;video đường phương `
- **sách hàng không /rỗng gian liên dòng **：rỗng gian liên dòng đã lập hàng （`orientation` / `spatialRelation`），không ở  action trong trùng lời biểu tâm ， `|`  markdown bảng khung hàng phútcách 

**orientation**（）：lập hàng ，vẽ mặt giữa Nhân vậtmặt bộ biểu tâm 。khung thức ：
- nhiều Nhân vậttheo  `associateAssetsNames` xếp hàng ra ，hàm  `;` phútcách ：`Nhân vậtA-3/4chính mặt phải ;Nhân vậtB-3/4chính mặt trái `
- đơn Nhân vậtNhân vậttên ：`mặt phải `
- rỗng quay thuần tệp Đặc tả (close-up) `—`
- buộc hợp  180° video đường （cùng Bối cảnhtrong nối ，hóa buộc ở  `action` giữa cho ra chuyển /chuyển đầu tiếp động tác vụ nhất cùng bước cập nhậtsách hàng ），cụ thể xuất giá trị thấy dưới phương tham chiếubảng 

**spatialRelation**（rỗng gian liên dòng ）：lập hàng ，nhiều Nhân vậtvẽ mặt giữa các Nhân vậtđúng trạm vị trí 。khung thức ：
- theo  `associateAssetsNames` xếp hàng ra ，hàm  `、` phútcách ：`Nhân vậtA(vị trí trí )、Nhân vậtB(vị trí trí )`
- vị trí trí xuất giá trị thấy dưới phương rỗng gian liên dòng tham chiếubảng （9 trạm vị trí ）
- đơn Nhân vậtỐng kínhchỉ 1  `Nhân vật(vị trí trí )` hoặc  `—`；thuần tệp Đặc tả (close-up)、rỗng quay  `—`
- buộc 、Cỡ cảnh、Góc quaytự （phải  của Nhân vậttâm video /động mục biểu hồi vị trí với phải trạm vị trí ）；cùng trường cùng nhóm Nhân vậttrạm vị trí buộc nối ，chạy vị trí buộc ở  `action` giữa cho ra tiếp động tác vụ nhất cùng bước cập nhậtsách hàng 

**chỉnh chữ đoạn Ví dụ**（5 người）：
- `action`：`(mở bài )Viễn cảnh (extreme wide shot)khuyến người，5ngườitrạm vị trí ——trái 、trái ;video đường vật `
- `orientation`：`-3/4chính mặt phải ;-3/4chính mặt trái ;lưu -3/4chính mặt trái ;-3/4chính mặt trái ;an -chính mặt `
- `spatialRelation`：`(trái trước )、an (phải trước )、(trái sau )、lưu (giữa sau )、(phải sau )`

**tham chiếubảng **（orientation hàng hàm ）：

| xuất giá trị  | nghĩa  | kiểu Bối cảnh |
|---------|------|---------|
| mặt phải  | mặt vẽ mặt phải  | 180°đường trái Nhân vật、phải mục biểu  |
| mặt trái  | mặt vẽ mặt trái  | 180°đường phải Nhân vật、trái mục biểu  |
| chính mặt  | chính đúng Ống kính | tự 、、trực video  |
| 3/4chính mặt phải  | 3/4mặt phải Ống kính | đúng lời chính thể （vẽ mặt trái Nhân vật） |
| 3/4chính mặt trái  | 3/4mặt trái Ống kính | đúng lời chính thể （vẽ mặt phải Nhân vật） |
| chính mặt phải  | chính mặt phải  | 、 |
| chính mặt trái  | chính mặt trái  | 、 |
| 3/4mặt phải  | 3/4mặt phải  | 、đi  |
| 3/4mặt trái  | 3/4mặt trái  | 、đi  |
| mặt  | đúng Ống kính | đăng trường 、khác 、 |

> cộng ：`mặt phải đầu `、`3/4chính mặt trái thấp đầu `。

**rỗng gian liên dòng tham chiếubảng **（spatialRelation hàng hàm ，nhiều Nhân vậtBối cảnhbắt biểu ）：

vẽ mặt phút「trái /giữa /phải 」3hàng  ×「trước /giữa /sau 」3tầng  của  3×3 trạm vị trí mạng khung ，trước =Ống kính/trước bối tầng ，sau =Ống kính/bối tầng ；trước /sau bảng cao thấp （như video dưới giả 「giữa trước 」、trạm lập nén giả 「giữa sau 」）。

| vị trí trí xuất giá trị  | nghĩa  | kiểu hàm thức  |
|---------|------|---------|
| trái trước  | vẽ mặt trái 、Ống kính | chính thể trái trước bối ，thường tác vụ chính dẫn phát thanh phương  |
| giữa trước  | vẽ mặt giữa 、Ống kính | đơn chính thể giữa 、trước bối nửa  của Nhân vật |
| phải trước  | vẽ mặt phải 、Ống kính | chính thể phải trước bối  |
| trái giữa  | vẽ mặt trái 、Trung cảnh (medium shot)tầng  | giữa đoạn trái vị trí  |
| giữa giữa  | vẽ mặt chính giữa 、Trung cảnh (medium shot)tầng  | chính thể giữa 、đúng lời chính dẫn giả  |
| phải giữa  | vẽ mặt phải 、Trung cảnh (medium shot)tầng  | giữa đoạn phải vị trí  |
| trái sau  | vẽ mặt trái 、sau （bối ） | sau sắp trái vị trí 、giả  |
| giữa sau  | vẽ mặt giữa 、sau  | sau sắp giữa 、trước bối hoặc cao vị trí  |
| phải sau  | vẽ mặt phải 、sau  | sau sắp phải vị trí 、giả  |

**emotion**（tình xúc ）：vẽ mặt truyền  của tình xúc cơ sở gọi （2~10 chữ ），hàm cụ tượng Mô tả。như """""bức nén "。Nghiêm cấm"mở """rỗng từ 。

**scene**：Phân cảnhnơi xử  của Bối cảnhTên，Kịch bảngiữa  của Bối cảnhđúng hồi 

**associateAssetsNames**：vẽ mặt giữa **thấy  của **Tài nguyênTêndanh sách（gói quát chỉ cục bộ ra  của Nhân vật/tệp ），với trực liên kết nội dung

**duration**：cơ sở tham chiếu——Đặc tả (close-up)/bảng tình  2~3s · đúng lời Cận cảnh (close-up) 3~5s · toàn  3~5s · động tác vụ  2~4s · Viễn cảnh (extreme wide shot)/rỗng quay / 3~5s · lời Bối cảnh 5~8s。**đơn quay không vượt  8s**，vượt buộc phút。

**Lời thoại，Thời lượngBắt buộctoàn bộLời thoạivà khớptình xúc ngữ **：

| tình xúc trạng thái | ngữ tham chiếu | Ví dụBối cảnh |
|---------|---------|----------|
| 、、 | ~4 chữ /giây | 、、 |
| chính thường đúng lời 、tả  | ~3 chữ /giây | ngày thường tác vụ 、tả  |
| 、tình 、 | ~2 chữ /giây | thông 、、trả  |
| thấp ngữ 、、 | ~2 chữ /giây | 、 |

tính toáncách thức：Lời thoạichữ số  ÷ đúng hồi ngữ （trên xuất chỉnh ）= cơ sở giâysố ，cộng lượng ：
- Lời thoạigiữa mục biểu điểm （số 、câu số 、số 、số ）+0.3~0.5s
- tình xúc chuyển /ngữ hóa xử  +0.5s
- nhất  `duration` = cơ sở giâysố  + tính  + 1s an toàn lượng （trên xuất chỉnh ）

**lines**：Nhân vậtLời thoạiNguyên tác，**Bắt buộc1 chữ không sửa từ Kịch bảngiữa **。nhiều Nhân vậttheo  `Nhân vậttên ：Lời thoại` khung thức sắp hàng 。Không có lời thoại `Không có lời thoại`。1 câu Lời thoạiđúng hồi một Ống kính，đơn Ống kínhtrong nhiều Nhân vậtnhiều đúng 。

**sound**（Âm hiệu）：thuần Âm hiệuMô tả，theo 「âm tầng  + động tác vụ âm tầng 」phúttầng 。như "xử phong thanh  + thanh "。không Âm hiệu `không Âm hiệu`。

> **🚫 âm /nối **：sách đường nhất nguyên **toàn không bối âm **。`Âm hiệu` hàng chỉ xuống thật thanh nguồn （âm  + động tác vụ âm  + âm ），"BGM""nối """"///thanh thiết bị tác vụ Không khí"chữ kiểu **1 **，sẽ trùng hỏi đề 。như Kịch bảngiữa ra thiết bị tác vụ kịch tình động tác vụ （như Nhân vật），chỉ " của biệt động thanh  + "cụ thể lý âm nguồn 。

**associateAssetsIds**：vẽ mặt giữa **thấy  của **Tài nguyên của  ID（từ  assets dữ liệugiữa lấy của  `id` chữ đoạn giá trị ），không chỉnh tạo không lưu ở  của  ID。
- **Nhân vậtra hàm **：vẽ mặt giữa ra  của tất cảNhân vật，không là chính thể còn là chỉ cục bộ thấy （như sáng 、tay bộ 、hóa sáng ），chỉ cần ở vẽ mặt trong trưng ，đều Bắt buộchàm đúng hồi  của Tài nguyên ID
- **Bối cảnhTài nguyênbắt chọn **：mục Phân cảnhBắt buộchàm nơi xử Bối cảnhđúng hồi  của Bối cảnhTài nguyên ID（type  scene  của Tài nguyên）；Bối cảnhlưu ở khớphiện tạivẽ mặt trạng thái của sinh Bối cảnhTài nguyên，chọn hàm sinh Bối cảnhTài nguyên ID，không chọn hàm chính Bối cảnhTài nguyên ID。ít Bối cảnhTài nguyên ID video chữ đoạn không chỉnh 
- Tài nguyênchọn lựa ：theo kịch tình vẽ mặt nơi cần trạng tháichọn lựa Tài nguyên ID——Ống kínhcần cần chính Tài nguyên của sinh trạng thái，**chỉ chọn sinh Tài nguyên ID**；chỉ khi không lưu ở khớp của sinh trạng thái，chọn lựa chính Tài nguyên ID；cùng 1 Tài nguyênở cùng 1 Phân cảnhgiữa Nghiêm cấmchính /sinh cùng ra 

---

## chuyển trường 

- **cùng trường trong **：Ống kínhgian Mặc định
- **Bối cảnh**：vào  1 mục rỗng quay Phân cảnh（2~3s）tình xúc ，rỗng quay nội dungtrước sau Bối cảnhKhông khíliên 
- **đoạn **：ở  description giữa biểu tâm "hóa "hoặc "vào ra "
- hàm thức chuyển trường （、chuyển 、trăm ）
