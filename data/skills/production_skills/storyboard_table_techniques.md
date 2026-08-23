---
name: storyboard_table_techniques
description: >-
  Tài liệu tham chiếu kỹ thuật chung cho việc dựng Bảng phân cảnh.
  Bao gồm nguyên tắc phân cảnh, hợp nhất ống kính nối cảnh, logic trực quan, các trường dữ liệu và kỹ thuật chuyển cảnh khi thiết kế Bảng phân cảnh — dùng chung cho mọi Agent liên quan.
---
# Kỹ thuật chung cho Bảng phân cảnh

Tài liệu này là tham chiếu kỹ thuật chung cho việc thiết kế Bảng phân cảnh, dùng cho ngữ cảnh (context) của mọi Agent cần xây dựng Bảng phân cảnh.

---

## Nguyên tắc phân cảnh

**Cần tách cảnh (shot) mới khi**: bối cảnh/địa điểm thay đổi, thời gian thay đổi, chủ thể của ống kính thay đổi, cỡ cảnh thay đổi rõ rệt, hoặc xuất hiện một nút hành động quan trọng.

**Không cần tách cảnh mới khi**: vẫn trong cùng một khung hình, chỉ có đối thoại, biểu cảm hoặc động tác nhỏ thay đổi.

Mật độ tham chiếu: một khung hình độc lập = 1 cảnh quay; trung bình mỗi 50~100 chữ kịch bản tương ứng 1~2 cảnh quay. Nếu có mô tả chuyển cảnh/chuyển trường thì tính riêng.

---

## Hợp nhất ống kính nối cảnh

**Ống kính nối cảnh (establishing shot)**: mỗi khi vào một bối cảnh/đoạn mới, chỉ được tạo tối đa 1~2 cảnh quay nối cảnh, nghiêm cấm tạo quá 3 cảnh quay.
- Cách khuyến nghị: 1 cảnh đại viễn cảnh (extreme wide shot) kèm động tác đẩy máy (kết hợp nối cảnh + đưa chủ thể vào khung trong cùng một cú máy), hoặc 1 cảnh đại viễn cảnh để nối trường + 1 cảnh toàn cảnh (wide shot) để đưa chủ thể vào khung.
- Cách bị cấm: cảnh trống mở đầu → chi tiết cục bộ → nhân vật xuất hiện, kiểu chia làm 3 đoạn tách rời.

**Tự kiểm tra khi hợp nhất ống kính**:
- Việc có thể hoàn thành trong 1 cú máy thì không tách thành 2 cú máy — nếu một chuyển động máy quay có thể vừa nối cảnh vừa đưa chủ thể vào khung, không cần tách thành 2 cảnh quay riêng.
- Các cảnh quay mô tả những khu vực khác nhau trong cùng một không gian (ví dụ: cổng → sân → cửa) nên hợp nhất thành một cảnh quay duy nhất, dùng trường Mô tả hình ảnh để thể hiện nhiều tầng không gian.
- Các cảnh quay thuần chuyển động máy quay (chỉ nâng/hạ hoặc đẩy máy mà không có nội dung mới) nên được gộp vào cảnh quay có nội dung thực chất kế tiếp.
- **Kiểm tra theo góc nhìn đạo diễn**: tự hỏi ở bước cuối cùng — nếu một đạo diễn thực thụ sẽ gộp 2~3 cảnh quay này thành 1 và có thể giải thích được lý do, thì nên gộp lại.

**Một cú máy dài (long take)**: khi sự khác biệt giữa các cảnh quay chỉ nằm ở **chuyển động liên tục, thay đổi vị trí trong cùng bối cảnh, hoặc thay đổi khoảng cách với nhân vật**, hãy thể hiện điều đó bằng cụm "một cú máy dài" trong `cameraMove` hoặc `description`, gộp nhiều cảnh quay thành một chuyển động máy quay dài liên tục.
- **Bối cảnh áp dụng**: nhân vật di chuyển qua không gian, hành động kéo dài từ điểm A đến điểm B, máy quay xoay vòng quanh (orbiting/surround) nhân vật, hoặc nối cảnh rồi đẩy máy (push in) tới cận cảnh đặc tả chủ thể.
- **Cách thể hiện**: trong `cameraMove` ghi rõ lộ trình chuyển động máy quay (ví dụ: "một cú máy dài: đẩy máy từ đại viễn cảnh → tiến vào bên trong → toàn cảnh"), trong `description` mô tả nội dung hình ảnh xuất hiện dọc theo lộ trình đó.
- **Mở rộng thời lượng**: cảnh quay dạng một cú máy dài cần liên tục cập nhật lượng thông tin mới; thời lượng một cảnh quay có thể vượt mức 6s thông thường, nhưng không được vượt quá 12s.
- **Lưu ý về mức độ**: một cú máy dài sẽ nâng cao độ khó khi tạo hình ảnh (yêu cầu AI cao hơn), chỉ nên dùng khi thực sự cần thiết cho kịch tình, không lạm dụng.

**Quy tắc 6 giây**: cảnh quay không có lời thoại nếu vượt quá 6 giây mà không xuất hiện thông tin mới (lời thoại/động tác/thay đổi chủ thể) sẽ làm loãng sự tập trung của người xem. Đặc biệt lưu ý với các cảnh quay dạng nối cảnh — nên rút gọn/nén lại, không kéo dài không cần thiết.

---

## Logic trực quan (áp dụng xuyên suốt quá trình thiết kế Bảng phân cảnh)

**① Logic hành động liên tục**: vị trí nhân vật và tiến độ động tác giữa các cảnh quay phải nhất quán về mặt logic. Nếu cảnh quay trước kết thúc khi tay đưa đến nửa chừng → thì cảnh quay sau phải tiếp nối từ đúng trạng thái nửa chừng đó, không được nhảy cóc hay lặp lại động tác.

**② Tiến triển cỡ cảnh có trật tự**: cỡ cảnh nên thay đổi theo hướng thu hẹp dần hoặc mở rộng dần —
- Thu hẹp dần: Đại viễn cảnh → Toàn cảnh → Trung cảnh → Cận cảnh → Đặc tả (dùng khi cảm xúc dâng cao, hội tụ)
- Mở rộng dần: Đặc tả → Cận cảnh → Trung cảnh → Toàn cảnh → Đại viễn cảnh (dùng khi cảm xúc lắng xuống, mở rộng)
- Nghiêm cấm giữ nguyên cùng một cỡ cảnh liên tục mà không có lý do (từ 3 cảnh quay trở lên cùng một cỡ cảnh = vi phạm logic trực quan).

**③ Trục quay (180°-line)**: tuân thủ nguyên tắc trục 180 độ — vị trí trong khung hình của các nhân vật đối thoại/đối diện nhau trong cùng bối cảnh phải nhất quán xuyên suốt, không được đảo lộn (nhảy trục).

**④ Logic không gian**: hướng nhìn của hai bên đối thoại, hướng thao tác và hướng ánh mắt hướng về trung tâm phải khớp với nhau. Nghiêm cấm các cảnh quay có hướng mặt mâu thuẫn nhau.

**⑤ Kiểm soát lượng thông tin qua cách để lộ**: mỗi cảnh quay cần cân nhắc rõ "để lộ cái gì, giấu cái gì" —
- Chỉ cho thấy tay, giấu mặt = tạo bí ẩn; nghe âm thanh trước, thấy hình sau = tạo hồi hộp; chỉ cho thấy bóng lưng = giữ kín danh tính; để lộ toàn bộ = đẩy cao trào.

**⑥ Mật độ chi tiết**: số lượng động tác/sự kiện trong một cảnh quay phải khớp với thời lượng, tránh nhồi nhét quá nhiều nội dung —
- 1 động tác chính = 1 đơn vị, 1 lần chuyển động máy quay = 1 đơn vị, 1 câu thoại ngắn (≤10 chữ) = 1 đơn vị
- Cảnh quay 2~3s: tối đa 1 đơn vị; cảnh quay 4~6s: tối đa 2 đơn vị; cảnh quay 7s+: tối đa 3 đơn vị.

**⑦ Vùng an toàn đầu-cuối**: 0.5s đầu và 0.5s cuối của mỗi cảnh quay là vùng an toàn, không đặt điểm bắt đầu của động tác quan trọng hoặc lời thoại vào đó. 0.5s đầu dùng để thiết lập bố cục/trạng thái ban đầu của chủ thể, 0.5s cuối dùng để động tác được hoàn tất một cách tự nhiên.

---

## Các trường dữ liệu

**description** (Mô tả hình ảnh): một câu mô tả nội dung khung hình (15~50 chữ), bao gồm **chủ thể + động tác/trạng thái + không gian**, không chứa nội dung về chuyển động máy quay. Cần thể hiện tối thiểu 2 tầng không gian (tiền cảnh/trung cảnh/hậu cảnh). Ví dụ: "Tiền cảnh là bàn trà, trung cảnh là nhân vật đang ngồi"; "Cửa gỗ đổ sập, mảnh vụn văng tung tóe, lộ ra bóng người phía sau".

> **🚫 Nghiêm cấm mô tả ánh sáng/nguồn sáng**: mọi câu trong trường description đều **không được** xuất hiện các từ thuộc nhóm ánh sáng như `ánh sáng`/`đèn`/`nguồn sáng`/`chiếu sáng`/`tỏa sáng`/`ánh nắng`/`độ tương phản cao`. Ánh sáng hoàn toàn do Tài nguyên Bối cảnh mà cảnh quay tham chiếu tự động thể hiện — mọi yêu cầu về bối cảnh/ngày-đêm/ánh sáng cần được đáp ứng thông qua việc tham chiếu đúng **Tài nguyên Bối cảnh phái sinh** phù hợp (bản ban đêm/bản ban ngày/bản có đèn...). Nếu trong ví dụ có xuất hiện các từ này, hãy loại bỏ khi viết mô tả thực tế.

**shotSize** (Cỡ cảnh):

| Cỡ cảnh | Giải thích | Ngữ nghĩa sử dụng |
|------|------|---------|
| Đại viễn cảnh (extreme wide shot) | Bao quát toàn bộ khung cảnh | Nối cảnh / thiết lập bối cảnh / tạo cảm giác nhỏ bé |
| Viễn cảnh (extreme wide shot) | Thể hiện mối liên hệ giữa nhân vật và bối cảnh | Thiết lập liên hệ không gian / tạo không khí |
| Toàn cảnh (wide shot) | Toàn thân nhân vật trong khung hình | Nhân vật xuất hiện / thể hiện toàn bộ hành động |
| Trung cảnh (medium shot) | Từ phần thân trên trở lên | Hoạt động thường ngày / đối thoại |
| Cận cảnh (close-up) | Phần thân trên (từ ngực trở lên) | Truyền tải cảm xúc / đối thoại trọng tâm |
| Đặc tả (close-up) | Khuôn mặt hoặc một chi tiết cục bộ | Khắc họa cảm xúc / liên kết đạo cụ |
| Đại đặc tả (close-up) | Một chi tiết cực nhỏ, cục bộ | Đẩy cảm xúc lên cao trào / chêm giữa các cảnh (hạn chế dùng, toàn phim tối đa 2~3 lần) |

**cameraMove** (Chuyển động máy quay): không dùng giá trị `Tĩnh (static)`. Chuyển động máy quay phải thể hiện rõ mục đích và hướng chuyển động.

| Chuyển động máy quay | Giải thích | Ngữ nghĩa sử dụng |
|------|------|---------|
| Đẩy tới (push in / dolly in) | Từ xa tiến lại gần, làm nổi bật chủ thể | Đẩy cảm xúc lên cao / bộc lộ chi tiết / tập trung thị giác |
| Kéo lùi (pull back / dolly out) | Từ gần lùi ra xa, mở rộng khung nhìn | Cảm xúc lắng dịu / hé lộ toàn cảnh / kết thúc phân đoạn |
| Lia máy (pan) | Máy quay xoay/dịch chuyển ngang để đổi vị trí khung hình | Thể hiện hành động / tìm kiếm bằng ánh mắt |
| Theo dõi (tracking / follow shot) | Máy quay bám theo chủ thể đang di chuyển | Rượt đuổi / di chuyển cùng nhân vật |
| Cần cẩu xuống (crane down / tilt down) | Máy quay hạ dần từ trên xuống dưới | Góc nhìn bao quát / tạo cảm giác nhỏ bé / thể hiện toàn cục |
| Cần cẩu lên (crane up / tilt up) | Máy quay nâng dần từ dưới lên trên | Tôn vinh nhân vật (anh hùng hóa) / tạo cảm giác áp bức, choáng ngợp |

**action** (Hành động nhân vật): mô tả cụ thể động tác của nhân vật/chủ thể trong khung hình (5~40 chữ), không được để giá trị `rỗng`. Định dạng: `(chú thích nối cảnh)mô tả động tác`. Yêu cầu:
- **Chú thích nối cảnh đặt ở đầu câu**: bao gồm cả cảnh quay đầu tiên, đặt trước phần mô tả động tác. Cảnh quay mở đầu ghi `(mở cảnh)`; các cảnh quay khác ghi `(nối tiếp cảnh trước: tiếp nối động tác nào)`, ví dụ `(nối tiếp cảnh trước: đẩy máy đến khung cận cảnh)`, `(nối tiếp cảnh trước: tay đang ở trạng thái nửa chừng → đưa lên hoàn toàn)`.
- **Định dạng động tác**: mô tả động tác chính + độ chi tiết (ví dụ "tay phải đưa ra → nắm lấy → kéo về"), nghiêm cấm chỉ mô tả trạng thái tĩnh. Nếu có nhiều nhân vật, mỗi nhân vật một động tác riêng, phân cách bằng dấu `;`, sắp xếp theo thứ tự Tên tài nguyên liên kết, ví dụ `tay phải đẩy cổng → bước vào ;ánh mắt nhìn về phía trước`.
- **Không lặp lại hướng nhìn/quan hệ không gian**: hướng nhìn và quan hệ không gian đã được thể hiện ở các trường riêng (`orientation` / `spatialRelation`), không lặp lại trong action; dấu `|` dùng để phân tách các cột trong bảng markdown.

**orientation** (Hướng mặt): trường độc lập, thể hiện hướng khuôn mặt của nhân vật trong khung hình. Định dạng:
- Nhiều nhân vật: liệt kê theo thứ tự trong `associateAssetsNames`, phân cách bằng `;`: `Nhân vật A-3/4 chính diện hướng phải;Nhân vật B-3/4 chính diện hướng trái`
- Một nhân vật: chỉ ghi tên hướng: `hướng phải`
- Cảnh quay trống hoặc thuần đặc tả chi tiết: ghi `—`
- Bắt buộc tuân thủ trục quay 180° (khi nối cảnh trong cùng bối cảnh, nếu hướng thay đổi thì phải thể hiện rõ trong `action` bằng động tác xoay người/đổi hướng, đồng bộ đúng thời điểm chuyển). Danh sách giá trị cụ thể xem bảng tham chiếu bên dưới.

**spatialRelation** (Quan hệ không gian): trường độc lập, thể hiện vị trí đứng tương đối giữa các nhân vật trong khung hình. Định dạng:
- Liệt kê theo thứ tự trong `associateAssetsNames`, phân cách bằng `、`: `Nhân vật A(vị trí)、Nhân vật B(vị trí)`
- Danh sách giá trị vị trí xem bảng tham chiếu quan hệ không gian bên dưới (9 vị trí)
- Cảnh quay chỉ có 1 nhân vật: ghi `Nhân vật(vị trí)` hoặc `—`; cảnh quay thuần đặc tả, cảnh trống: ghi `—`
- Vị trí phải khớp với hướng mặt, cỡ cảnh, chuyển động máy quay (vị trí của nhân vật cần khớp với hướng ánh mắt/mục tiêu di chuyển của họ); trong cùng một trường/nhóm cảnh, vị trí đứng của nhân vật phải nối tiếp liên tục — nếu vị trí thay đổi thì phải thể hiện động tác di chuyển tương ứng trong `action`, đồng bộ đúng thời điểm chuyển.

**Ví dụ các trường phối hợp** (5 người):
- `action`: `(mở cảnh)Đại viễn cảnh đẩy máy vào nhóm nhân vật, 5 người lần lượt vào vị trí — người đứng ngoài cùng bên trái bước sang trái ;ánh mắt cả nhóm hướng về vật thể chung`
- `orientation`: `Nhân vật A-3/4 chính diện hướng phải;Nhân vật B-3/4 chính diện hướng trái;Nhân vật C-3/4 chính diện hướng trái;Nhân vật D-3/4 chính diện hướng trái;Nhân vật E-chính diện`
- `spatialRelation`: `Nhân vật A(trái trước)、Nhân vật E(phải trước)、Nhân vật C(trái sau)、Nhân vật B(giữa sau)、Nhân vật D(phải sau)`

**Bảng tham chiếu** (dùng cho trường orientation):

| Giá trị | Ý nghĩa | Kiểu bối cảnh áp dụng |
|---------|------|---------|
| hướng phải | Mặt nhân vật quay về phía bên phải khung hình | Nhân vật đứng bên trái theo trục 180°, đối tượng/mục tiêu ở phía bên phải |
| hướng trái | Mặt nhân vật quay về phía bên trái khung hình | Nhân vật đứng bên phải theo trục 180°, đối tượng/mục tiêu ở phía bên trái |
| chính diện | Mặt hướng thẳng vào ống kính | Tự giới thiệu, độc thoại, nhìn thẳng vào máy quay |
| 3/4 chính diện phải | Mặt nghiêng 3/4 hướng phải, phần lớn khuôn mặt vẫn hướng về ống kính | Nhân vật là chủ thể chính trong cảnh đối thoại (đối tượng đứng bên trái khung hình) |
| 3/4 chính diện trái | Mặt nghiêng 3/4 hướng trái, phần lớn khuôn mặt vẫn hướng về ống kính | Nhân vật là chủ thể chính trong cảnh đối thoại (đối tượng đứng bên phải khung hình) |
| nghiêng hẳn phải | Mặt quay hẳn 90° sang phải, chỉ thấy diện mạo nghiêng | Đối đầu, quan sát, dõi theo |
| nghiêng hẳn trái | Mặt quay hẳn 90° sang trái, chỉ thấy diện mạo nghiêng | Đối đầu, quan sát, dõi theo |
| 3/4 sau phải | Mặt nghiêng ra sau bên phải, phần lớn thấy gáy/lưng | Nhân vật rời đi, bị bỏ lại phía sau |
| 3/4 sau trái | Mặt nghiêng ra sau bên trái, phần lớn thấy gáy/lưng | Nhân vật rời đi, bị bỏ lại phía sau |
| quay lưng | Chỉ thấy sau lưng, không thấy mặt | Nhân vật xuất hiện lần đầu (giữ bí ẩn), tạo khoảng cách, rời đi |

> Có thể kết hợp thêm trạng thái cúi/ngẩng đầu, ví dụ: `hướng phải, ngẩng đầu`、`3/4 chính diện trái, cúi đầu`.

**Bảng tham chiếu quan hệ không gian** (dùng cho trường spatialRelation, nhiều nhân vật trong bối cảnh bắt buộc điền):

Khung hình được chia thành lưới 3×3 vị trí: 3 cột ngang 「trái/giữa/phải」 × 3 tầng sâu 「trước/giữa/sau」; trước = gần ống kính/lớp tiền cảnh, sau = xa ống kính/lớp hậu cảnh; vị trí trước/sau còn thể hiện tương quan cao-thấp trong khung hình (ví dụ nhân vật ngồi ở phía dưới được xem là "giữa trước", nhân vật đứng ở phía sau được xem là "giữa sau").

| Giá trị vị trí | Ý nghĩa | Kiểu bối cảnh áp dụng |
|---------|------|---------|
| trái trước | Bên trái khung hình, gần ống kính (tiền cảnh) | Chủ thể đứng tiền cảnh bên trái, thường là người đang phát biểu/hành động chính |
| giữa trước | Chính giữa khung hình, gần ống kính (tiền cảnh) | Chủ thể duy nhất ở giữa, đứng trước một nhân vật khác ở phía sau |
| phải trước | Bên phải khung hình, gần ống kính (tiền cảnh) | Chủ thể đứng tiền cảnh bên phải |
| trái giữa | Bên trái khung hình, ở tầng trung cảnh | Vị trí bên trái ở tầng giữa (trung gian) |
| giữa giữa | Chính giữa khung hình, ở tầng trung cảnh | Chủ thể chính ở giữa, người đối thoại chính |
| phải giữa | Bên phải khung hình, ở tầng trung cảnh | Vị trí bên phải ở tầng giữa (trung gian) |
| trái sau | Bên trái khung hình, ở tầng hậu cảnh | Nhân vật phụ/nền đứng bên trái phía sau |
| giữa sau | Chính giữa khung hình, ở tầng hậu cảnh | Nhân vật đứng giữa phía sau, làm nền cho người khác hoặc ở vị trí cao hơn |
| phải sau | Bên phải khung hình, ở tầng hậu cảnh | Nhân vật phụ/nền đứng bên phải phía sau |

**emotion** (Cảm xúc): tên gọi cảm xúc cơ bản mà khung hình truyền tải (2~10 chữ), cần mô tả cụ thể. Ví dụ: "phẫn nộ", "sợ hãi", "dồn nén". Nghiêm cấm dùng các từ chung chung, trống rỗng như "vui vẻ".

**scene**: Tên Bối cảnh nơi cảnh quay diễn ra, tương ứng với Bối cảnh đã xác định trong Kịch bản.

**associateAssetsNames**: danh sách Tên các Tài nguyên **xuất hiện (nhìn thấy)** trong khung hình (bao gồm cả trường hợp chỉ thấy một phần cục bộ của Nhân vật/vật thể), dùng để liên kết trực tiếp với nội dung khung hình.

**duration**: mức tham chiếu cơ bản — Đặc tả/biểu cảm 2~3s · Cận cảnh đối thoại 3~5s · toàn cảnh 3~5s · cảnh có động tác 2~4s · Viễn cảnh/cảnh trống/nối cảnh 3~5s · lời dẫn bối cảnh (voice-over) 5~8s. **Một cảnh quay không được vượt quá 8s**, nếu vượt quá bắt buộc phải tách thành nhiều cảnh quay.

**Có lời thoại, thời lượng bắt buộc phải khớp toàn bộ lời thoại và phù hợp với tốc độ nói theo cảm xúc**:

| Trạng thái cảm xúc | Tốc độ nói tham chiếu | Ví dụ bối cảnh |
|---------|---------|----------|
| Gấp gáp, kích động, hoảng loạn | ~4 chữ/giây | Cãi vã, truy đuổi, tình huống cấp bách |
| Bình thường, tường thuật, kể chuyện | ~3 chữ/giây | Hội thoại thường ngày, tường thuật |
| Xúc động, trầm lắng, do dự | ~2 chữ/giây | Tâm sự, hồi tưởng, ngập ngừng |
| Trầm giọng, thì thầm, nghẹn ngào | ~2 chữ/giây | Thổ lộ bí mật, nghẹn lời |

Cách tính: số chữ trong lời thoại ÷ tốc độ nói tương ứng (làm tròn lên) = số giây cơ bản, cộng thêm:
- Mỗi dấu ngắt trong lời thoại (dấu phẩy, dấu chấm câu, dấu chấm hỏi, dấu chấm than) +0.3~0.5s
- Có chuyển biến cảm xúc/thay đổi ngữ điệu +0.5s
- `duration` cuối cùng = số giây cơ bản + phần cộng thêm + 1s dự phòng an toàn (làm tròn lên)

**lines**: Lời thoại nguyên văn của nhân vật, **bắt buộc giữ nguyên 100%, không sửa một chữ so với Kịch bản gốc**. Nếu có nhiều nhân vật, liệt kê theo định dạng `Tên nhân vật：Lời thoại`. Không có lời thoại thì ghi `Không có lời thoại`. Mỗi câu thoại tương ứng với một cảnh quay; trong một cảnh quay có thể có nhiều nhân vật cùng nói.

**sound** (Âm hiệu): mô tả thuần âm thanh, phân theo hai tầng 「âm thanh nền + âm thanh hành động」. Ví dụ: "tiếng gió thổi xa xa + tiếng bước chân". Không có âm hiệu thì ghi `không có âm hiệu`.

> **🚫 Không dùng nhạc nền/âm thanh chuyển cảnh**: theo quy tắc thống nhất của dự án, **toàn bộ không sử dụng nhạc nền (BGM)**. Trường `Âm hiệu` chỉ mô tả các nguồn âm thanh thực tế trong cảnh (âm thanh môi trường + âm thanh hành động + âm thanh vật thể); các từ như "BGM", "nhạc nền", "âm thanh chuyển cảnh", "hiệu ứng âm thanh tạo không khí"... **tuyệt đối không được dùng dưới bất kỳ hình thức nào**, nếu dùng sẽ gây lỗi khi sản xuất. Nếu trong kịch bản có mô tả thiết bị/vật dụng phát ra âm thanh do hành động kịch tình tạo ra (ví dụ nhân vật bật đài), chỉ cần mô tả cụ thể "âm thanh cụ thể phát ra từ nguồn âm đó" là đủ.

**associateAssetsIds**: danh sách ID của các Tài nguyên **xuất hiện (nhìn thấy)** trong khung hình (lấy từ giá trị của trường `id` trong dữ liệu assets), không được tự tạo ra ID không tồn tại.
- **Bắt buộc liệt kê đầy đủ nhân vật**: tất cả nhân vật xuất hiện trong khung hình — dù là chủ thể chính hay chỉ thấy một phần cục bộ (như bóng lưng, cánh tay, bóng đổ) — chỉ cần xuất hiện trong khung hình đều bắt buộc phải có ID Tài nguyên tương ứng.
- **Bắt buộc chọn Tài nguyên Bối cảnh**: mỗi cảnh quay bắt buộc phải có ID Tài nguyên Bối cảnh tương ứng với nơi cảnh quay diễn ra (Tài nguyên loại `scene`); nếu Bối cảnh có Tài nguyên phái sinh khớp với trạng thái hiện tại của khung hình, phải chọn ID của Tài nguyên phái sinh đó, không chọn ID của Tài nguyên Bối cảnh gốc. Mỗi cảnh quay tối thiểu phải có 1 ID Tài nguyên Bối cảnh, trường này không được để trống.
- **Cách chọn Tài nguyên**: chọn ID Tài nguyên theo đúng trạng thái mà khung hình yêu cầu — nếu cảnh quay cần trạng thái phái sinh của Tài nguyên chính, **chỉ chọn ID của Tài nguyên phái sinh**; chỉ khi không tồn tại trạng thái phái sinh phù hợp mới chọn ID của Tài nguyên gốc; nghiêm cấm cùng một Tài nguyên xuất hiện đồng thời cả bản gốc và bản phái sinh trong cùng một cảnh quay.

---

## Chuyển cảnh

- **Cắt cảnh trong cùng bối cảnh**: chuyển đổi trực tiếp giữa các cảnh quay (mặc định)
- **Chuyển bối cảnh**: có thể thêm 1 cảnh quay trống (2~3s) mang tính chuyển tiếp cảm xúc; nội dung cảnh trống cần liên kết không khí giữa bối cảnh trước và sau
- **Chuyển đoạn**: thể hiện trong `description` bằng cụm từ "mờ dần" hoặc "chuyển cảnh vào/ra"
- Nghiêm cấm dùng các kiểu chuyển cảnh khác (gạt hình/wipe, lật trang, chồng mờ/dissolve)
