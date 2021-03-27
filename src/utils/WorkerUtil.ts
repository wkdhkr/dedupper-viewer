import Worker from "../worker";

export default class WorkerUtil {
  static instance: Worker | null = null;

  static getInstance = () => {
    if (WorkerUtil.instance) {
      return WorkerUtil.instance;
    }
    WorkerUtil.instance = new Worker();
    return WorkerUtil.instance;
  };
}
