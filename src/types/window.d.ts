type WindowAndGlobalThis = Window & typeof globalThis;
export interface DedupperWindow extends WindowAndGlobalThis {
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
  | "navigateImage"
  | "configuration"
  | "gridScrollTo"
  | "showMainViewer"
  | "thumbSliderViewed"
  | "customEvent"
  | "toggleMainViewerPlay"
  | "toggleGridViewerPlay"
  | "selectedRecommend"
  | "selected"
  | "viewed"
  | "copy"
  | "forAllWithParent"
  | "forAll"
  | "forGrid"
  | "forThumbSlider"
  | "forMainViewer"
  | "forSubViewer"
  | "customEvent"
  | "superReload"
  | "reload"
  | "navigate"
  | "navigateSubViewer"
  | "navigateParent"
  | "navigateIF"
  | "subViewer"
  | "prepareSubViewerReference"
  | "subViewerReferencePrepared"
  | "mainSubViewer"
  | "reload"
  | "loadImages"
  | "toolbarClicked"
  | "toggleFullscreen"
  | "applyTag";

export type IFrameMessage = {
  type: IFrameMessageType;
  payload: any;
  id?: string;
  fromUrl?: string;
};
