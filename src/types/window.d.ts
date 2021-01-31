export interface DedupperWindow extends Window {
  __DEDUPPER_VIEWER_IDENTITY__: true;
  __DEDUPPER_VIEWER_SUB_VIEWER__?: true;
  store: Store<State>;
  renderDedupperViewer: Function;
  navigate: NavigateFn;
  dedupperWS: DedupperWindowService;
  subViewerWindow: DedupperWindow | null;
  parentWindow: DedupperWindow | null;
  managerWindow: DedupperWindow | null;
}

export type IFrameMessageType =
  | "thumbSliderViewed"
  | "customEvent"
  | "toggleMainViewerPlay"
  | "selected"
  | "viewed"
  | "copy"
  | "forAll"
  | "forGrid"
  | "forThumbSlider"
  | "forMainViewer"
  | "forSubViewer"
  | "customEvent"
  | "superReload"
  | "navigate"
  | "navigateSubViewer"
  | "navigateParent"
  | "navigateIF"
  | "subViewer"
  | "prepareSubViewerReference"
  | "mainSubViewer"
  | "reload"
  | "loadImages"
  | "applyTag";

export type IFrameMessage = {
  type: IFrameMessageType;
  payload: any;
};
