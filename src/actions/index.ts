import produce from "immer";
import * as log from "loglevel";
import keyBy from "lodash/keyBy";
import { Store } from "unistore";
import PlayerService from "../services/Viewer/PlayerService";
import DedupperClient from "../services/dedupper/DedupperClient";
import StoreUtil from "../utils/StoreUtil";
import {
  State,
  DedupperImage,
  SnackbarKind,
  SnackbarCustomState,
  DedupperChannel,
  ConfigurationState,
  FacePPRow,
  GestureInfo,
  SortKind,
  // FacePPRow
} from "../types/unistore";
import DomUtil from "../utils/DomUtil";
import ViewerUtil from "../utils/ViewerUtil";
import UrlUtil from "../utils/dedupper/UrlUtil";
import ImageArrayUtil from "../utils/ImageArrayUtil";
import IFrameUtil from "../utils/IFrameUtil";
import { EVENT_UPDATE_IMAGE } from "../constants/dedupperConstants";
import CacheUtil from "../utils/CacheUtil";
import ColorUtil from "../utils/ColorUtil";
import SubViewerHelper from "../helpers/viewer/SubViewerHelper";
import WindowUtil from "../utils/WindowUtil";
import { IFrameMessage } from "../types/window";
import SortHelper from "../helpers/viewer/SortHelper";
import ThumbSliderUtil from "../utils/ThumbSliderUtil";

// let subWindowHandle: Window | null = null;

const dc = new DedupperClient();
const ps = new PlayerService();
const gps = new PlayerService();
const actions = (store: Store<State>) => ({
  setShowMainViewer(state: State, isShow = true) {
    store.setState(
      produce(store.getState(), (draft) => {
        draft.gridViewer.showMainViewer = isShow;
      })
    );
  },
  setGestureInfo(state: State, info: GestureInfo) {
    store.setState(
      produce(store.getState(), (draft) => {
        if (UrlUtil.isInGridViewer()) {
          draft.gridViewer.gestureInfo = info;
        }
        if (UrlUtil.isInThumbSlider()) {
          draft.thumbSlider.gestureInfo = info;
        }
      })
    );
  },
  async updateFacePPMap(state: State, hash: string) {
    if (state.mainViewer.isPlay) {
      return;
    }
    if (state.configuration.showFacePP === "none") {
      return;
    }
    const faces: FacePPRow[] = await dc.query(
      `SELECT * from facepp where hash = '${hash}'`,
      false
    );
    store.setState(
      produce(store.getState(), (draft) => {
        draft.mainViewer.faces = faces;
      })
    );
  },
  updateColor(state: State, hash: string, kind: string, value: number) {
    const viewer = DomUtil.getViewerSafe();
    if (!viewer) {
      return;
    }

    const trimObj = {
      ...viewer.imageData,
      [kind]: value,
    };

    actions(store).updateTrim(state, hash, JSON.stringify(trimObj));
    viewer.imageData = trimObj;
    viewer.image.style.filter = ColorUtil.createFilter(trimObj);
  },
  async createChannel(state: State, channel: DedupperChannel) {
    const newChannel = await dc.createChannel(channel);
    store.setState(
      produce(state, (draft) => {
        draft.channelById[newChannel.id] = newChannel;
        draft.channels = [...draft.channels, newChannel];
      })
    );
  },
  async updateChannel(state: State, channel: DedupperChannel) {
    await dc.updateChannel(channel);
    store.setState(
      produce(state, (draft) => {
        draft.channelById[channel.id] = channel;
        draft.channels = [
          ...draft.channels.map((c) => {
            if (c.id === channel.id) {
              return channel;
            }
            return c;
          }),
        ];
      })
    );
  },
  async deleteChannel(state: State, id: string) {
    await dc.deleteChannel(id);
    store.setState(
      produce(state, (draft) => {
        delete draft.channelById[id];
        draft.channels = [...draft.channels.filter((c) => c.id !== id)];
      })
    );
  },
  changeSort(state: State, sortKind: SortKind, reverse: boolean) {
    store.setState(
      produce(state, (draft) => {
        if (draft.mainViewer.images.length === 0) {
          return;
        }
        const images = SortHelper.sort(
          sortKind,
          draft.sortKind,
          draft.mainViewer.images
        );
        draft.sortKind = sortKind;
        if (reverse) {
          images.reverse();
        }
        draft.mainViewer.images = images;
        draft.mainViewer.currentImage = images[0];
        draft.mainViewer.index = 0;
        draft.gridViewer.index = 0;
        draft.gridViewer.selectedImage = images[0];
      })
    );
    const images = store.getState().mainViewer.images;
    SubViewerHelper.prepareReference().then(() =>
      IFrameUtil.postMessageForParent({
        type: "forAll",
        payload: {
          type: "loadImages",
          payload: images,
        },
      })
    );
    const nextIndex = 0;
    const nextHash = images[0]?.hash;
    if (nextHash) {
      actions(store).selected(store.getState(), nextHash, nextIndex, true);
    }
  },
  changeUnit(state: State, unit: number) {
    store.setState(
      produce(state, (draft) => {
        draft.gridViewer.unit = unit;
        UrlUtil.changeUnit(unit);
      })
    );
    if (state.gridViewer.selectedImage) {
      const range = ViewerUtil.detectRange(unit);
      const fitImages = ImageArrayUtil.fitAmountForGridUnit(
        state.mainViewer.images,
        range
      );
      const [hash, index] = ImageArrayUtil.detectDestination(
        fitImages,
        state.gridViewer.index
      );
      if (hash) {
        setTimeout(() => {
          actions(store).selected(store.getState(), hash, index, true);
        }, 2000);
      }
    }
  },
  // currently, no close.
  toggleSubViewer(state: State, close: boolean | null = null) {
    if (IFrameUtil.isInIFrame() && state.gridViewer.selectedImage) {
      if (state.configuration.enableSubViewer) {
        window.parent.postMessage(
          {
            type: "subViewer",
            payload: state.gridViewer.selectedImage,
          },
          "*"
        );
      }
    } else {
      store.setState(
        produce(state, (draft) => {
          draft.gridViewer.subViewer.isOpen =
            close === null ? !draft.gridViewer.subViewer.isOpen : close;
          draft.mainViewer.subViewer.isOpen =
            close === null ? !draft.mainViewer.subViewer.isOpen : close;
        })
      );
    }
  },
  async viewed(state: State, hash: string, index: number) {
    store.setState(
      produce(state, (draft) => {
        draft.mainViewer.currentImage = draft.imageByHash[hash] || null;
        draft.mainViewer.index = index;
      })
    );
    actions(store).updateFacePPMap(store.getState(), hash);
    if (state.mainViewer.isPlay) {
      actions(store).updateViewStat(store.getState(), hash);
    }
    await SubViewerHelper.prepareReference();
    IFrameUtil.postMessageForOther({
      type: "viewed",
      payload: {
        hash,
        index,
      },
    });
  },
  selectedByIndex(state: State, index: number) {
    const { images } = state.mainViewer;
    const range = ViewerUtil.detectRange(state.gridViewer.unit);

    const fitImages = ImageArrayUtil.fitAmountForGridUnit(images, range);
    const [nextHash, nextIndex] = ImageArrayUtil.detectDestination(
      fitImages,
      index
    );
    if (nextHash) {
      actions(store).selected(store.getState(), nextHash, nextIndex, true);
    }
  },
  selected(
    state: State,
    hash: string | null,
    mayIndex: number | null = null,
    showSubViewer = false
  ) {
    if (hash === null) {
      return;
    }
    const index =
      mayIndex === null
        ? store.getState().mainViewer.images.findIndex((i) => i.hash === hash)
        : mayIndex;
    SubViewerHelper.prepareReference().then(() => {
      IFrameUtil.postMessageForOther({
        type: "selected",
        payload: {
          hash,
          index,
        },
      });
    });
    if (UrlUtil.isInThumbSlider()) {
      store.setState(
        produce(store.getState(), (draft) => {
          draft.thumbSlider.selectedImage = draft.imageByHash[hash] || null;
          draft.thumbSlider.index = index;
        })
      );
      const leftTopHash = ThumbSliderUtil.getLeftTopHash(
        hash,
        state.mainViewer.images,
        state.configuration
      );
      const el = document.getElementById(`photo-container__${leftTopHash}`);
      WindowUtil.scrollToNative(el);
      return;
    }
    store.setState(
      produce(store.getState(), (draft) => {
        const range = ViewerUtil.detectRange(draft.gridViewer.unit);
        if (
          draft.gridViewer.selectedImage?.hash === draft.imageByHash[hash]?.hash
        ) {
          // always selected images
          /*
          draft.gridViewer.selectedImage = null;
          draft.gridViewer.index = -1;
          */
        } else {
          draft.gridViewer.selectedImage = draft.imageByHash[hash] || null;
          draft.gridViewer.index = index;
        }

        // scroll to next image
        const fitImages = ImageArrayUtil.fitAmountForGridUnit(
          state.mainViewer.images,
          range
        );
        const leftTopIndex = index - (index % range);
        const [
          leftTopHash,
          fixedLeftTopIndex,
        ] = ImageArrayUtil.detectDestination(fitImages, leftTopIndex);

        if (state.gridViewer.isPlay) {
          for (
            let i = fixedLeftTopIndex;
            i < fixedLeftTopIndex + range;
            i += 1
          ) {
            const image = fitImages[i];
            if (image) {
              actions(store).updateViewStat(store.getState(), image.hash);
            }
          }
        }

        /*
        if (index % range === 0 || draft.gridViewer.isPlay) {
          leftTopHash = hash;
        }
        if (index % range === range - 1 || draft.gridViewer.isPlay) {
          leftTopHash = draft.mainViewer.images[index - (range - 1)]?.hash;
        }
        if (index === draft.mainViewer.images.length - 1) {
          leftTopHash = draft.mainViewer.images[index - (index % range)]?.hash;
        }
        */
        if (leftTopHash) {
          const el = document.getElementById(`photo-container__${leftTopHash}`);
          WindowUtil.scrollTo(el);
        }
      })
    );
    if (!state.gridViewer.isPlay && showSubViewer) {
      actions(store).toggleSubViewer(store.getState());
    }
  },
  togglePlay(state: State) {
    if (UrlUtil.isInThumbSlider()) {
      SubViewerHelper.prepareReference().then(() =>
        IFrameUtil.postMessageForParent({
          type: "forAll",
          payload: {
            type: "toggleMainViewerPlay",
          },
        })
      );
      return state;
    }
    const vc = DomUtil.getViewerCanvas();
    if (vc) {
      vc.style.transform = "none";
    }
    return produce(state, (draft) => {
      draft.mainViewer.isPlay = !draft.mainViewer.isPlay;
      const display = draft.mainViewer.isPlay ? "none" : "block";
      const viewer = DomUtil.getViewerSafe();
      if (viewer) {
        // avoid wheeling is play mode.
        viewer.wheeling = draft.mainViewer.isPlay;
      }
      const footer = DomUtil.getViewerFooter();
      if (footer) {
        footer.style.display = display;
      }
      UrlUtil.syncPlay(draft.mainViewer.isPlay);
      const forceInterval = UrlUtil.getPlayInterval();
      ps.switchPlay(
        draft.mainViewer.isPlay,
        forceInterval || draft.configuration.mainViewerPlayInterval
      );
    });
  },
  toggleGridPlay(state: State) {
    return produce(state, (draft) => {
      draft.gridViewer.isPlay = !draft.gridViewer.isPlay;
      const sourceUnit = draft.gridViewer.unit;
      UrlUtil.syncPlay(draft.gridViewer.isPlay);
      const forceInterval = UrlUtil.getPlayInterval();
      gps.switchGridPlay(
        draft.gridViewer.isPlay,
        () => {
          const range = ViewerUtil.detectRange(sourceUnit);
          let nextIndex = store.getState().gridViewer.index + range;
          if (!store.getState().mainViewer.images[nextIndex]) {
            nextIndex = 0;
          }
          const nextHash = store.getState().mainViewer.images[nextIndex]?.hash;
          if (nextHash) {
            actions(store).selected(store.getState(), nextHash, nextIndex);
          }
        },
        forceInterval || draft.configuration.gridViewerPlayInterval
      );
    });
  },
  finishSnackbar(state: State, kind: SnackbarKind) {
    return produce(state, (draft) => {
      draft.snackbar[kind] = false;
    });
  },
  showSnackbarCustom(state: State, snackbarCustom: SnackbarCustomState) {
    store.setState(
      produce(state, (draft) => {
        draft.snackbarCustom = snackbarCustom as any;
      })
    );
  },
  finishSnackbarCustom(state: State) {
    return produce(state, (draft) => {
      draft.snackbarCustom = null;
    });
  },
  async updateSize(state: State, hash: string, width: number, height: number) {
    StoreUtil.updateFieldInState(
      [hash],
      {
        width,
        height,
      },
      store
    );
  },
  updateConfiguration(state: State, configurationState: ConfigurationState) {
    store.setState(
      produce(state, (draft) => {
        draft.configuration = { ...draft.configuration, ...configurationState };
        localStorage.setItem(
          "_dedupper_viewer_configuration",
          JSON.stringify(draft.configuration)
        );
      })
    );
  },
  async updateTrim(state: State, hash: string, trim: string) {
    if (state.mainViewer.isPlay) {
      // if play mode, not update trim.
      return;
    }
    let finalTrim = trim;
    if (trim !== "") {
      finalTrim = JSON.stringify(ViewerUtil.restoreImageData(JSON.parse(trim)));
    }
    await StoreUtil.updateField(
      hash,
      { trim: finalTrim },
      "layoutUpdated",
      store,
      "process_state",
      false
    );
    const payload = {
      type: "customEvent",
      payload: {
        name: EVENT_UPDATE_IMAGE,
        detail: {
          hash: [hash],
          edit: {
            trim: finalTrim,
          },
        },
      },
    } as IFrameMessage;
    IFrameUtil.postMessageForOther(payload);
  },
  selectNext(state: State) {
    if (!state.keyStatus.shifted) {
      if (state.configuration.selectNextAfterEditInMainViewer) {
        if (state.mainViewer.currentImage) {
          try {
            DomUtil.getViewer().next(true);
          } catch (e) {
            // ignored
          }
        }
      }
      if (state.configuration.selectNextAfterEditInGridViewer) {
        let toNextFlag = false;
        let nextHash: string | null = null;
        let nextIndex: number | null = null;
        if (state.gridViewer.selectedImage) {
          nextIndex = state.gridViewer.index + 1;
          if (!state.mainViewer.images[nextIndex]) {
            nextIndex = 0;
          }
          nextHash = state.mainViewer.images[nextIndex]?.hash;
          // const range = ViewerUtil.detectRange(state.gridViewer.unit);
          if (nextHash /* && nextIndex % range !== 0 */) {
            toNextFlag = true;
          }
        }
        if (state.thumbSlider.selectedImage) {
          nextIndex = state.thumbSlider.index + 1;
          if (!state.mainViewer.images[nextIndex]) {
            nextIndex = 0;
          }
          nextHash = state.mainViewer.images[nextIndex]?.hash;
          // const range = ViewerUtil.detectRange(state.gridViewer.unit);
          if (nextHash /* && nextIndex % range !== 0 */) {
            toNextFlag = true;
          }
        }
        if (toNextFlag && nextIndex !== null) {
          actions(store).selected(store.getState(), nextHash, nextIndex, true);
        }
      }
    }
  },
  updateViewStat(state: State, hash: string) {
    if (UrlUtil.isInThumbSlider()) {
      return;
    }
    const image = state.imageByHash[hash];
    if (!image) {
      return;
    }
    if (state.configuration.recordPlayStatistics === false) {
      return;
    }
    const edit = {
      view_count: image.view_count + 1,
      view_date: new Date().getTime(),
    };
    // no wait
    StoreUtil.updateField(hash, edit, null, store);
    const payload = {
      type: "customEvent",
      payload: {
        name: EVENT_UPDATE_IMAGE,
        detail: {
          hash: [hash],
          edit,
        },
      },
    } as IFrameMessage;
    IFrameUtil.postMessageForOther(payload);
  },
  updateRating(state: State, hash: string, rating: number | null, next = true) {
    if (next && rating) {
      actions(store).selectNext(store.getState());
    }
    // no wait
    StoreUtil.updateField(
      hash,
      { rating: rating || 0 },
      "ratingUpdated",
      store
    );
    const payload = {
      type: "customEvent",
      payload: {
        name: EVENT_UPDATE_IMAGE,
        detail: {
          hash: [hash],
          edit: {
            rating: rating || 0,
          },
        },
      },
    } as IFrameMessage;
    IFrameUtil.postMessageForOther(payload);
  },
  updateTag(
    state: State,
    hashOrHashList: string | string[],
    value: number | null,
    name: string,
    next = true
  ) {
    const hashList = Array.isArray(hashOrHashList)
      ? hashOrHashList
      : [hashOrHashList];

    if (next && value && !state.keyStatus.shifted) {
      /*
      if (state.mainViewer.currentImage) {
        try {
          DomUtil.getViewer().next(true);
        } catch (e) {
          // ignored for no viewer page
        }
      }
      */
      actions(store).selectNext(store.getState());
    }
    StoreUtil.updateField(
      hashList,
      { [name]: value },
      "tagUpdated",
      store,
      "tag"
    );
    const payload = {
      type: "customEvent",
      payload: {
        name: EVENT_UPDATE_IMAGE,
        detail: {
          hash: hashList,
          edit: {
            [name]: value,
          },
        },
      },
    } as IFrameMessage;
    IFrameUtil.postMessageForOther(payload);
  },
  async loadChannels(state: State) {
    store.setState(
      produce(state, (draft) => {
        draft.channels = [];
      })
    );
    let channels: DedupperChannel[] | null = null;
    try {
      channels = await dc.fetchChannels();
    } catch (e) {
      log.error(e);
      actions(store).showSnackbarCustom(state, [
        "Failed to load the channel list.",
        {
          variant: "error",
          autoHideDuration: 15000,
          anchorOrigin: { horizontal: "right", vertical: "top" },
        },
      ]);
    }
    store.setState(
      produce(store.getState(), (draft) => {
        if (channels != null) {
          draft.channels = channels;
          draft.channelById = keyBy<DedupperChannel>(channels, "id");
        }
      })
    );
  },

  unloadMainViewerImages(state: State) {
    store.setState(
      produce(state, (draft) => {
        draft.mainViewer.images = [];
        draft.imageByHash = {};
        draft.mainViewer.currentImage = null;
        draft.gridViewer.selectedImage = null;
        // draft.mainViewer.isPlay = false;
        // draft.gridViewer.isPlay = false;
      })
    );
  },

  async loadMainViewerImage(state: State, hash: string) {
    let images: DedupperImage[] = [];

    const cachedImage = state.imageByHash[hash];
    if (cachedImage) {
      images = [cachedImage];
    } else {
      const sql = `select hash from hash where hash = '${hash}'`;
      images = await dc.query(sql);
    }

    store.setState(
      produce(store.getState(), (draft: State) => {
        if (images != null) {
          draft.mainViewer.images = images;
          if (images.length) {
            [draft.gridViewer.selectedImage] = images;
            draft.gridViewer.index = 0;
          }
          draft.imageByHash = keyBy<DedupperImage>(images, "hash");
        }
      })
    );
  },

  async reloadMainViewerImages(state: State) {
    await actions(store).unloadMainViewerImages(state);
    const id = UrlUtil.extractChannelId();
    if (id) {
      await actions(store).loadMainViewerImages(store.getState(), id);
    }
  },

  async loadMainViewerImages(state: State, channelId: string, silent = false) {
    let images: DedupperImage[] | null = null;
    try {
      if (!silent) {
        store.setState(
          produce(store.getState(), (draft) => {
            draft.mainViewer.isLoading = true;
          })
        );
      }
      if (state.mainViewer.isPlay && state.mainViewer.images.length === 0) {
        const playImages = CacheUtil.getForPlay();
        if (playImages) {
          store.setState(
            produce(store.getState(), (draft) => {
              draft.mainViewer.images = playImages;
            })
          );
        }
      }
      let sql = null;
      if (!state.channelById[channelId]) {
        sql = (await dc.fetchChannel(channelId)).sql;
      } else {
        sql = state.channelById[channelId].sql;
      }
      images = await dc.query(sql);
      if (images) {
        CacheUtil.addForPlay(images);
      }
    } catch (e) {
      log.error(e);
      actions(store).showSnackbarCustom(store.getState(), [
        "Failed to read the image list.",
        {
          variant: "error",
          autoHideDuration: 15000,
          anchorOrigin: { horizontal: "right", vertical: "top" },
        },
      ]);
      actions(store).unloadMainViewerImages(store.getState());
    } finally {
      if (!silent) {
        store.setState(
          produce(store.getState(), (draft) => {
            draft.mainViewer.isLoading = false;
          })
        );
      }
    }
    store.setState(
      produce(store.getState(), (draft: State) => {
        if (images != null) {
          draft.mainViewer.images = images;
          if (images.length) {
            [draft.gridViewer.selectedImage] = images;
            draft.gridViewer.index = 0;
            /*
            const rest = images.length >= unit ? images.length % unit : 0;
            if (rest) {
              const finalImages = images.slice(0, images.length - rest);
              draft.mainViewer.images = finalImages;
            }
            */
          }
          draft.imageByHash = keyBy<DedupperImage>(images, "hash");
          SubViewerHelper.prepareReference().then(() =>
            IFrameUtil.postMessageForParent({
              type: "forAll",
              payload: {
                type: "loadImages",
                payload: images,
              },
            })
          );
        }
      })
    );
  },
});

export default actions;
