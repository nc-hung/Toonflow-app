---
name: storyboard_prompt_techniques
description: >-
  Tài liệu kỹ thuật dùng chung để chuyển Bảng phân cảnh thành Prompt.
  Bao gồm: quy tắc phân tích Prompt, kho từ vựng cỡ cảnh, định dạng đầu ra, cấu trúc Prompt, phong cách vẽ, ký hiệu tài nguyên hình ảnh, hướng nhân vật — dùng để Agent tham chiếu khi cần.
---
# Prompt Phân Cảnh · Tài Liệu Kỹ Thuật Cơ Sở Dùng Chung

> Đây là **tài liệu kỹ thuật cơ sở dùng chung** cho việc tạo Prompt Phân cảnh, áp dụng cho mọi phong cách hình ảnh. Các nội dung gắn với **phong cách riêng** — như từ nối phong cách, cảm xúc, kho từ ánh sáng, bối cảnh, thẩm mỹ và các điều cấm kỵ — do tệp phong cách riêng (`director_storyboard`) định nghĩa.

---

## Các Chế Độ Hỗ Trợ

Tài liệu này chỉ hỗ trợ đầu ra theo 2 chế độ **tham chiếu ảnh nhất quán** sau:

- **Chế độ A**: Seedream (doubao-seedream)
- **Chế độ B**: Nanobanana (Gemini)

> ⚠️ **Không tạo Prompt theo chế độ Text-to-Image**. Mọi đầu ra đều dựa trên tiền đề quy trình làm việc **tham chiếu ảnh (Image-to-Image / ControlNet / nhất quán nhân vật)**.

---

## Bảng Phân Cảnh Là Nguồn Gốc Nội Dung (Ưu Tiên Tối Cao)

Việc tạo Prompt là **chuyển đổi định dạng**, không phải **sáng tác tự do**. Bảng phân cảnh là **nguồn nội dung duy nhất** của Prompt — mọi thông tin hình ảnh bắt buộc phải khớp đúng với Bảng phân cảnh, chỉ được thay đổi ở khuôn dạng trình bày và cách diễn đạt sao cho phù hợp yêu cầu của mô hình tạo hình ảnh.

### Nguyên Tắc Cốt Lõi: Mô Tả Hình Ảnh Là Chính, Phong Cách Là Phụ

Trường "Mô tả hình ảnh" trong Bảng phân cảnh chứa toàn bộ thông tin hình ảnh của cảnh quay, và đây là **nội dung chính** của phần thân Prompt. Từ nối phong cách, từ họa phong, từ vựng ánh sáng chỉ đóng vai trò **hỗ trợ**, phục vụ cho Mô tả hình ảnh. Khi hai phần này cạnh tranh không gian token (độ dài), **Mô tả hình ảnh luôn được ưu tiên trước** — dù phải rút gọn từ phong cách thì cũng không được cắt bớt nội dung hình ảnh trong Mô tả hình ảnh.

### Quy Tắc Bắt Buộc

1. **Bảo toàn đầy đủ Mô tả hình ảnh**: Toàn bộ thông tin hình ảnh trong trường "Mô tả hình ảnh" của Bảng phân cảnh (chủ thể, trang phục, quan hệ không gian, chi tiết động thái, quan hệ ống kính) bắt buộc phải được thể hiện đầy đủ trong phần thân Prompt, **không được bỏ sót bất kỳ chi tiết nào**.
2. **Chỉ chuyển đổi hình thức, giữ nguyên ngữ nghĩa**: Khi chuyển nội dung từ trường Bảng phân cảnh sang Prompt, chỉ được thay đổi cách trình bày (bảng ↔ đoạn văn, liên từ ↔ dấu câu, văn nói ↔ mô tả hình ảnh), **không được thay đổi ngữ nghĩa**. Ví dụ: Bảng phân cảnh ghi "tạo ra không gian ngập sáng" → Prompt bắt buộc thể hiện đúng việc không gian ngập sáng đó, không được đổi thành một nghĩa khác không tương đương với "tạo ra".
3. **Nghiêm cấm tự ý sáng tạo thêm**: Không được thêm các yếu tố hình ảnh mà Bảng phân cảnh chưa đề cập (Bảng phân cảnh không nhắc tới thì Prompt cũng không được tự ý bổ sung); không được tự ý thay đổi không khí của Bối cảnh (ví dụ Bảng phân cảnh ghi "u ám" thì Prompt không được tự sửa thành "tươi sáng").
4. **Từ phong cách tách biệt khỏi nội dung**: Từ nối phong cách, từ họa phong, từ loại phong cách của Bối cảnh chỉ đóng vai trò **hỗ trợ**, phục vụ cho nội dung hình ảnh mà Bảng phân cảnh đã xác định, không được lấn át nội dung chính — khi từ phong cách mâu thuẫn với mô tả cụ thể trong Bảng phân cảnh, **lấy Bảng phân cảnh làm chuẩn**.
5. **Đối chiếu từng trường**: Sau khi tạo xong Prompt, bắt buộc đối chiếu từng trường tương ứng với Bảng phân cảnh, cụ thể như bảng dưới đây:

| Trường Bảng phân cảnh | Vị trí bắt buộc thể hiện trong Prompt | Điểm cần đối chiếu |
|-----------|---------------|--------|
| Mô tả hình ảnh | Nội dung trong đoạn 【Hình ảnh】 của phần thân Prompt | Toàn bộ chủ thể, quan hệ không gian, chi tiết liên quan có được giữ lại **không sót một chi tiết nào** |
| Bối cảnh | Phần liên kết trong đoạn 【Hình ảnh】 của phần thân Prompt | Loại bối cảnh có nhất quán không |
| Cỡ cảnh | Từ bố cục khung hình theo cỡ cảnh | Cỡ cảnh có khớp không (cỡ cảnh phức hợp thì lấy cỡ cảnh ban đầu) |
| Hành động nhân vật | Tư thế của chủ thể | Ngữ nghĩa động tác có nhất quán, có thể hiện đúng ký hiệu hướng không |
| Cảm xúc | Từ ngữ biểu đạt cảm xúc | Cảm xúc nền có nhất quán không |
| Ánh sáng & Không khí | Đoạn 【Ánh sáng】 của phần thân Prompt | Hướng nguồn sáng, đổ bóng, tông màu có được thể hiện đầy đủ, nhất quán không |

> ⚠️ **Đối chiếu không đạt = Prompt không hợp lệ**, bắt buộc phải sửa lại trước khi xuất. Lỗi thường gặp nhất: bỏ sót các mô tả cụ thể trong Mô tả hình ảnh do bị từ phong cách lấn át.

---

## Nguyên Tắc Xử Lý Động Thái

Hình ảnh phân cảnh là **khung hình tham chiếu cho video**. Mô hình cần dựa vào ngữ nghĩa của trường "Mô tả hình ảnh" trong Bảng phân cảnh để tái hiện đúng trạng thái hình ảnh tại thời điểm đó, chứ không phải máy móc mô tả mọi thứ như một tư thế "tĩnh".

**Nguyên tắc xử lý**:

| Loại mô tả hình ảnh | Cách xử lý | Ví dụ |
|-------------|---------|------|
| **Trạng thái tĩnh** (đứng, ngồi, ngẩng đầu...) | **Tạo trực tiếp theo đúng mô tả**, không cần chuyển đổi thành động tác | "Nhân vật đứng" → Prompt trực tiếp ghi "đứng" |
| **Động tác đang diễn ra** (chạy, cúi/ngồi xuống, quay người rời đi) | Thể hiện **một khoảnh khắc trạng thái giữa chừng** của động tác (không phải trạng thái tĩnh tuyệt đối) | "cúi xuống" → "đã hạ thấp người, đang trong tư thế cúi, tại khoảnh khắc chuẩn bị đứng dậy" |
| **Chuyển động máy quay** (đẩy tới Trung cảnh (medium shot), kéo lùi ra Toàn cảnh (wide shot), đẩy vào) | Lấy **cỡ cảnh ở thời điểm bắt đầu** làm bố cục khung hình | "Viễn cảnh (extreme wide shot)→Trung cảnh (medium shot)" → thể hiện "đại viễn cảnh (extreme wide shot)" |
| **Hiệu ứng chuyển cảnh** (mở màn/fade in, chuyển cảnh hòa/dissolve) | Giữ nguyên mô tả nhưng thể hiện trạng thái mở đầu của cảnh | "mở màn bằng fade in" → "khung hình mờ dần hiện ra từ nền đen, mở đầu là đại viễn cảnh (extreme wide shot)..." |

**Lưu ý bổ sung**: Căn cứ vào động từ trạng thái chính và mật độ sự kiện trong Mô tả hình ảnh để xác định cách xử lý phù hợp.

> ❌ **Cách làm sai**: Biến tất cả động tác thành trạng thái "vừa mới xảy ra", làm sai lệch ngữ nghĩa động tác
> - Bảng phân cảnh "đi bộ" → sửa sai thành "đã bước về phía trước" (biến thành động tác đã hoàn thành)
> - Bảng phân cảnh "giơ tay lên cao" → sửa sai thành "phấn khích" (nhầm động tác thành cảm xúc)
>
> ✅ **Cách làm đúng**: Giữ nguyên mô tả động tác của Bảng phân cảnh, chỉ thể hiện khoảnh khắc bắt đầu của quá trình thực hiện động tác đó

---

## Quy Tắc Phân Tích Từng Trường

| Trường trong Bảng phân cảnh | Cách xử lý tương ứng trong Prompt |
|----------|----------------|
| Mô tả hình ảnh | **Nội dung chính**: là nguồn thông tin cho đoạn 【Hình ảnh】 trong phần thân Prompt. Bắt buộc giữ lại đầy đủ **toàn bộ** yếu tố nhìn thấy được — chủ thể, các lớp không gian, chi tiết liên quan, quan hệ ống kính — chỉ được chuyển đổi cách diễn đạt sang khuôn dạng mô tả hình ảnh cho Prompt. Không được cắt bớt, đổi sang nghĩa khác, hoặc tự ý thêm vào những yếu tố hình ảnh không có trong Mô tả hình ảnh |
| Bối cảnh | Đưa vào đoạn 【Hình ảnh】 dưới dạng phần liên kết, kết hợp với từ vựng bối cảnh do tệp phong cách riêng cung cấp |
| Cỡ cảnh | Chuyển thành từ bố cục khung hình theo ống kính (xem kho từ Cỡ cảnh bên dưới), bắt buộc khớp với trường "Cỡ cảnh" trong Bảng phân cảnh. Cỡ cảnh phức hợp (như "Viễn cảnh (extreme wide shot)→Trung cảnh (medium shot)") thì thể hiện theo **cỡ cảnh ban đầu** |
| Chuyển động máy quay | Chỉ dùng làm thông tin ghi chú nội bộ của Phân cảnh, không đưa trực tiếp vào Prompt, không xuất riêng nội dung chuyển động máy quay ra Prompt (nội dung này đã được lồng ghép vào đoạn 【Hình ảnh】 theo nguyên tắc ở mục "Nguyên Tắc Xử Lý Động Thái" bên trên) |
| Hành động nhân vật | Dựa trên trường "Hành động nhân vật" của Bảng phân cảnh, xử lý theo nguyên tắc ở mục "Nguyên Tắc Xử Lý Động Thái". Bắt buộc giữ nguyên ngữ nghĩa động tác, kể cả ký hiệu hướng đặt trong dấu `｜:` |
| Cảm xúc | Dựa trên trường "Cảm xúc" của Bảng phân cảnh, chọn nội dung/từ vựng phù hợp từ bảng cảm xúc do tệp phong cách riêng cung cấp. Cảm xúc nền bắt buộc nhất quán với Bảng phân cảnh |
| Ánh sáng & Không khí | Dựa trên trường "Ánh sáng & Không khí" của Bảng phân cảnh, **tách thành đoạn riêng** đưa vào đoạn 【Ánh sáng】, giữ nguyên đầy đủ hướng nguồn sáng, đổ bóng, tông màu và chi tiết |
| Lời thoại | Không đưa vào Prompt, không xuất ra |
| Âm hiệu | Không đưa vào Prompt, không xuất ra |
| Tên tài nguyên liên kết/ID | Chỉ dùng trong phần ghép nối ký hiệu tham chiếu ảnh ở đầu Prompt, xử lý theo mục "Ký Hiệu Tài Nguyên Hình Ảnh" bên dưới |

---

## Kho Từ Vựng Cỡ Cảnh (Dùng Chung)

| Cỡ cảnh đầu vào | Từ ống kính dùng trong Chế độ B (Nanobanana) | Từ mô tả hình ảnh dùng trong Chế độ A (Seedream) |
|----------|-------------------------------|---------------------------|
| Đại viễn cảnh (extreme wide shot) / Đại toàn cảnh (wide shot) | `extreme wide shot, establishing shot` | Bố cục đại viễn cảnh, thu trọn toàn bộ khung cảnh, nhân vật nhỏ trong bối cảnh rộng lớn |
| Viễn cảnh (extreme wide shot) / Toàn cảnh (wide shot) | `wide shot, full shot, full body` | Toàn thân vào khung, bố cục viễn cảnh, tỷ lệ nhân vật và bối cảnh cân đối |
| Trung cảnh (medium shot) | `medium shot, cowboy shot, knee shot` | Bố cục trung cảnh, lấy khung từ phần trên cơ thể nhân vật |
| Cận cảnh (close-up) | `medium close-up, upper body` | Bố cục cận cảnh, lấy khung nửa người trên, bối cảnh được làm mờ nhẹ |
| Bán thân | `half body shot, bust shot` | Bố cục bán thân, lấy khung phần ngực trở lên, làm nổi bối cảnh phía sau |
| Đặc tả (close-up) | `close-up, face focus` | Bố cục đặc tả, phóng lớn khuôn mặt hoặc chi tiết cục bộ, bối cảnh mờ nhòe sâu |
| Đại đặc tả (close-up) | `extreme close-up, macro detail` | Đại đặc tả, phóng cực lớn chi tiết cục bộ, bối cảnh nhòe hoàn toàn |
| Qua vai | `over the shoulder shot, two shot` | Bố cục qua vai, nhân vật phía trước làm tiền cảnh mờ, nhân vật phía sau rõ nét trong khung viễn cảnh |

**Xử lý cỡ cảnh phức hợp**: Khi Bảng phân cảnh ghi các chuyển động máy quay như "Viễn cảnh (extreme wide shot)→Trung cảnh (medium shot)" hoặc "Trung cảnh (medium shot)→Đặc tả (close-up)", vì hình ảnh phân cảnh chỉ dùng làm khung hình tham chiếu, nên **thể hiện theo cỡ cảnh ở thời điểm bắt đầu**.

---

## Định Dạng Đầu Ra

Mỗi Phân cảnh **chỉ xuất ra phần thân Prompt theo đúng một chế độ** (chọn 1 trong 2), không được xuất đồng thời cả Chế độ A lẫn Chế độ B cho cùng một Phân cảnh.

**Cách chọn chế độ**:

| Trường hợp | Chế độ được chọn |
|------|----------|
| Dự án sử dụng mô hình Seedream / Doubao | Chế độ A (Prompt dạng đoạn văn) |
| Dự án sử dụng mô hình Nanobanana / Gemini | Chế độ B (Prompt dạng JSON) |
| Người dùng chưa chỉ định mô hình | Mặc định dùng Chế độ A, hoặc hỏi lại người dùng |
| Tạo hàng loạt | Giữ nguyên một chế độ trong suốt quá trình, không đổi giữa chừng |

**Nội dung đầu ra**:
- Nếu chọn Chế độ A: chỉ xuất phần thân `[Prompt]` (không kèm negative prompt, vì Seedream không hỗ trợ)
- Nếu chọn Chế độ B: chỉ xuất phần thân `[JSON Prompt]` (có kèm trường `"negative"`)
- Ngoài phần thân Prompt, mặc định không xuất các nội dung sau: tiêu đề Phân cảnh, phần giải thích ghép nối tham chiếu ảnh, nội dung Lời thoại, nội dung Âm hiệu, ghi chú kiểm tra, tổng hợp tài nguyên

---

## Cấu Trúc Prompt (Ưu Tiên Mô Tả Hình Ảnh)

### Cấu Trúc Tổng Thể

Phần thân Prompt gồm **cấu trúc 3 đoạn**, đảm bảo Mô tả hình ảnh luôn giữ vị trí chủ đạo:

```
【Hình ảnh】→ Toàn bộ nội dung hình ảnh tổng hợp từ「Mô tả hình ảnh」+「Bối cảnh」+「Cỡ cảnh」+「Hành động nhân vật」+「Cảm xúc」của Bảng phân cảnh (đoạn chính, mật độ thông tin cao nhất)
【Ánh sáng】→ Hướng nguồn sáng, đổ bóng, tông màu từ trường「Ánh sáng & Không khí」của Bảng phân cảnh (tách thành đoạn riêng, từ phong cách rút gọn)
【Phong cách】→ Từ nối phong cách + từ họa phong + các yếu tố cấm kỵ (đoạn hỗ trợ, ngắn gọn)
```

> **Nguyên tắc phân bổ dung lượng**: Đoạn 【Hình ảnh】 có mật độ thông tin cao nhất và dài nhất, bắt buộc thể hiện đầy đủ toàn bộ nội dung hình ảnh của trường "Mô tả hình ảnh"; đoạn 【Ánh sáng】 đứng thứ hai, tách riêng nội dung Ánh sáng & Không khí; đoạn 【Phong cách】 ngắn nhất, chỉ gồm những từ nối phong cách và từ họa phong cần thiết. Thứ tự và độ dài của 3 đoạn không được đảo lộn — nếu từ phong cách dài hơn đoạn Hình ảnh, đó là dấu hiệu tạo Prompt thất bại.

### Chế Độ A: Seedream (API `reference_images`)

**Cơ chế**: Ảnh tham chiếu được truyền vào qua tham số API `reference_images`; trong prompt, ký hiệu `@ảnh N` dùng để ghép nối trực tiếp với ảnh tham chiếu tương ứng.

Cấu trúc Prompt:

```
@ảnh 1 {Tên tài nguyên}{Loại tài nguyên} @ảnh 2 {Tên tài nguyên}{Loại tài nguyên} ... ,

【Hình ảnh】{liên kết bối cảnh}，{từ bố cục theo cỡ cảnh}，{Mô tả hình ảnh được chuyển đổi đầy đủ — giữ nguyên toàn bộ chủ thể, quan hệ không gian, động tác của chủ thể, cảm xúc}。

【Ánh sáng】{hướng nguồn sáng}，{đổ bóng}，{tông màu}，{chi tiết}。

【Phong cách】{từ nối phong cách}，{từ họa phong}，cấm chữ ngoài khung hình、phụ đề、chữ giao diện UI。

Giữ nguyên khuôn mặt, kiểu tóc, trang phục của @ảnh N nhất quán với ảnh tham chiếu.
```

**Lưu ý**:
- Đoạn 【Hình ảnh】 bắt buộc thể hiện đầy đủ toàn bộ thông tin trong trường "Mô tả hình ảnh" của Bảng phân cảnh, **không được cắt bớt**
- Trong đoạn 【Hình ảnh】, tên Nhân vật/Bối cảnh/Đạo cụ **bắt buộc dùng ký hiệu `@ảnh N`** (không được viết trực tiếp bằng tên chữ)
- Thông tin hướng (ví dụ "3/4 chính diện phải") bắt buộc được lồng vào đoạn 【Hình ảnh】
- Không thêm câu mở đầu kiểu "Based on the reference image... Generate a new scene..." (ký hiệu `@ảnh N` đã đảm nhiệm chức năng ghép nối ảnh tham chiếu; thêm câu mở đầu sẽ khiến Mô tả hình ảnh bị lặp lại, dư thừa nội dung)

> Nội dung cụ thể của `[từ nối phong cách]`, `[từ họa phong]` do **tệp phong cách riêng** (`director_storyboard`) định nghĩa.

### Chế Độ B: Nanobanana (Đa Phương Thức + JSON)

**Cơ chế**: Ảnh tham chiếu và prompt được đưa vào cùng lúc dưới dạng đầu vào đa phương thức (multi-modal); prompt sử dụng JSON có cấu trúc để đảm bảo tính nhất quán nhân vật.

Cấu trúc Prompt (mẫu):

```json
{
  "role": "You are a cinematographer and storyboard artist. Maintain strict visual continuity across all shots.",
  "character_reference": [
    { "image": 1, "ref": "@ảnh 1", "description": "[Mô tả ngoại hình: màu tóc/kiểu tóc/trang phục/vóc dáng]" },
    { "image": 2, "ref": "@ảnh 2", "description": "[Mô tả ngoại hình]" }
  ],
  "continuity_rules": [
    "Same wardrobe, hairstyle, face features across ALL shots",
    "Same environment, lighting style, color grade",
    "Only framing, angle, action, expression may change",
    "Do NOT introduce new characters not in reference images"
  ],
  "shot": {
    "scene_and_framing": "[Liên kết bối cảnh + từ bố cục theo cỡ cảnh]",
    "subject_and_action": "[Động tác của chủ thể + biểu cảm + cảm xúc + toàn bộ yếu tố hình ảnh trong Mô tả hình ảnh, có dùng ký hiệu @ảnh N để chỉ tên Nhân vật/Bối cảnh]",
    "lighting": "[Hướng nguồn sáng + đổ bóng + tông màu + chi tiết]",
    "style": "[Từ nối phong cách + từ họa phong]"
  },
  "negative": "[các từ cấm kỵ, no subtitles, no watermark, no UI text] (nội dung cụ thể do tệp phong cách riêng định nghĩa)"
}
```

**Lưu ý**:
- Trường `shot` chia thành 4 trường con; Mô tả hình ảnh được đặt vào 2 vị trí `scene_and_framing` và `subject_and_action`, từ phong cách được nén gọn
- Trường `subject_and_action` có mật độ thông tin cao nhất, bắt buộc thể hiện đầy đủ nội dung từ「Mô tả hình ảnh」+「Hành động nhân vật」+「Cảm xúc」của Bảng phân cảnh
- Ảnh tham chiếu được đưa vào dưới dạng ảnh thực (image input), không phải văn bản chứa URL
- Mô tả nhân vật giữ ở mức 1-2 câu ngắn gọn, không viết dài dòng

---

## Tổng Quan Quy Ước Ngôn Ngữ & Đầu Ra

- Chế độ A (Seedream): dùng Prompt dạng đoạn văn tự nhiên
- Chế độ B (Nanobanana): dùng Prompt dạng JSON có cấu trúc
- Prompt lấy "nội dung là chính + hình ảnh là trọng tâm" làm nguyên tắc, ưu tiên dùng từ ngữ mang tính miêu tả
- Không dùng các từ ngữ có thể làm giảm chất lượng ảnh (xem bảng ở mục "Từ Ngữ Cần Tránh Khi Vẽ" bên dưới)
- Chế độ B: trường negative xuất theo nội dung "từ cấm kỵ" do tệp phong cách riêng cung cấp, mỗi Phân cảnh bắt buộc phải có, không được bỏ trống; Chế độ A: không xuất trường negative
- Từ họa phong xuất theo nội dung "từ họa phong" do tệp phong cách riêng cung cấp, mỗi Phân cảnh bắt buộc phải có

---

## Chữ Ngoài Khung Hình vs Chữ Trong Khung Hình

- **Chữ ngoài khung hình** (phụ đề, watermark, tiêu đề, chữ giao diện UI...) → **phải cấm tuyệt đối**, bắt buộc nêu rõ lệnh cấm trong đoạn 【Phong cách】 và trường negative
- **Chữ trong khung hình** (chữ vốn tồn tại tự nhiên trong bối cảnh dưới dạng đạo cụ: bảng hiệu, biển tên nhân vật đang cầm, giấy tờ, tin nhắn, biểu đồ...) → **thuộc về đạo cụ của Bối cảnh**, khi Mô tả hình ảnh của Phân cảnh có nhắc tới loại nội dung này, vẫn mô tả bình thường trong đoạn 【Hình ảnh】, không bị giới hạn bởi lệnh cấm chữ
- **Cách phân biệt**: chữ đó có tồn tại bên trong **thế giới của câu chuyện** hay không. Chữ trên tấm biển = đạo cụ trong khung hình ✅; phụ đề đối thoại đè lên khung hình = chữ ngoài khung hình ❌

---

## Từ Ngữ Cần Tránh Khi Vẽ (Áp Dụng Mọi Phong Cách)

| Từ/cụm từ | Ảnh hưởng đến mô hình | Thay thế an toàn |
|---------|---------|----------|
| `film grain` / `noise` | Gây nhiễu hạt trên toàn bộ ảnh | `subtle cinematic texture` / kết cấu điện ảnh nhẹ |
| `imperfect focus` / `out of focus` | Làm mất nét toàn ảnh | Xóa trực tiếp |
| `edges not perfectly sharp` | Làm mờ viền/cạnh vật thể | Xóa trực tiếp |
| `slight natural deviation` | Gây lệch tỷ lệ tổng thể | Xóa trực tiếp |
| `not completely stable` | Làm khung hình mờ, thiếu ổn định | Xóa trực tiếp |
| `blurry background` (có hại) | Khiến chủ thể cũng bị mờ theo | `background bokeh, subject in sharp focus` |
| `hazy` / `foggy` (có hại) | Làm toàn ảnh bị mờ sương | Chỉ dùng khi cảnh thực sự cần sương mù, và phải kèm thêm `subject sharp` |
| `soft focus` / `dreamy` | Làm giảm độ nét tổng thể | Xóa trực tiếp |

> **Nguyên tắc cốt lõi**: Nội dung có thể "không hoàn hảo" (ánh sáng không đều, bố cục chưa chuẩn), nhưng khung hình bắt buộc phải sắc nét, rõ ràng.

---

## Xử Lý Hàng Loạt

Khi người dùng đưa vào nhiều Bảng phân cảnh cùng lúc:

1. **Xử lý theo đúng thứ tự**, không được bỏ sót hoặc gộp các Phân cảnh lại với nhau
2. Mỗi Phân cảnh chỉ xuất ra phần thân Prompt theo đúng chế độ đã chọn (Prompt đoạn văn hoặc JSON Prompt)
3. Nếu nhiều cảnh quay dùng chung một Bối cảnh, **từ ngữ mô tả Bối cảnh có thể lặp lại**, nhưng cảm xúc / ánh sáng / cỡ cảnh / động tác bắt buộc **xử lý riêng theo từng Phân cảnh**
4. Với các cảnh quay dùng chung tên tài nguyên liên kết, **cùng một ký hiệu tham chiếu (`@ảnh N`) bắt buộc phải luôn ứng với đúng một tài nguyên duy nhất** trong toàn bộ lô xử lý
5. Không thêm các phần nội dung ngoài Prompt (như tổng hợp tài nguyên, nội dung Lời thoại/Âm hiệu, ghi chú kiểm tra)

---

## Ký Hiệu Tài Nguyên Hình Ảnh

Trường `prompt` của mỗi Phân cảnh bắt buộc dùng **ký hiệu tài nguyên hình ảnh** làm phần tiền tố, và **trong phần thân Prompt phải dùng `@ảnh N` để chỉ trực tiếp tên Nhân vật/Bối cảnh/Đạo cụ tương ứng**, tạo mối liên kết ghép nối trực tiếp giữa ảnh tham chiếu và Mô tả hình ảnh. Ký hiệu được đánh số theo thứ tự tài nguyên xuất hiện trong `associateAssetsIds`, bắt đầu tuần tự từ `@ảnh 1`.

**Khuôn mẫu**: `@ảnh 1 {Tên tài nguyên}{Loại tài nguyên} @ảnh 2 {Tên tài nguyên}{Loại tài nguyên} ... , Prompt mà trong phần thân dùng @ảnh N để chỉ tên Nhân vật/Bối cảnh`

**Bảng loại tài nguyên**:

| Loại tài nguyên (type) | Từ ký hiệu |
|-----------|------------|
| role      | Nhân vật       |
| tool      | Đạo cụ       |
| scene     | Bối cảnh       |
| clip      | Đoạn video        |

**Lưu ý**:
- Đánh số bắt đầu từ `@ảnh 1`, theo đúng thứ tự trong mảng `associateAssetsIds`
- Mỗi Tài nguyên ID trong danh sách tương ứng với đúng một ký hiệu, **không thiếu, không thừa**
- Tên tài nguyên lấy từ trường `name` của tài nguyên trong dữ liệu assets
- Loại tài nguyên tra theo bảng loại ở trên
- Phần ký hiệu và phần thân Prompt cách nhau bằng dấu `, `
- Ký hiệu được sinh ra tự động từ `name` và `type` của tài nguyên
- **Ghép nối trong phần thân (bắt buộc)**: Trong phần thân Prompt, mọi vị trí lẽ ra ghi tên Nhân vật/tên Bối cảnh/tên Đạo cụ **bắt buộc phải thay bằng ký hiệu `@ảnh N` tương ứng**, không được viết trực tiếp bằng tên chữ. Cách này tạo liên kết trực tiếp giữa ảnh tham chiếu và chủ thể hình ảnh trong khung hình, tránh trường hợp tên tài nguyên khác với tên nhân vật gây hiểu nhầm về ngữ nghĩa (ví dụ: khi tên tài nguyên do hệ thống sinh ra không trùng khớp với tên nhân vật gốc, dùng `@ảnh N` sẽ tham chiếu trực tiếp mà không phụ thuộc vào tên gọi)
- Cùng một `@ảnh N` có thể xuất hiện nhiều lần trong phần thân Prompt (ví dụ nhân vật xuất hiện cả ở tiền cảnh và trong cảnh phụ cùng lúc)

**Ví dụ** (giả sử `associateAssetsIds="[A, B, C]"` tương ứng với Nhân vật (role), Nhân vật (role), Bối cảnh (scene)):

❌ Sai (phần thân dùng tên chữ, tiền tố ký hiệu bị bỏ phí):
```
@ảnh 1 Lâm Tuyết Nhân vật @ảnh 2 Trần Phong Nhân vật @ảnh 3 Rừng Trúc Bối cảnh, Lâm Tuyết đang cúi nhìn xuống chỗ Trần Phong, trong Bối cảnh Rừng Trúc sáng sủa……
```

✅ Đúng (phần thân dùng `@ảnh N` để ghép nối trực tiếp với ảnh tham chiếu):
```
@ảnh 1 Lâm Tuyết Nhân vật @ảnh 2 Trần Phong Nhân vật @ảnh 3 Rừng Trúc Bối cảnh,

【Hình ảnh】Trong khung cảnh @ảnh 3, bố cục trung cảnh, @ảnh 1 đứng ở phía bên trái khung hình, quay 3/4 mặt phải, ánh mắt dịu dàng, cúi nhìn về phía @ảnh 2 đang ngồi ở bên phải khung hình; @ảnh 2 ngồi xuống, quay 3/4 mặt trái, hai tay đặt lên đùi……
```

---

## Hướng Nhân Vật

Khi tạo prompt cho mỗi Phân cảnh, bắt buộc đảm bảo hướng của nhân vật nhất quán theo các quy tắc dưới đây.

### 1. Xác Định Hướng (Lấy Trực Tiếp Từ Bảng Phân Cảnh)

Trường "Hành động nhân vật" của Bảng phân cảnh đã bao gồm ký hiệu hướng theo định dạng `｜:`, khi tạo Prompt **ưu tiên trích xuất trực tiếp** ký hiệu này và **lồng vào** trong prompt bằng từ chỉ phương hướng tương ứng (ví dụ `facing right` / "hướng mặt phải", `three-quarter view facing left` / "3/4 mặt trái").

**Thứ tự ưu tiên xác định hướng** (từ cao xuống thấp):

| Mức ưu tiên | Nguồn xác định | Logic xử lý |
|--------|---------|----------|
| **1** | **Ký hiệu `｜:` trong trường Hành động nhân vật** | Bảng phân cảnh đã ghi rõ ký hiệu → **dùng trực tiếp**, không cần suy luận |
| 2 | **Từ chỉ phương hướng có trong Mô tả hình ảnh** | Mô tả hình ảnh có nhắc trực tiếp (như "nhìn thẳng vào ống kính", "quay lưng", "nhìn nghiêng") → dùng trực tiếp (chỉ áp dụng khi mức 1 không có) |
| 3 | **Quan hệ không gian giữa nhiều nhân vật (trục 180 độ)** | Trong bối cảnh đối thoại/đối đầu/tương tác, 2 nhân vật quay mặt vào nhau: nhân vật bên trái khung hình quay mặt phải, nhân vật bên phải khung hình quay mặt trái. Nguyên tắc này được thiết lập ngay từ cảnh đầu tiên và duy trì xuyên suốt toàn bộ Bối cảnh liên quan |
| 4 | **Suy luận theo cỡ cảnh** | Cảnh qua vai: nhân vật tiền cảnh quay lưng/nghiêng về ống kính, nhân vật ở viễn cảnh quay mặt về hướng ống kính; Đặc tả (close-up)/Cận cảnh (close-up): mặc định 3/4 mặt |
| 5 | **Suy luận theo ngữ nghĩa cảm xúc/sự việc** | Né tránh/sợ hãi/quay lưng bỏ đi → quay lưng hoặc 3/4 mặt sau; đối đầu/chất vấn → chính diện hoặc 3/4 chính diện hướng thẳng; ngập ngừng/do dự → quay đầu hướng sang một bên |
| 6 | **Logic không gian của Bối cảnh** | Đứng ở cửa ra vào → mặt hướng ra ngoài cửa; đứng tựa lưng vào tường/cửa sổ → mặt hướng theo hướng đối diện với điểm tựa; đứng bên bờ vực/cao điểm → mặt hướng xuống nhìn cảnh bên dưới |

> **Trong đa số trường hợp chỉ cần áp dụng mức ưu tiên 1**, vì Bảng phân cảnh đã được đánh ký hiệu ngay từ khâu tạo ban đầu. Các mức ưu tiên 2~6 chỉ dùng để suy luận bổ sung khi Bảng phân cảnh thiếu ký hiệu hướng.

**Các bước xác định**:
1. Trích xuất nội dung ký hiệu sau dấu `｜:` trong trường "Hành động nhân vật" của Phân cảnh hiện tại
2. Nếu ký hiệu tồn tại và đầy đủ → dùng trực tiếp, bỏ qua các mức ưu tiên sau
3. Nếu ký hiệu bị thiếu (như cảnh quay trống thông tin này) → suy luận theo thứ tự mức ưu tiên 2~6
4. Đưa thông tin xác định được vào đúng vị trí mô tả nhân vật tương ứng trong prompt

**Kho từ hướng**:

| Loại hướng | Chế độ A (tiếng Việt) | Chế độ B (tiếng Anh) | Bối cảnh áp dụng |
|---------|-------------|-------------|---------|
| Chính diện | nhìn thẳng vào ống kính | facing camera, front view | độc thoại nội tâm, nhìn thẳng vào ống kính |
| 3/4 chính diện | quay 3/4 mặt về phía ống kính | three-quarter view facing camera | đối thoại tự nhiên, truyền tải cảm xúc |
| Nhìn nghiêng | nhìn nghiêng | profile view, side view | đi cạnh nhau, quan sát, đối xứng ánh sáng |
| 3/4 mặt sau | quay 3/4 mặt sau | three-quarter back view | đang bước đi, rời khỏi, quay lưng đáp trả |
| Quay lưng | quay lưng về phía ống kính | back view, from behind | vào cảnh, xa cách, bí ẩn |
| Hướng trái | mặt hướng về bên trái khung hình | facing left | nhân vật ở bên phải trục 180°, mục tiêu quan sát ở bên trái |
| Hướng phải | mặt hướng về bên phải khung hình | facing right | nhân vật ở bên trái trục 180°, mục tiêu quan sát ở bên phải |
| Cúi đầu | hơi cúi đầu | slightly looking down | tự ti, trầm ngâm, suy tư |
| Ngẩng đầu | hơi ngẩng đầu | slightly looking up | chờ đợi, hy vọng, kỳ vọng |

> Ký hiệu hướng bắt buộc gồm cả **hướng mặt cơ bản** (trái/phải/về phía ống kính) và **góc ngẩng/cúi đầu** (nếu có), ví dụ "3/4 mặt phải, hơi ngẩng đầu".

### 2. Tính Liên Tục Về Vị Trí

- **Tính liên tục vị trí trong khung hình**: Cùng một Nhân vật xuất hiện ở nhiều Phân cảnh trong cùng một Bối cảnh, vị trí trái-phải trong khung hình (trái / giữa / phải) bắt buộc phải giữ nhất quán, không được thay đổi tùy tiện không có lý do
- **Quy tắc trục 180 độ**: Trong bối cảnh đối thoại/đối đầu, duy trì trục 180° — Nhân vật A quay mặt phải trong suốt toàn bộ Bối cảnh, Nhân vật B quay mặt trái trong suốt toàn bộ Bối cảnh; prompt bắt buộc thể hiện bằng từ chỉ phương hướng (`facing left` / hướng mặt trái, `on the left side of frame` / bên trái khung hình)
- **Tính nhất quán về lớp tiền-hậu cảnh**: Nếu Nhân vật A ở Phân cảnh N nằm ở tiền cảnh, Nhân vật B nằm ở trung cảnh, thì ở các Phân cảnh sau trong cùng Bối cảnh, quan hệ tiền-hậu cảnh giữa hai nhân vật đó không được đảo ngược một cách vô lý
- **Thay đổi vị trí phải có động tác nối tiếp**: Khi vị trí của Nhân vật trong khung hình cần thay đổi (như nhân vật chạy, di chuyển), prompt của Phân cảnh liền trước đó bắt buộc phải bao gồm mô tả động tác di chuyển/chuyển vị tương ứng, không được để trống
- **Thay đổi hướng phải có động tác nối tiếp**: Khi hướng của Nhân vật cần thay đổi (như quay đầu, quay người lại), prompt của Phân cảnh hiện tại bắt buộc phải bao gồm mô tả động tác chuyển hướng (như "quay đầu về phía trái khung hình"), và động tác chuyển hướng này phải nhất quán với trường "Hành động nhân vật" trong Bảng phân cảnh, không được tự ý sửa đổi
- **Sắp xếp lại khi đổi Bối cảnh**: Khi chuyển sang một Bối cảnh hoàn toàn mới, được phép sắp xếp lại vị trí nhân vật trong khung hình, nhưng trong nội bộ Bối cảnh mới đó vẫn phải giữ tính nhất quán

### 3. Tính Liên Kết Hình Ảnh Của Cảnh Phụ (Gương, Phản Chiếu)

Khi trong khung hình có xuất hiện cảnh phụ (hình phản chiếu qua gương, mặt nước phản chiếu, kính chiếu hậu, màn hình/ống kính máy quay...), cần lưu ý những điều sau:

- **Đảo chiều gương/phản chiếu**: Trong ảnh phản chiếu, hướng trái-phải của Nhân vật bị đảo ngược so với thực tế (thân thật hướng mặt phải → ảnh phản chiếu hướng mặt trái), prompt bắt buộc thể hiện rõ mối quan hệ đảo chiều này (như "@ảnh 1 hướng mặt phải, trong gương phản chiếu @ảnh 1 hướng mặt trái")
- **Cảnh phụ không làm thay đổi vị trí gốc**: Vị trí thực tế của Nhân vật trong khung hình vẫn giữ nguyên, sự xuất hiện của cảnh phụ không kéo theo thay đổi vị trí của nhân vật thật
- **Nội dung trong cảnh phụ phải nhất quán**: Trang phục, kiểu tóc, biểu cảm của Nhân vật nhìn thấy trong cảnh phụ bắt buộc đồng nhất với nhân vật thật, không được có sai lệch
- **Độ rõ nét của cảnh phụ tùy theo vật liệu**: Tùy theo chất liệu và trạng thái của bề mặt phản chiếu, hình ảnh trong cảnh phụ có thể có độ rõ nét thấp hơn (như hình ảnh mờ nhòe trên mặt nước), nhưng vẫn bắt buộc phải được thể hiện trong prompt (như "phản chiếu mờ trên mặt nước")
- **Kích hoạt đặc biệt**: Khi Mô tả hình ảnh của Phân cảnh hoặc Tài nguyên Bối cảnh có nhắc tới gương, mặt nước, kính, biển hiệu phản chiếu ánh sáng, màn hình máy quay và các bề mặt phản chiếu khác, tự động áp dụng các quy tắc trên

---

## Ví Dụ Minh Họa: Toàn Bộ Quy Trình

Dưới đây là toàn bộ quy trình từ đầu vào đến đầu ra của một Phân cảnh mẫu, để Agent tham khảo. Ví dụ này dùng các tên gọi tượng trưng (Nhân vật, Bối cảnh, Đạo cụ X...), thay cho nội dung cụ thể của Bảng phân cảnh thực tế.

### Đầu Vào (Bảng Phân Cảnh Mẫu)

| Trường | Nội dung |
|------|------|
| Mô tả hình ảnh | Mở đầu bằng hiệu ứng fade-in, Bối cảnh Cổng Ra Vào hiện lên trong đại viễn cảnh, đám đông đang di chuyển, một chiếc đèn lồng treo cao ở phía bên phải khung hình; Nhân vật đang cầm Đạo cụ X đi giữa đám đông, ống kính đẩy dần vào Trung cảnh, tay còn lại của Nhân vật cầm Đạo cụ Y, bước về phía chiếc đèn lồng, bố cục liền mạch |
| Bối cảnh | Cổng ra vào |
| Cỡ cảnh | Viễn cảnh (extreme wide shot) → Trung cảnh (medium shot) |
| Hành động nhân vật | Gồm các bước: bước đi giữa đám đông → tiến lại gần → hướng về phía đèn lồng → tay cầm Đạo cụ Y ｜: 3/4 chính diện phải |
| Cảm xúc | Căng thẳng xen lẫn háo hức, cảm xúc xuyên suốt nhất quán |
| Ánh sáng & Không khí | Ánh sáng ngược chiều hòa cùng ánh đèn lồng, đổ bóng rõ nét trên mặt đất, ánh đèn lồng trong trẻo dẫn lối, tạo luồng sáng ấm bao quanh nhân vật |
| Mã ID tài nguyên liên kết | [a, b, c, d] → Nhân vật (role), Đạo cụ X (tool), Đạo cụ Y (tool), Bối cảnh Cổng Ra Vào (scene) |

### Đầu Ra (Chế Độ A · Seedream)

```
@ảnh 1 Nhân vật Nhân vật @ảnh 2 Đạo cụ X Đạo cụ @ảnh 3 Đạo cụ Y Đạo cụ @ảnh 4 Cổng Ra Vào Bối cảnh,

【Hình ảnh】@ảnh 4, mở đầu bằng hiệu ứng fade-in, bố cục đại viễn cảnh, đám đông đang di chuyển, một chiếc đèn lồng treo ở phía bên phải khung hình; @ảnh 1 đang cầm @ảnh 2 đi giữa đám đông, tay còn lại cầm @ảnh 3, dáng người quay 3/4 chính diện phải, bước đi giữa đám đông, hướng về phía chiếc đèn lồng bên phải, bố cục liền mạch, ánh mắt tập trung vào đích đến.

【Ánh sáng】Ánh sáng ngược chiều hòa cùng ánh đèn lồng, đổ bóng rõ nét trên mặt đất, ánh đèn lồng trong trẻo dẫn lối, tạo luồng sáng ấm bao quanh nhân vật, @ảnh 1 nửa sáng nửa tối, khuôn mặt được chiếu sáng một phần.

【Phong cách】{từ nối phong cách}，{từ họa phong}，cấm chữ ngoài khung hình、phụ đề、chữ giao diện UI。

Giữ nguyên khuôn mặt, kiểu tóc, trang phục của @ảnh 1 nhất quán với ảnh tham chiếu.
```

> Nội dung `{từ nối phong cách}`、`{từ họa phong}` trong đoạn 【Phong cách】 do tệp phong cách riêng (`director_storyboard`) cung cấp, tài liệu này không quy định nội dung cụ thể.

### Đối Chiếu Kết Quả

| Trường Bảng phân cảnh | Vị trí thể hiện trong Prompt | Có khớp không |
|-----------|---------------|---------|
| Mở đầu bằng fade-in | 【Hình ảnh】"mở đầu bằng hiệu ứng fade-in" | ✅ |
| Bối cảnh Cổng Ra Vào | 【Hình ảnh】"@ảnh 4" | ✅ |
| Đại viễn cảnh (cỡ cảnh ban đầu) | 【Hình ảnh】"bố cục đại viễn cảnh" | ✅ |
| Đám đông đang di chuyển | 【Hình ảnh】"đám đông đang di chuyển" | ✅ |
| Đèn lồng ở bên phải | 【Hình ảnh】"một chiếc đèn lồng treo ở phía bên phải khung hình" | ✅ |
| Nhân vật cầm Đạo cụ X | 【Hình ảnh】"@ảnh 1 đang cầm @ảnh 2 đi giữa đám đông" | ✅ |
| Tay cầm Đạo cụ Y | 【Hình ảnh】"tay còn lại cầm @ảnh 3" | ✅ |
| Bước về phía đèn lồng | 【Hình ảnh】"bước đi giữa đám đông, hướng về phía chiếc đèn lồng bên phải" | ✅ |
| 3/4 chính diện phải | 【Hình ảnh】"dáng người quay 3/4 chính diện phải" | ✅ |
| Bố cục liền mạch | 【Hình ảnh】"bố cục liền mạch" | ✅ |
| Ánh sáng ngược + đổ bóng | 【Ánh sáng】"Ánh sáng ngược chiều hòa cùng ánh đèn lồng, đổ bóng rõ nét" | ✅ |
| Ánh đèn lồng dẫn lối | 【Ánh sáng】"ánh đèn lồng trong trẻo dẫn lối" | ✅ |

**Sai lệch: 0, đối chiếu đạt yêu cầu.**
