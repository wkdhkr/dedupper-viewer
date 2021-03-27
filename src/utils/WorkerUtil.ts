import Worker from "../worker";

export default class WorkerUtil {
  static instance: Worker | null = null;

  static terminate = () => {
    if (!WorkerUtil.instance) {
      return;
    }
    const w = WorkerUtil.instance;
    w.terminate();
  };

  static getInstance = () => {
    if (WorkerUtil.instance) {
      return WorkerUtil.instance;
    }
    WorkerUtil.instance = new Worker();
    return WorkerUtil.instance;
  };
}
