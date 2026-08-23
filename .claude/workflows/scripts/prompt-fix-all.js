export const meta = {
  name: 'prompt-mt-fix-all',
  description: 'Rewrite all Chinese-to-Vietnamese machine-translation-corrupted automation prompts in Toonflow (skill .md files, model prompt templates, inline TS prompt strings), then verify and report',
  phases: [
    { title: 'Rewrite' },
    { title: 'Verify' },
    { title: 'Report' },
  ],
}

const ROOT = '/Volumes/HANN/Github/Toonflow-app'

const GLOSSARY = `
THUẬT NGỮ ĐÃ XÁC NHẬN BỊ DỊCH SAI HỆ THỐNG (áp dụng thống nhất mọi nơi gặp phải):
- "hàm dùng" → PHẢI là "người dùng" (user). Đây là lỗi dịch máy nghiêm trọng nhất, lặp lại hàng chục lần trong các skill điều phối/giám sát.
- "V.S." (nhãn thoại) → PHẢI thống nhất thành "OS" (off-screen / thoại ngoài hình) để khớp với mọi skill khác dùng "OS"/"VO".
- "Góc quay" khi đang nói về field kỹ thuật cameraMove (chuyển động máy quay: pan/tilt/dolly/zoom...) → PHẢI là "Chuyển động máy quay", không phải "Góc quay" (góc máy/framing là khái niệm khác — camera angle).
- type: "prop" trong các file data/modelPrompt/video/*.md → PHẢI là type: "tool" (hệ thống chỉ có 3 loại tài nguyên: role|scene|tool, không có "prop").
- "giúp tay" (từ 助手) → "trợ lý" (assistant).
- "trước cấp" (từ 优先级) → "độ ưu tiên" (priority).
- "chính đường liên dòng" (từ 主线关联) → "liên quan tuyến chính" / "quan hệ mạch chính".
- "tập dài" (từ 时长) → "thời lượng" (duration).
- "tình xúc độ" / "hàm tình xúc" (từ 情绪(强度)) → "cường độ cảm xúc" / "cảm xúc".
- "kết cấu hóa" (từ 结构化) → "có cấu trúc" (structured).
- Danh sách 9 nhãn cảm xúc chuẩn (nếu gặp bảng nhãn cảm xúc bị rỗng/thiếu): Xung đột, Kinh dị, Tình cảm, Bước ngoặt, Cao trào, Bình lặng, Hài hước, Hồi hộp, Sụp đổ cảm xúc.
`

const GUIDE = `
BỐI CẢNH: Các tệp này là prompt điều khiển AI của app Toonflow (phân tích tiểu thuyết → kịch bản → phân cảnh → video), được DỊCH MÁY (Google-Translate-style) TỪNG CHỮ từ tiếng Trung sang tiếng Việt. Nhiều đoạn ĐỌC CÓ VẺ TRÔI CHẢY NHƯNG VÔ NGHĨA hoặc SAI NGHĨA, làm AI (khi dùng các prompt này) tạo ra nội dung LẠC ĐỀ / SAI ĐỊNH DẠNG — đây chính là lỗi người dùng thật đang gặp và cần bạn sửa triệt để. Bản gốc tiếng Trung đã mất, hãy dựa vào NGỮ CẢNH VÀ NGHIỆP VỤ (biên kịch, dựng phim, AI sinh ảnh/video) để suy luận đúng ý rồi viết lại bằng tiếng Việt chuẩn, tự nhiên, chuyên nghiệp.
${GLOSSARY}
QUY TẮC BẮT BUỘC KHI VIẾT LẠI:
1. GIỮ NGUYÊN 100% mọi cấu trúc mà code khác có thể phụ thuộc vào: tên thẻ XML/giả-XML (ví dụ <storyboardItem>, <scriptPlan>, tên thuộc tính bên trong), số cột và cấu trúc bảng Markdown, khối code fence (\`\`\`...\`\`\`), placeholder dạng {xxx}/\${xxx}/[xxx], các từ khóa định dạng đầu ra bắt buộc (ví dụ ký tự phân cách |, tiêu đề section dùng làm mốc). CHỈ sửa PHẦN VĂN BẢN TIẾNG VIỆT (câu chữ, hướng dẫn, ví dụ, mô tả) — không đổi tên thẻ, không đổi số cột bảng, không xoá section.
2. Sửa TOÀN BỘ lỗi: calque vô nghĩa, ngữ pháp vỡ, thuật ngữ chuyên ngành sai, mâu thuẫn logic do dịch sai, câu cụt/mất chữ, ví dụ few-shot bị hỏng, bảng ký hiệu bị rỗng ô.
3. Văn phong: tiếng Việt chuẩn, mạch lạc, đúng thuật ngữ điện ảnh/biên kịch/AI (nhân vật, bối cảnh, đạo cụ, phân cảnh, tuyến truyện, cao trào, chuyển động máy quay, khung hình, lồng tiếng...).
4. Nếu một câu/mệnh đề bị cụt tới mức không thể suy luận chắc chắn ý gốc, hãy viết lại thành một câu HOÀN CHỈNH, HỢP LÝ trong ngữ cảnh xung quanh (đừng để lại chỗ trống hay dấu hiệu dịch lỗi).
5. Không thêm tính năng/quy tắc mới không có trong bản gốc, không rút gọn mất nội dung — đây là VIẾT LẠI CHO ĐÚNG NGHĨA, không phải tóm tắt.
`

const SKILL_TASKS = [
  { label: 'script-agent-decision-supervision', paths: ['data/skills/script_agent_decision.md', 'data/skills/script_agent_supervision.md'] },
  { label: 'script-execution-skeleton', paths: ['data/skills/script_execution_skeleton.md'] },
  { label: 'script-execution-adaptation', paths: ['data/skills/script_execution_adaptation.md'] },
  { label: 'script-execution-script', paths: ['data/skills/script_execution_script.md'] },
  { label: 'production-agent-decision-supervision', paths: ['data/skills/production_agent_decision.md', 'data/skills/production_agent_supervision.md'] },
  { label: 'production-execution-derive-assets', paths: ['data/skills/production_execution_derive_assets.md'] },
  { label: 'production-execution-director-plan', paths: ['data/skills/production_execution_director_plan.md'] },
  { label: 'production-execution-small-pair', paths: ['data/skills/production_execution_generate_assets.md', 'data/skills/production_execution_storyboard_gen.md'] },
  { label: 'storyboard-panel', paths: ['data/skills/production_execution_storyboard_panel.md'] },
  { label: 'storyboard-table', paths: ['data/skills/production_execution_storyboard_table.md'] },
  { label: 'storyboard-prompt-techniques', paths: ['data/skills/production_skills/storyboard_prompt_techniques.md'] },
  { label: 'storyboard-table-techniques', paths: ['data/skills/production_skills/storyboard_table_techniques.md'] },
]

const MODEL_PROMPT_TASKS = [
  { label: 'model-prompt-universal-first-last', paths: ['data/modelPrompt/video/universalFirstAndLastFrameMode.md'] },
  { label: 'model-prompt-universal-multi', paths: ['data/modelPrompt/video/universalMulti-parameterMode.md'] },
  { label: 'model-prompt-wan26', paths: ['data/modelPrompt/video/wan2.6Single-imageFirstFrameMode.md'] },
  { label: 'model-prompt-seedance2', paths: ['data/modelPrompt/video/seedance2Multi-parameterMode.md'] },
]

const SMALL_TS_TASKS = [
  {
    label: 'ts-always-run-prompts',
    paths: ['src/routes/artStyle/extractStylePrompt.ts', 'src/routes/script/getAiRegex.ts'],
    note: 'Đây là 2 system prompt LUÔN chạy trên mọi request (không có fallback). extractStylePrompt.ts dòng ~18 gần như vô nghĩa toàn phần. getAiRegex.ts có ví dụ regex hỏng cú pháp trong prompt — sửa ví dụ để là regex hợp lệ, đúng ý minh hoạ, vì kết quả regex trả về được dùng trực tiếp trong new RegExp() ở client.',
  },
  {
    label: 'ts-agent-memory',
    paths: ['src/utils/agent/memory.ts'],
    note: 'Có 2 system prompt (tóm tắt bộ nhớ ~dòng 47, kiểm tra liên quan/judgeSummaryRelevance ~dòng 56) và mô tả tool deepRetrieve (~dòng 203). Prompt judgeSummaryRelevance nếu hỏng có thể khiến model trả JSON sai định dạng, làm JSON.parse throw và bị catch âm thầm — hãy đảm bảo prompt yêu cầu RÕ RÀNG định dạng JSON đầu ra mong đợi.',
  },
  {
    label: 'ts-getprompts-fallback-sync',
    paths: ['src/utils/getPrompts.ts', 'src/lib/initDB.ts'],
    note: 'src/utils/getPrompts.ts: nhánh type=="event" (dòng 3-57) là prompt "Trích xuất sự kiện" dịch hỏng nặng — hãy đọc src/lib/initDB.ts, tìm đoạn seed bảng o_prompt type="eventExtraction" (khoảng dòng 349-360, biến data trong knex("o_prompt").insert(...)) vốn đã là bản dịch TỐT của CÙNG một prompt, rồi thay nội dung trả về của getPrompts.ts type=="event" bằng đúng nội dung tốt đó (giữ định dạng template string hợp lệ). RIÊNG trong src/lib/initDB.ts, sửa thêm 2 chỗ: (a) trong seed eventExtraction, câu "Bắt buộc là `X giây`, cấm dùng phần" bị cụt — sửa thành câu hoàn chỉnh hợp lý (ví dụ "cấm dùng đơn vị phút, chỉ dùng số giây nguyên"); (b) seed type="videoPromptGeneration" (~dòng 361-364) chỉ có 1 câu giới thiệu vai trò, THIẾU HẲN phần Định dạng đầu vào/Định dạng đầu ra/Quy tắc — hãy đọc data/modelPrompt/video/universalMulti-parameterMode.md (đã được sửa ở tác vụ khác, nhưng bạn có thể đọc bản hiện tại) để hiểu cấu trúc input (khối Tài nguyên [id,type,name] + danh sách storyboardItem videoDesc/duration) và output (prompt video mô tả rõ ràng), rồi VIẾT BỔ SUNG ĐẦY ĐỦ cho seed này thành một system prompt tự-đủ (không phụ thuộc file khác) có Input Format / Output Format / Rules ngắn gọn, cùng chuẩn chất lượng với 3 seed anh em (eventExtraction, scriptAssetExtraction, audioBindPrompt) trong cùng khối insert. CHỈ sửa nội dung chuỗi văn bản của các trường "data", KHÔNG đổi cấu trúc object/khoá JSON/logic insert.',
  },
  {
    label: 'ts-video-prompt-routes',
    paths: ['src/routes/production/workbench/generateVideoPrompt.ts', 'src/routes/production/workbench/batchGeneratePrompt.ts', 'src/routes/cornerScape/batchBindAudio.ts'],
    note: 'Sửa các đoạn văn bản tiếng Việt dính chữ/dịch hỏng ghép trong code (system/user content gửi AI, ví dụ "Mô hìnhtên", "Tài nguyênthông tin", "chọn Âm thanhdanh sách", "khớpTài nguyên", câu "vui lòng từ chọn Âm thanhdanh sách..."). LƯU Ý: các lỗi CODE (audioId describe(), prompt field trong tool description) ĐÃ ĐƯỢC SỬA RỒI ở lượt trước — KHÔNG cần sửa lại phần đó, chỉ tập trung vào các CHUỖI VĂN BẢN TIẾNG VIỆT còn lại bị dịch kém. Giữ nguyên mọi biến ${"${...}"} và cấu trúc template literal, chỉ sửa câu chữ tiếng Việt xung quanh.',
  },
  {
    label: 'ts-polish-assets-prompts',
    paths: ['src/routes/assetsGenerate/polishAssetsPrompt.ts', 'src/routes/assetsGenerate/batchPolishAssetsPrompt.ts', 'src/routes/production/assets/batchGenerateAssetsImage.ts'],
    note: 'Sửa các chuỗi prompt/system/user content tiếng Việt ghép trong code bị dịch máy hỏng. Chỉ sửa văn bản, không đổi logic/tên biến/cấu trúc.',
  },
]

function readTask(t) {
  return `${GUIDE}

NHIỆM VỤ: Đọc và viết lại (bằng Read rồi Write/Edit) các tệp sau trong thư mục gốc dự án "${ROOT}":
${t.paths.map((p) => `- ${ROOT}/${p}`).join('\n')}
${t.note ? '\nGHI CHÚ RIÊNG CHO TÁC VỤ NÀY: ' + t.note : ''}

Với mỗi tệp: đọc TOÀN BỘ nội dung hiện tại, viết lại phần văn bản tiếng Việt bị hỏng theo đúng quy tắc ở trên, rồi GHI ĐÈ trực tiếp vào đúng đường dẫn tệp đó (dùng Write với toàn bộ nội dung mới, hoặc Edit cho các thay đổi cục bộ trong file .ts). Sau khi hoàn tất tất cả tệp trong danh sách, trả lời ngắn gọn (dưới 150 từ) liệt kê: các tệp đã sửa, và 2-4 lỗi nghiêm trọng nhất bạn đã khắc phục ở mỗi tệp.`
}

phase('Rewrite')
const allTasks = [...SKILL_TASKS, ...MODEL_PROMPT_TASKS, ...SMALL_TS_TASKS]
const rewriteResults = await parallel(
  allTasks.map((t) => () => agent(readTask(t), { label: `fix:${t.label}`, phase: 'Rewrite' }).then((r) => ({ task: t.label, paths: t.paths, report: r })))
)
log(`Hoàn tất viết lại: ${rewriteResults.filter(Boolean).length}/${allTasks.length} tác vụ`)

phase('Verify')
// Chia các tệp đã sửa thành các lô nhỏ để soát lại tính toàn vẹn cấu trúc + còn sót lỗi dịch không
const allPaths = allTasks.flatMap((t) => t.paths)
function chunk(arr, n) {
  const out = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}
const verifyBatches = chunk(allPaths, 4)
const verifyResults = await parallel(
  verifyBatches.map((batch, i) => () =>
    agent(
      `Bạn đang làm QA (kiểm tra chất lượng) cho một đợt sửa lỗi dịch máy Trung→Việt trong các prompt AI của app Toonflow. Các tệp sau VỪA được viết lại để sửa lỗi dịch:
${batch.map((p) => `- ${ROOT}/${p}`).join('\n')}

Đọc lại TOÀN BỘ từng tệp và kiểm tra:
1. Còn ký tự Trung (CJK) sót lại không?
2. Còn cụm dịch máy vô nghĩa rõ rệt không (calque, ngữ pháp vỡ, "hàm dùng" thay vì "người dùng", v.v.)?
3. Cấu trúc quan trọng (thẻ XML/giả-XML như <storyboardItem>, số cột bảng Markdown, code fence, placeholder {xxx}/\${xxx}) có còn nguyên vẹn so với vai trò của prompt không (không bị đổi tên/xoá)?
4. Có ô bảng/backtick nào bị rỗng bất thường (dấu hiệu mất chữ khi dịch) không?

Nếu phát hiện vấn đề, SỬA TRỰC TIẾP luôn bằng Edit/Write (đừng chỉ báo cáo suông). Sau đó trả lời ngắn gọn (dưới 100 từ mỗi tệp): tệp nào sạch, tệp nào bạn vừa sửa thêm và sửa gì.`,
      { label: `verify:batch${i + 1}`, phase: 'Verify' }
    ).then((r) => ({ batch, report: r }))
  )
)
log(`Hoàn tất soát lại ${verifyBatches.length} lô`)

phase('Report')
const finalReport = await agent(
  `Bạn vừa hoàn tất một đợt sửa lỗi dịch máy Trung→Việt lớn trên toàn bộ prompt tự động hoá của app Toonflow tại thư mục "${ROOT}" (nhánh git hiện tại: feat/vietnamese-localization). Hãy tự chạy lệnh git (qua Bash, ví dụ "git -C ${ROOT} diff --stat" và "git -C ${ROOT} status --porcelain") để xem chính xác những tệp nào đã thay đổi và mức độ (số dòng thêm/bớt).

Danh sách tác vụ đã thực hiện và báo cáo của từng agent thực thi:
${JSON.stringify(rewriteResults, null, 1).slice(0, 60000)}

Báo cáo QA của các đợt soát lại:
${JSON.stringify(verifyResults, null, 1).slice(0, 30000)}

Viết một BÁO CÁO TỔNG KẾT bằng tiếng Việt (dùng markdown, súc tích, có thể dùng bullet/heading) cho người dùng cuối (chủ dự án), gồm:
1. Danh sách đầy đủ các tệp đã sửa (dựa trên git diff thật, không chỉ dựa vào báo cáo agent), nhóm theo loại (skill markdown / model prompt template / route-inline TS).
2. Với mỗi nhóm, tóm tắt 2-3 lỗi nghiêm trọng nhất đã sửa.
3. Xác nhận rõ: các thay đổi CHƯA được commit, đang nằm ở working tree, người dùng cần tự kiểm tra (git diff) và commit khi hài lòng.
4. Nếu QA phát hiện vấn đề còn sót lại đáng chú ý ở bước Verify, nêu rõ.

Trả lời chính là báo cáo cuối cùng (dưới 600 từ), không thêm lời dẫn.`,
  { label: 'final-report', phase: 'Report' }
)

return { rewriteResults, verifyResults, finalReport }
