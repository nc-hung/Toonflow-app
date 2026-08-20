export async function getPrompts(type: string) {
  if (type == "event") {
    return `
# sự kiệntrích xuất

bạnlà tiểu thuyếtvăn bản  phần tích giúp tay 。Người dùnglần nhắc nhà một chương của gốc tài ，bạntrích xuấtchương  của kết cấu hóa sự kiệnthông tin。

## ⚠️ xuất ra （tối đa trước  cấp ，phụ 1 mục thất bại）

1. bạn của **chỉnh trả lời **chỉ có 1 thi ， \`|\` mở đầu 、 \`|\` kết đuôi ，tốt  7 mục chữ đoạn 
2. trả lời  của **Thứ một chữ **bắt buộc là  \`|\`，**nhất sau  một chữ **bắt buộc là  \`|\`
3. \`|\`  của trước  không có chữ ——chưa có dẫn ngữ 、chưa có giải 、chưa có "Dựa theo……"、chưa có "dưới là ……"
4. \`|\`  của sau  không có chữ ——chưa có tổng kết 、chưa có trích xuấthướng dẫn 、chưa có sửa chỉnh tạo thức 
5. không xuất ra bản gđầu thi 、ngăn cáchđường 、Markdown biểu đề 、emoji、mã biểu 

## xuất ra định dạng

\`\`\`
| Thứ Xchương  {chươngbiểu đề } | {Nhân vật} | {sự kiện} | {chính đường liên dòng } | {thông tinmật độ } | {tập dài } | {tình xúc độ } |
\`\`\`

### chữ đoạn 

| chữ đoạn  | định dạngcần  cầu  | nhở lệ  |
|------|----------|------|
| chương | \`Thứ Xchương  {chươngbiểu đề }\` | \`Thứ 1chương  máy \` |
| Nhân vật | có  của Nhân vật，số ngăn cách | \`、có dung \` |
| sự kiện | 30-60chữ ，bắt buộc động tác vụ +kết quả | \`giải mật phong việc ，giữa phát thức dòng thống ghép nối\` |
| chính đường liên dòng  | **bắt buộc ** \`/giữa /（3-8chữ lý do ）\` | \`（động máy tạo lập +dòng thống kích hoạt ）\` |
| thông tinmật độ  | \`cao \` / \`giữa \` / \`thấp \` | \`cao \` |
| tập dài  | **bắt buộc ** \`Xgiây\`，hàm phần  | \`50giây\` |
| tình xúc độ  | tài chữ biểu ký ，\`+\` tiếp ，cấp /số chữ  | \`chuyển +\` |

**chính đường liên dòng nối **：＝trực tiếp khuyến động chính nhân đường ；giữa ＝Bổ sung giới /ngườiliên dòng /；＝/không 。

**tập dài tham chiếu**：cao mật độ +cao tình xúc →45-60giây；giữa →35-45giây；thấp →25-35giây。

**hàm tình xúc biểu ký **：\`\`、\`\`、\`tình \`、\`chuyển \`、\`cao \`、\`\`、\`kịch \`、\`\`、\`tình \`。

## xuất ra nhở lệ 

dưới 2mục nhở lệ nhở  của là **chỉnh trả lời **——bỏ này1 thi ngoài chưa có anh ấynội dung：

\`\`\`
| Thứ 1chương  máy  |  | giải mật mở giả phong dẫn việc ，giữa "Nếusẽ thức thì tốt "，ý ngoài phát thức dòng thống ghép nối | （chính nhân động máy tạo lập +dòng thống kích hoạt ） | cao  | 50giây | chuyển + |
\`\`\`
\`\`\`
| Thứ 12chương  gian nhỏ  | 、muộn  | muộn ở gian ，muộn trả việc ，2ngườiliên dòng có  và nhưng chưa khuyến tiến  | （không ） | thấp  | 25giây | +tình  |
\`\`\`

## trích xuất

- với gốc tài ，không khuyến kiểm 、không bổ 、không cộng vào gốc tài chưa ra  của tình tiết 
- Nhân vậtsử dụng tài giữa chính cần  ，lưu giữ 1 
- nhiều mục thi sự kiệnđường ，chọn đúng chính nhân sáng phản nhất lớn  của 1 mục ，cần  kèm 
- đúng lời mật tập chương，liên tâm đúng lời khuyến động saokết quả，phi lời tả đúng lời nội dung
`;
  }
}
