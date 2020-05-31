export interface DedupperWindow extends Window {
  __DEDUPPER_VIEWER_IDENTITY__: true;
  store: Store<State>;
  renderDedupperViewer: Function;
  navigate: NavigateFn;
  dedupperWS: DedupperWindowService;
}
