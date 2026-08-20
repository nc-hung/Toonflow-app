---
name: storyboard_prompt_techniques
description: >-
  thông hàm Phân cảnhPromptthức tham chiếu。
  Promptgiải tích 、Cỡ cảnhtừ kho 、Định dạng đầu ra、Promptkết cấu 、vẽ 、hình ảnhTài nguyênbiểu tâm 、ngườivị trí trí ，nhà  Agent kích hoạt hàm 。
---
# Phân cảnhPrompt · thông hàm cơ sở thức 

> dưới Phân cảnhPrompttạo của **thông hàm cơ sở **，hàm với tất cảtrực quanPhong cách。Phong cáchnối từ 、tình xúc 、Ánh sángtừ kho 、Bối cảnh、đẹp Nghiêm cấm**Phong cáchliên nội dung**do Phong cáchriêng biệt thức （`director_storyboard`）nối nghĩa 。

---

## hàm mô thức 

sách chỉ hỗ trợdưới 2loại **tham chiếuảnh 1 mô thức **tải ra ：

- **mô thức A**：Seedream（doubao-seedream）
- **mô thức B**：Nanobanana（Gemini）

> ⚠️ **không tạoText-to-Imagemô thức Prompt**，tất cảtải ra cơ sở với **tham chiếuảnh （Image-to-Image / ControlNet / Nhân vật1 ）**Quy trình làm việctrước nhắc 。

---

## Bảng phân cảnhnội dunggốc （tối đa trước cấp ）

Prompttạolà **khung thức chuyển đổi **，không là **sáng ý tác vụ **。Bảng phân cảnhlà Prompt của **1 nội dungnguồn **，tất cảvẽ mặt thông tinBắt buộcvới Bảng phân cảnhđúng hồi thi ，chỉ ở bảng khung thức  và trên nối hình ảnhtạomô hình của Yêu cầu。

### Nguyên Tắc Cốt Lõi：Mô tả hình ảnhlà chính ，không là 

Bảng phân cảnh「Mô tả hình ảnh」chữ đoạn xuống Ống kính của toàn bộtrực quanthông tin，là Promptchính tài  của **chính nội dung**。Phong cáchtừ 、vẽ từ 、Ánh sángtừ loại từ là **giúp **，phục vụ với Mô tả hình ảnh。khi 2giả ở  token toán trên rỗng gian ，**Mô tả hình ảnhtrước **，nhỏ Phong cáchtừ cũng không xóa Mô tả hình ảnhgiữa  của trực quan。

### 

1. **Mô tả hình ảnhchỉnh lưu lưu **：Bảng phân cảnh「Mô tả hình ảnh」chữ đoạn giữa  của tất cảtrực quan（chính thể 、tệp 、rỗng gian liên dòng 、động thái tiết 、Ống kínhliên dòng ）Bắt buộcở Promptchính tài giữa chỉnh ra ，**không được 1 **
2. **ngữ nghĩa chuyển đổi **：Bảng phân cảnhchữ đoạn chuyển đổi Prompt，chỉ sửa bảng dạng thức （giữa ↔、tài ↔liên từ 、việc ngữ ↔trực quanMô tả），**không sửa ngữ nghĩa **。lệ ：Bảng phân cảnh"tạo rỗng gian sáng " → PromptBắt buộcthể rỗng gian sáng gọi ，không đổi "tạo "không cùng ngữ nghĩa 
3. **Nghiêm cấmsáng ý phát **：không thêmBảng phân cảnhchưa nhắc  của trực quan（như Bảng phân cảnhchưa ，Promptkhông tự thi thêm）；không trùng mới Bối cảnhKhông khí（Bảng phân cảnh""không sửa ""）
4. **Phong cáchtừ từ biệt với nội dung**：Phong cáchnối từ 、vẽ nối từ 、Bối cảnhtừ Phong cáchloại từ là **giúp **，phục vụ với Bảng phân cảnhđã nối nghĩa  của vẽ mặt nội dung，không được phụ chính ——khi Phong cáchtừ Bảng phân cảnhcụ thể Mô tả，Bảng phân cảnh
5. **chữ đoạn trả đối chiếu **：tạomục Promptsau ，buộc chữ đoạn tỷ đúng Bảng phân cảnhđúng hồi thi ，dưới đã thể ：

| Bảng phân cảnhchữ đoạn  | Promptgiữa buộc thể  | đối chiếu cần điểm  |
|-----------|---------------|--------|
| Mô tả hình ảnh | Promptchính tài 【vẽ mặt 】đoạn  của nội dung | tất cảtrực quanchính thể 、rỗng gian liên dòng 、liên tiết là không **0**lưu lưu  |
| Bối cảnh | Promptchính tài 【vẽ mặt 】đoạn  của nối  | Bối cảnhLoạilà không 1  |
| Cỡ cảnh | Cỡ cảnhcấu ảnh từ  | Cỡ cảnhlà không khớp（lời hợp Cỡ cảnhxuất ban đầu đầu ） |
| Hành động nhân vật | chính thể thể thái  | động tác vụ ngữ nghĩa là không 1 、là không thức biểu tâm  |
| tình xúc  | tình xúc mặt dung từ  | tình xúc cơ sở gọi là không 1  |
| Ánh sáng & Không khí | Promptchính tài 【Ánh sáng】đoạn  | ánh nguồn phương 、vật gọi 、dẫn liên dòng là không chỉnh 1  |

> ⚠️ **đối chiếu không thông qua = Promptkhông hiệu **，Bắt buộcchính sau tải ra 。nhất thường thấy  của thất bạimô thức ：Mô tả hình ảnhgiữa  của cụ thể Phong cáchmô từ 。

---

## trưng khác gốc 

Hình ảnh phân cảnhlà **video của tham chiếu**。mô hìnhhồi dựa theoBảng phân cảnh「Mô tả hình ảnh」 của ngữ nghĩa tự thi  của trực quantrạng thái，không máy hàm "thái "mô 。

**logic**：

| Mô tả hình ảnhLoại | xử lý cách thức | Ví dụ |
|-------------|---------|------|
| **thái gian **（bước 、trạm lập video 、đầu 、） | **tính trực tiếp theo Mô tảtạo**，không động tác vụ sửa  | "Nhân vậtbước " → Prompttrực tiếp "bước " |
| **động tác vụ trình **（chạy dài 、dưới 、chuyển đi ） | xuất động tác vụ **ban đầu gian  của thái **（phi tượng thái ） | "dưới " → "đã đến đầu ，dưới ，dưới  của gian " |
| **Ống kínhvận động **（khuyến đến Trung cảnh (medium shot)、Kéo lùi (pull back / dolly out)đến Toàn cảnh (wide shot)、vào ） | xuất **ban đầu đầu Cỡ cảnh**tác vụ cấu ảnh  | "Viễn cảnh (extreme wide shot)→Trung cảnh (medium shot)" → xuất "lớn Viễn cảnh (extreme wide shot)" |
| **hiệu quả **（trường vào 、hóa chuyển trường ） | lưu lưu Mô tảnhưng biểu tâm mở trường trạng thái | "mở trường trường vào " → "vẽ mặt tự trường ，mở trường lớn Viễn cảnh (extreme wide shot)..." |

**phụ liệu **：Mô tả hình ảnh của chính động từ thái  và việc mật độ 。

> ❌ **lỗithức **：đem tất cảđộng tác vụ đều sửa tạo "phát sinh " của thái ，dẫn động tác vụ ngữ nghĩa 
> - Bảng phân cảnh"bước " → lỗisửa "đầu trước phương "（động tác vụ ）
> - Bảng phân cảnh"cao dưới " → lỗisửa "nhân "（tình xúc ）
>
> ✅ **chính thức **：Bảng phân cảnh của động tác vụ Mô tả，chỉ ở động tác vụ trình xuất ban đầu đầu 

---

## giải tích 

| Phân cảnhchữ đoạn  | Promptđúng hồi xử lý  |
|----------|----------------|
| Mô tả hình ảnh | **chính nội dung**：Promptchính tài 【vẽ mặt 】đoạn  của thông tinnguồn 。buộc chỉnh lưu lưu Mô tả hình ảnhgiữa  của **tất cả**thấy chính thể 、rỗng gian tầng lần 、liên tiết 、Ống kínhliên dòng ，chỉ việc ngữ chuyển đổi trực quanMô tảkhung thức 。xóa liên 、đổi không cùng ngữ nghĩa hoặc tự thi thêmMô tả hình ảnhgiữa không lưu ở  của trực quan |
| Bối cảnh | vào 【vẽ mặt 】đoạn tác vụ nối ，cộng Phong cáchriêng biệt thức  của Bối cảnhtừ  |
| Cỡ cảnh | Ống kínhcấu ảnh từ （thấy dưới phương Cỡ cảnhtừ kho ），buộc Bảng phân cảnh「Cỡ cảnh」chữ đoạn khớp。lời hợp Cỡ cảnh（như "Viễn cảnh (extreme wide shot)→Trung cảnh (medium shot)"）xuất **ban đầu đầu ** |
| Góc quay | chỉ tác vụ Phân cảnhchép tác vụ thông tin，không tiến vào Prompt，không tải ra Góc quaytâm  |
| Hành động nhân vật | cơ sở với Bảng phân cảnh「Hành động nhân vật」chữ đoạn ，theo "trưng khác gốc "xử lý 。Bắt buộclưu lưu động tác vụ ngữ nghĩa trong  `｜：` thức biểu tâm  |
| tình xúc  | cơ sở với Bảng phân cảnh「tình xúc 」chữ đoạn ，từ Phong cáchriêng biệt thức  của tình xúc bảng giữa chọn xuất khớp của mặt dung /từ 。tình xúc cơ sở gọi buộc Bảng phân cảnh1  |
| Ánh sáng & Không khí | cơ sở với Bảng phân cảnh「Ánh sáng & Không khí」chữ đoạn ，**lập tạo đoạn **vào 【Ánh sáng】đoạn ，chỉnh lưu lưu ánh nguồn phương 、vật gọi 、dẫn liên dòng 、tiết  |
| Lời thoại | không tiến vào Prompt，không tải ra  |
| Âm hiệu | không tiến vào Prompt，không tải ra  |
| Tên tài nguyên liên kết/ID | chỉ hàm với trong bộ tham chiếuảnh ghép nối，theo "hình ảnhTài nguyênbiểu tâm "xử lý  |

---

## Cỡ cảnhtừ kho （thông hàm ）

| Cỡ cảnhtải vào  | mô thức B（Nanobanana）tài Ống kínhtừ  | mô thức A（Seedream）giữa tài vẽ mặt từ  |
|----------|-------------------------------|---------------------------|
| lớn Viễn cảnh (extreme wide shot)/lớn Toàn cảnh (wide shot) | `extreme wide shot, establishing shot` | lớn Viễn cảnh (extreme wide shot)cấu ảnh ，toàn ，ngườinhỏ với Bối cảnh |
| Viễn cảnh (extreme wide shot)/Toàn cảnh (wide shot) | `wide shot, full shot, full body` | toàn vào quay ，Viễn cảnh (extreme wide shot)cấu ảnh ，ngườibối Tỷ lệgiao gọi  |
| Trung cảnh (medium shot) | `medium shot, cowboy shot, knee shot` | Trung cảnh (medium shot)cấu ảnh ，ngườitrên vào quay  |
| Cận cảnh (close-up) | `medium close-up, upper body` | Cận cảnh (close-up)cấu ảnh ，trên nửa vào quay ，bối hóa  |
| nửa  | `half body shot, bust shot` | nửa cấu ảnh ，bộ trên vào quay ，bối  |
| Đặc tả (close-up) | `close-up, face focus` | Đặc tả (close-up)cấu ảnh ，mặt bộ hoặc tiết cục bộ mở lớn ，bối độ hóa  |
| lớn Đặc tả (close-up) | `extreme close-up, macro detail` | lớn Đặc tả (close-up)，độ cục bộ tiết ，hóa bối  |
| quay  | `over the shoulder shot, two shot` | cấu ảnh ，trước bối ngườisau hóa ，Viễn cảnh (extreme wide shot)ngườisạch  |

**lời hợp Cỡ cảnhxử lý **：Bảng phân cảnh"Viễn cảnh (extreme wide shot)→Trung cảnh (medium shot)""Trung cảnh (medium shot)→Đặc tả (close-up)"Ống kínhvận động ，Hình ảnh phân cảnhtác vụ tham chiếu，**xuất đầu trái  của ban đầu Cỡ cảnh**。

---

## Định Dạng Đầu Ra

mục Phân cảnh**chỉ tải ra 1 loại mô thức  của Promptchính tài **（2chọn 1 ），không cùng mục Phân cảnhcùng tải ra mô thức Amô thức B。

**mô thức chọn lựa **：

| mục tệp  | chọn lựa mô thức  |
|------|----------|
| mục biểu mô hình Seedream / Doubaodòng hàng  | mô thức A（giữa tài  Prompt） |
| mục biểu mô hình Nanobanana / Gemini dòng hàng  | mô thức B（tài  JSON Prompt） |
| hàm dùng chưa nối mô hình | Mặc địnhmô thức A，hoặc vấn hỏi hàm dùng  |
| lượng tạo | toàn trình lưu giữ cùng 1 mô thức ，không giữa đổi  |

**tải ra nội dung**：
- chọn lựa mô thức A：chỉ tải ra  `[Prompt]` chính tài （không từ ，Seedream không hỗ trợ）
- chọn lựa mô thức B：chỉ tải ra  `[JSON Prompt]` chính tài （ `"negative"` chữ đoạn ）
- bỏ Promptchính tài ngoài ，dưới nội dungMặc địnhkhông tải ra ：Phân cảnhbiểu đề 、tham chiếuảnh ghép nốiGiải thích、Lời thoạitâm 、Âm hiệutâm 、kiểm tra 、Tài nguyêntổng 

---

## Promptkết cấu （Mô tả hình ảnhtrước ）

### kết cấu tổng 

Promptchính tài hàm **3đoạn thức kết cấu **，lưu Mô tả hình ảnhliệu chính địa vị trí ：

```
【vẽ mặt 】→ xuống Bảng phân cảnh「Mô tả hình ảnh」+「Bối cảnh」+「Cỡ cảnh」+「Hành động nhân vật」+「tình xúc 」 của chỉnh trực quannội dung（chính ，Mật độ thông tintối đa ）
【Ánh sáng】→ xuống Bảng phân cảnh「Ánh sáng & Không khí」 của ánh nguồn 、vật gọi 、dẫn liên dòng （lập tạo đoạn ，Phong cáchtừ nén ）
【Phong cách】→ Phong cáchnối từ  + vẽ nối từ  + Nghiêm cấmthanh dẫn （giúp ，ngắn ）
```

> **bài phútnối gốc **：【vẽ mặt 】đoạn Mật độ thông tintối đa 、bài nhất dài  của đoạn ，buộc chỉnh xuống Bảng phân cảnh「Mô tả hình ảnh」 của tất cảtrực quan；【Ánh sáng】đoạn lần  của ，lập xuống Ánh sáng & Không khí；【Phong cách】đoạn nhất ngắn ，chỉ mở bắt cần  của Phong cáchnối từ vẽ nối từ 。3đoạn xếp không 、dài độ không trí ——Phong cáchtừ bài vượt vẽ mặt đoạn ，thất bạinguyên ra 。

### mô thức A：Seedream（API `reference_images`）

máy chép ：tham chiếuảnh thông qua API tham số `reference_images` truyền vào ，prompt trong hàm  `@ảnh N` trực tiếp ghép nốitham chiếuảnh 。

Prompt kết cấu ：

```
@ảnh 1 {Tài nguyênTên}{Tài nguyênLoại} @ảnh 2 {Tài nguyênTên}{Tài nguyênLoại} ... ,

【vẽ mặt 】{Bối cảnhnối }，{Cỡ cảnhcấu ảnh từ }，{Mô tả hình ảnhchỉnh chuyển ——lưu lưu tất cảtrực quan、rỗng gian liên dòng 、chính thể động tác vụ 、、tình xúc }。

【Ánh sáng】{ánh nguồn phương }，{vật gọi }，{dẫn liên dòng }，{tiết }。

【Phong cách】{Phong cáchnối từ }，{vẽ nối từ }，Nghiêm cấmvẽ ngoài chữ 、、UI tài chữ 。

lưu giữ  @ảnh N mặt bộ 、phát kiểu 、phục tham chiếuảnh toàn 1 。
```

**liên **：
- 【vẽ mặt 】đoạn buộc chỉnh xuống Bảng phân cảnh「Mô tả hình ảnh」chữ đoạn  của tất cảthông tin，**không được xóa **
- 【vẽ mặt 】đoạn giữa ，Nhân vật/Bối cảnh/Đạo cụTên**Bắt buộchàm  `@ảnh N` **（không hàm tài chữ Tên）
- thông tinbuộc thức vào 【vẽ mặt 】đoạn （như "3/4chính mặt phải "）
- không cộng tài đoạn "Based on the reference image... Generate a new scene..."（`@ảnh N` máy chép đã tham chiếuảnh ghép nốicông thể ，cộng tài đoạn sẽ dẫn Mô tả hình ảnhra 2、dung ）

> `[Phong cáchnối từ ]`、`[vẽ nối từ ]`  của cụ thể nội dungdo **Phong cáchriêng biệt thức **nối nghĩa 。

### mô thức B：Nanobanana（nhiều mô thái  + JSON）

máy chép ：tham chiếuảnh  prompt 1 tác vụ nhiều mô thái tải vào ，prompt hàm kết cấu hóa  JSON Nhân vật1 。

Prompt kết cấu （nối ）：

```json
{
  "role": "You are a cinematographer and storyboard artist. Maintain strict visual continuity across all shots.",
  "character_reference": [
    { "image": 1, "ref": "@ảnh 1", "description": "[ngoài liên Mô tả: phát vật /phát kiểu /phục /thể kiểu ]" },
    { "image": 2, "ref": "@ảnh 2", "description": "[ngoài liên Mô tả]" }
  ],
  "continuity_rules": [
    "Same wardrobe, hairstyle, face features across ALL shots",
    "Same environment, lighting style, color grade",
    "Only framing, angle, action, expression may change",
    "Do NOT introduce new characters not in reference images"
  ],
  "shot": {
    "scene_and_framing": "[Bối cảnhnối  + Cỡ cảnhcấu ảnh từ ]",
    "subject_and_action": "[chính thể động tác vụ  +  + tình xúc  + tất cảMô tả hình ảnhgiữa  của trực quan，hàm @ảnh NNhân vật/Bối cảnhtên ]",
    "lighting": "[ánh nguồn phương  + vật gọi  + dẫn liên dòng  + ]",
    "style": "[Phong cáchnối từ  + vẽ nối từ ]"
  },
  "negative": "[từ mô ， no subtitles, no watermark, no UI text]（cụ thể từ mục do Phong cáchriêng biệt thức nối nghĩa ）"
}
```

**liên **：
- `shot` chữ đoạn phút 4 mục chữ đoạn ，chép Mô tả hình ảnh `scene_and_framing`  và  `subject_and_action` 2mục vị trí trí ，Phong cáchtừ nén 
- `subject_and_action` là Mật độ thông tintối đa  của chữ đoạn ，buộc chỉnh xuống Bảng phân cảnh「Mô tả hình ảnh」+「Hành động nhân vật」+「tình xúc 」
- tham chiếuảnh tác vụ hình ảnhtải vào ，không là  URL tài sách 
- Nhân vậtMô tảlưu giữ  1-2 câu liên ，dài 

---

## thông hàm ngữ lượng 

- mô thức A（Seedream）trước giữa tài tự ngữ đoạn 
- mô thức B（Nanobanana）trước tài  JSON kết cấu hóa Prompt
- Prompt"nội dungbảng  + vẽ "，mô loại từ 
- không hàm sẽ dẫn ảnh  của bảng （thấy dưới phương 「vẽ cấp hàm từ 」bảng ）
- mô thức B từ theo Phong cáchriêng biệt 「từ mô 」tải ra ，mục Bắt buộcgói ，không ；mô thức A không tải ra từ 
- vẽ nối từ theo Phong cáchriêng biệt 「vẽ nối từ 」mô tải ra ，mục Bắt buộcgói 

---

## vẽ ngoài tài chữ  vs vẽ trong tài chữ 

- **vẽ ngoài tài chữ **（chữ 、、biểu đề 、chữ  UI tầng tài chữ ）→ **đúng Nghiêm cấm**，Bắt buộcở 【Phong cách】đoạn  và từ giữa thanh dẫn Nghiêm cấm
- **vẽ trong tài chữ **（Bối cảnhgiữa tự lưu ở  của tài chữ Đạo cụ：Nhân vậtnhắc chữ 、trên  của chữ 、bổ 、tin nội dung、đường biểu 、）→ **biệt với Bối cảnhĐạo cụ**，khi Phân cảnhMô tả hình ảnhgiữa dẫn gói loại nội dung，hồi ở 【vẽ mặt 】đoạn chính thường Mô tảlưu ở ，không Nghiêm cấmtài chữ hạn chép 
- **biểu **：tài chữ là không lưu ở với **việc giới trong bộ **。bổ trên  của chữ  = vẽ trong Đạo cụ ✅；vẽ mặt bộ  của Nhân vậtđúng  = vẽ ngoài chữ  ❌

---

## vẽ cấp hàm từ （tất cảPhong cáchthông hàm ）

| hàm thức  | mô hìnhthi  | an toàn  |
|---------|---------|----------|
| `film grain` / `` | toàn ảnh cộng điểm  | `subtle cinematic texture` / `sáng ` |
| `imperfect focus` / `thất ` | toàn ảnh thất  | trực tiếp xóa |
| `edges not perfectly sharp` |  | trực tiếp xóa |
| `slight natural deviation` | chỉnh thể phúttỷ lệ  | trực tiếp xóa |
| `not completely stable` | vẽ mặt mô  | trực tiếp xóa |
| `blurry background`（hàm ） | chính thể đang  | `background bokeh, subject in sharp focus` |
| `hazy` / `foggy`（hàm ） | toàn ảnh hóa  | chỉ ở rỗng video cần cầu hàm ，cùng cộng  `subject sharp` |
| `` / `` | thấp chỉnh thể độ  | trực tiếp xóa |

> **Nguyên tắc cốt lõi**：nội dung"không đẹp "（ánh đường không 、cấu ảnh phi đúng ），vẽ Bắt buộc。

---

## lượng xử lý 

hàm dùng tải vào nhiều thi Bảng phân cảnh：

1. **thi xếp xử lý **，không thi 、không hợp nhất 
2. mục Phân cảnhchỉ tải ra mục biểu mô thức  của Promptchính tài （Prompt hoặc  JSON Prompt）
3. cùng 1 Bối cảnhnhiều quay ，**Bối cảnhtừ lời hàm **，nhưng tình xúc /ánh đường /Cỡ cảnh/động tác vụ Bắt buộc**theo thi lập xử lý **
4. Tên tài nguyên liên kếtcùng  của quay lần ，**1 biểu tâm từ Bắt buộc1 **
5. không cộng phi Promptkhu （như Tài nguyênhàm tổng 、Lời thoại/Âm hiệutâm 、kiểm tra ）

---

## hình ảnhTài nguyênbiểu tâm 

mục Phân cảnh của  `prompt` chữ đoạn Bắt buộc**hình ảnhTài nguyênbiểu tâm **tác vụ trước tố ，và **Promptchính tài giữa hàm  `@ảnh N` trực tiếp đúng hồi  của Nhân vật/Bối cảnh/Đạo cụTên**，tạo lập tham chiếuảnh Mô tả hình ảnh của trực tiếp ghép nốiliên dòng 。biểu tâm theo  `associateAssetsIds` giữa Tài nguyên của hàm xếp ，từ  `@ảnh 1` mở ban đầu phụ lần chỉnh số 。

**khung thức **：`@ảnh 1 {Tài nguyênTên}{Tài nguyênLoại} @ảnh 2 {Tài nguyênTên}{Tài nguyênLoại} ... , chính tài giữa hàm @ảnh NNhân vật/Bối cảnhTên của Prompt`

**Loại**：

| Tài nguyên type | biểu tâm Loạitừ  |
|-----------|------------|
| role      | Nhân vật       |
| tool      | Đạo cụ       |
| scene     | Bối cảnh       |
| clip      | đoạn        |

****：
- chỉnh số từ  `@ảnh 1` ，theo  `associateAssetsIds` số nhóm xếp phụ lần 
- mục hàm  của Tài nguyên ID đúng hồi một biểu tâm ，**không 、không nhiều ra **
- Tài nguyênTênhàm  assets dữ liệugiữa Tài nguyên của  `name` chữ đoạn 
- Tài nguyênLoạidựa theotrên phương Loạibảng 
- biểu tâm bộ phútPromptchính tài  của gian hàm  `, ` phútcách 
- sinh Tài nguyênhàm tự  `name`  và Tài nguyên của  `type`
- **chính tài ghép nối（）**：Promptchính tài giữa ，tất cảgốc sách hồi ra Nhân vậttên /Bối cảnhtên /Đạo cụtên  của vị trí trí ，**Bắt buộcđổi đúng hồi  của  `@ảnh N` biểu **，không hàm tài chữ Tên。nàykiểu tham chiếuảnh vẽ mặt giữa  của trực quanchính thể dạng tạo trực tiếp liên dòng ，Tài nguyênTênNhân vậtTênkhông 1 dẫn  của nghĩa （lệ như ：khi sinh Tài nguyên của Têngốc Nhân vậttên không 1 ，hàm  `@ảnh N` mở Tênnghĩa trực tiếp tham chiếuảnh ）
- cùng 1  `@ảnh N` ở chính tài giữa nhiều lần ra （như Nhân vậtở trước bối  và phụ mặt giữa cùng thấy ）

**Ví dụ**（giả thiết  `associateAssetsIds="[A, B, C]"` đúng hồi  Nhân vật(role)、Nhân vật(role)、Bối cảnh(scene)）：

❌ lỗi（chính tài hàm tài chữ Tên，trước tố biểu tâm tiết ）：
```
@ảnh 1 Nhân vậtNhân vật @ảnh 2 Nhân vậtNhân vật @ảnh 3 Bối cảnhBối cảnh, Nhân vật，cao dưới xem đang địa  của Nhân vật，Bối cảnhtrong sáng ……
```

✅ chính （chính tài hàm  @ảnh N trực tiếp ghép nốitham chiếuảnh ）：
```
@ảnh 1 Nhân vậtNhân vật @ảnh 2 Nhân vậtNhân vật @ảnh 3 Bối cảnhBối cảnh,

【vẽ mặt 】@ảnh 3 trong ，Trung cảnh (medium shot)cấu ảnh ，@ảnh 1 dạng lập với vẽ mặt trái ，3/4mặt phải ，nhân ，cao dưới video với vẽ mặt phải địa mặt  của @ảnh 2；@ảnh 2 địa ，3/4mặt trái ，đôi tay địa ，……
```

---

## ngườivị trí trí 

tạomục  prompt ，buộc dưới Phân cảnhngườivị trí trí 1 。

### 1 、lấy（từ Bảng phân cảnhlấyngườimặt bộ ）

Bảng phân cảnh của 「Hành động nhân vật」chữ đoạn đã gói  `｜：` thức biểu tâm ，Prompttạo**trước trực tiếp trích xuất**，nhất ở  prompt giữa **thức vào **đúng hồi phương vị trí từ （như  `facing right` / `mặt phải `、`three-quarter view facing left` / `3/4mặt trái `）。

**lấytrước cấp **（cao →thấp ）：

| trước cấp  | đường kiếm nguồn  | xử lý logic |
|--------|---------|----------|
| **1** | **Hành động nhân vậtchữ đoạn  của  `｜：` biểu tâm ** | Bảng phân cảnhđã thức biểu tâm  → **trực tiếp hàm **，không cần khuyến  |
| 2 | **Mô tả hình ảnhgiữa  của thức phương vị trí từ ** | Mô tả hình ảnhtrực tiếp nhắc （như "đúng Ống kính""ngoài ""mặt "）→ trực tiếp hàm （chỉ khi trước cấp 1thất ） |
| 3 | **nhiều Nhân vậtrỗng gian liên dòng （180° video đường ）** | đúng lời /đúng /động Bối cảnhgiữa ，2Nhân vậtmặt ：vẽ mặt trái Nhân vậtmặt phải ，vẽ mặt phải Nhân vậtmặt trái 。lần ra trường tạo lập cơ sở sau toàn Bối cảnhnối  |
| 4 | **Cỡ cảnhnhở ** | quay ：trước bối ngườiđúng /đúng Ống kính，Viễn cảnh (extreme wide shot)ngườimặt Ống kínhphương ；Đặc tả (close-up)/Cận cảnh (close-up)：Mặc định 3/4 mặt  |
| 5 | **tình xúc việc ngữ nghĩa ** | //trả  → mặt hoặc 3/4mặt ；đúng /hỏi  → chính mặt hoặc 3/4chính mặt đúng phương ；/ → đầu mở đúng phương  |
| 6 | **Bối cảnhrỗng gian logic** | cổng cổng  → mặt cổng ngoài ；phong bối  → mặt phong bối phương ； → mặt mặt thấp đầu  |

> **thường tình huống dưới chỉ cần xuất trước cấp 1**，Bảng phân cảnhđã ở nguồn đầu biểu tâm tạo 。trước cấp 2~6chỉ tác vụ Bảng phân cảnhbiểu tâm thất  của khuyến 。

**lấybước **：
1. xuất Bảng phân cảnhhiện tạithi 「Hành động nhân vật」chữ đoạn giữa  `｜：` sau  của biểu tâm nội dung
2. biểu tâm lưu ở và chỉnh  → trực tiếp hàm ，sau trước cấp 
3. biểu tâm thất （như rỗng quay thi ）→ theo trước cấp 2~6mục khuyến 
4. lấyđến  của thông tinvào  prompt giữa đúng hồi Nhân vật của Mô tảvị trí trí 

**từ kho **：

| Loại | mô thức A（giữa tài ） | mô thức B（tài ） | hàm Bối cảnh |
|---------|-------------|-------------|---------|
| chính mặt  | chính mặt mặt Ống kính | facing camera, front view | tự tôi、trực tiếp đúng video đường  |
| 3/4chính mặt  | 3/4mặt Ống kính | three-quarter view facing camera | đúng lời chính thể 、tình truyền  |
| chính mặt  | chính mặt  | profile view, side view | 、、đúng sáng  |
| 3/4mặt  | 3/4mặt  | three-quarter back view | đi 、、trả  |
| mặt  | đúng Ống kính | back view, from behind | đăng trường 、khác 、 |
| mặt trái  | mặt vẽ mặt trái  | facing left | 180°đường phải Nhân vật、trái mục biểu  |
| mặt phải  | mặt vẽ mặt phải  | facing right | 180°đường trái Nhân vật、phải mục biểu  |
| thấp đầu  | thấp đầu  | slightly looking down | 、trong 、 |
| đầu  | đầu  | slightly looking up | chậm 、、kỳ  |

> biểu tâm buộc cùng gói ****（mặt trái /phải /Ống kính） và ****（như có ），như "3/4mặt phải ，đầu "。

### 2、vị trí trí nối 

- **vẽ mặt vị trí trí nối **：cùng 1 Nhân vậtở cùng 1 Bối cảnhtrong  của nhiều mục Phân cảnhgiữa ，vẽ mặt trái phải vị trí trí （vẽ mặt trái  / giữa  / phải ）buộc lưu giữ nối ，không được không việc lý do địa 
- ****：đúng lời /đúng Bối cảnh 180° video đường ——Nhân vậtAmặt phải toàn Bối cảnhlưu giữ mặt phải ，Nhân vậtBmặt trái toàn Bối cảnhlưu giữ mặt trái ；prompt giữa buộc thông quaphương vị trí từ （facing left / mặt trái 、on the left side of frame / vẽ mặt trái ）thức biểu tâm 
- **trước sau bối tầng lần 1 **：Nhân vậtAở Phân cảnhNgiữa xử với trước bối 、Nhân vậtBxử với Trung cảnh (medium shot)，cùng Bối cảnhsau Phân cảnhgiữa 2giả trước sau liên dòng không hồi không lý do phụ chuyển 
- **vị trí trí hóa buộc có động tác vụ tiếp **：Nhân vậtvẽ mặt vị trí trí cần hóa （như Nhân vậtchạy động 、chuyển ），trước xếp Phân cảnh của  prompt giữa buộc gói đúng hồi vị trí /chuyển động tác vụ mô ，không rỗng vị trí 
- **hóa buộc có động tác vụ tiếp **：Nhân vậtcần hóa （như chuyển đầu 、trả ），hiện tạiPhân cảnh của  prompt giữa buộc gói chuyển động tác vụ mô （như "chuyển đầu vẽ mặt trái "），và chuyển buộc Bảng phân cảnh「Hành động nhân vật」chữ đoạn 1 ，không rỗng sửa 
- **Bối cảnhtrùng trí **：đổi đến toàn mới Bối cảnhtrùng mới phútnối vẽ mặt vị trí trí ，nhưng mới Bối cảnhtrong bộ buộc lưu giữ 1 

### 3、phụ mặt trực quanliên dòng 

khi vẽ mặt giữa lưu ở phụ （quay mặt 、mặt 、ánh biệt 、、máy Ống kính），buộc tâm ý dưới ：

- **quay chuyển **：phụ mặt giữa Nhân vật của trái phải thể phụ （thể mặt phải →quay mặt trái ），prompt giữa buộc thức biểu tâm phụ thể thể  của liên dòng （như "@ảnh 1 mặt phải ，mặt sáng giữa @ảnh 1 mặt trái "）
- **phụ mặt không sửa vị trí trí cơ sở **：Nhân vật của vẽ mặt vị trí trí thể ，phụ mặt giữa  của không video Nhân vậtvị trí trí hóa 
- **phụ mặt nội dungthể 1 **：phụ mặt giữa thấy  của Nhân vậtphục 、phát kiểu 、bảng tình Bắt buộccùng thể 1 ，không ra 
- **phụ mặt bối sạch độ **：dựa theophụ mặt  và ，phụ hình ảnhkhi thấp sạch độ （như mặt dẫn  của mô ），nhưng buộc ở  prompt giữa biểu tâm （như "mặt sáng "）
- **trưng khác phát **：khi Phân cảnhMô tả hình ảnhhoặc Bối cảnhTài nguyêngiữa gói quay mặt 、mặt 、mặt 、、、biệt phụ ánh 、máy /phụ ，tự động phát sách 

---

## ：chỉnh nguyên ra Ví dụ

dưới nhở 1 mục Phân cảnhtừ tải vào đến tải ra  của chỉnh trình ，nhà  Agent tham chiếu。sách Ví dụhàm tượng vị trí （Nhân vật、Bối cảnh、Đạo cụX ），hồi hàm đổi Bảng phân cảnh của cụ thể nội dung。

### tải vào （Bảng phân cảnhthi ）

| chữ đoạn  | nội dung |
|------|------|
| Mô tả hình ảnh | mở trường trường vào ，Bối cảnhra cổng lớn Viễn cảnh (extreme wide shot)，ngườiđộng ，mục nhở lập với vẽ mặt phải ，Nhân vậtđang Đạo cụX thi ngườigiữa ，Ống kínhkhuyến đến Trung cảnh (medium shot)，anh ấytay Đạo cụY bước nhở ，bức nối  |
| Bối cảnh | Bối cảnhra cổng  |
| Cỡ cảnh | Viễn cảnh (extreme wide shot)→Trung cảnh (medium shot) |
| Hành động nhân vật | gói bước thi trước thi →bước →đầu nhở →tay Đạo cụY ｜：3/4chính mặt phải  |
| tình xúc  | cục nối nhất lưu  |
| Ánh sáng & Không khí | trái  và ánh ，vật địa mặt ，nhở ánh sạch ，ngườisáng ánh dạng tạo  |
| Mã ID tài nguyên liên kết | [a, b, c, d] → Nhân vật(role)、Đạo cụX(tool)、Đạo cụY(tool)、Bối cảnhra cổng (scene) |

### tải ra （mô thức A · Seedream）

```
@ảnh 1 Nhân vậtNhân vật @ảnh 2 Đạo cụX Đạo cụ @ảnh 3 Đạo cụY Đạo cụ @ảnh 4 Bối cảnhra cổng Bối cảnh,

【vẽ mặt 】@ảnh 4，mở trường tự trường vào ，lớn Viễn cảnh (extreme wide shot)cấu ảnh ，ngườiđộng thi ，vẽ mặt phải mục lập có nhở ；@ảnh 1 đang @ảnh 2 thi với người của giữa ，tay giữa @ảnh 3，thể 3/4chính mặt phải ，bước với người của gian ，đầu vẽ mặt phải  của nhở ，bức nối ，mặt dung cục giữa đang ý 。

【Ánh sáng】trái  và ánh ，vật địa mặt ，nhở ánh sạch dẫn ，khí ngườisáng ánh dạng tạo sáng ，@ảnh 1 dạng nửa ánh nửa ánh ，mặt bộ 。

【Phong cách】{Phong cáchnối từ }，{vẽ nối từ }，Nghiêm cấmvẽ ngoài chữ 、、UI tài chữ 。

lưu giữ  @ảnh 1 mặt bộ 、phát kiểu 、phục tham chiếuảnh toàn 1 。
```

> 【Phong cách】đoạn giữa  của  `{Phong cáchnối từ }` `{vẽ nối từ }` do Phong cáchriêng biệt thức （`director_storyboard`）nhắc nhà ，sách thông hàm không cụ thể từ mục 。

### đối chiếu tỷ đúng 

| Bảng phân cảnhchữ đoạn  | Promptthể vị trí trí  | là không 1  |
|-----------|---------------|---------|
| mở trường trường vào  | 【vẽ mặt 】"mở trường tự trường vào " | ✅ |
| Bối cảnhra cổng  | 【vẽ mặt 】"@ảnh 4" | ✅ |
| lớn Viễn cảnh (extreme wide shot)（ban đầu đầu ） | 【vẽ mặt 】"lớn Viễn cảnh (extreme wide shot)cấu ảnh " | ✅ |
| ngườiđộng  | 【vẽ mặt 】"ngườiđộng thi " | ✅ |
| nhở ở phải  | 【vẽ mặt 】"vẽ mặt phải mục lập có nhở " | ✅ |
| Nhân vậtĐạo cụX thi  | 【vẽ mặt 】"@ảnh 1 đang @ảnh 2 thi với người của giữa " | ✅ |
| tay Đạo cụY | 【vẽ mặt 】"tay giữa @ảnh 3" | ✅ |
| bước nhở  | 【vẽ mặt 】"bước với người của gian ，đầu vẽ mặt phải  của nhở " | ✅ |
| 3/4chính mặt phải  | 【vẽ mặt 】"thể 3/4chính mặt phải " | ✅ |
| bức nối  | 【vẽ mặt 】"bức nối " | ✅ |
| trái ánh +vật  | 【Ánh sáng】"trái  và ánh ，vật " | ✅ |
| ngườisáng ánh sáng  | 【Ánh sáng】"ngườisáng ánh dạng tạo sáng " | ✅ |

**0，đối chiếu thông qua。**
