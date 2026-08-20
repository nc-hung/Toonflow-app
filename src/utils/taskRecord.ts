import db from "@/utils/db";

const taskStateMap = {
  "0": "Đang thực hiện",
  "1": "Đã hoàn thành",
  "-1": "Tạo thất bại",
};
/**
 * lục tác vụ nhất Trả vềkết thúchàm 
 * @param projectId  Dự án ID
 * @param taskClass  tác vụ phần loại 
 * @param modelName   Mô hìnhtên
 * @param opts       chọn ：liên kết đúng tượng 、tác vụ mô 
 */
export default async function taskRecord(
  projectId: number,
  taskClass: string,
  modelName: string,
  opts: {
    describe?: string;
    content?: any;
  } = {},
) {
  const { content, describe = "" } = opts;

  let opteorContent: string | undefined;
  if (content === undefined || content === null) {
    opteorContent = undefined;
  } else if (typeof content === "string") {
    opteorContent = content;
  } else if (typeof content === "function") {
    throw new Error("không hỗ trợ của loại");
  } else {
    try {
      opteorContent = JSON.stringify(content);
    } catch (e) {
      opteorContent = content.toString();
    }
  }

  const [id] = await db("o_tasks").insert({
    projectId,
    taskClass,
    relatedObjects: opteorContent,
    model: modelName,
    describe,
    state: taskStateMap[0],
    startTime: Date.now(),
  });

  /** tác vụ thành cônggọi hàm  done(1)，thất bạigọi hàm  done(-1, 'gốc ') */
  return async function done(state: 1 | -1, reason?: string) {
    await db("o_tasks")
      .where("id", id)
      .update({
        state: taskStateMap[state],
        reason: state === -1 ? (reason ?? "") : null,
      });
  };
}
