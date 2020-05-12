export interface DedupperImage {
  hash: string;
  trim: string;
}
export interface MainViewerState {
  images: DedupperImage[];
}
export interface SnackbarState {
  layoutUpdated: boolean;
}
export interface State {
  snackbar: SnackbarState;
  mainViewer: MainViewerState;
}
