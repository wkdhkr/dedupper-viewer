import produce from "immer";
import keyBy from "lodash/keyBy";
import scrollIntoView from "scroll-into-view-if-needed";
import { Store } from "unistore";
import PlayerService from "../services/Viewer/PlayerService";
import DedupperClient from "../services/dedupper/DedupperClient";
import StoreUtil from "../utils/StoreUtil";
import {
  State,
  DedupperImage,
  SnackbarKind,
  SnackbarCustomState,
  DedupperChannel
} from "../types/unistore";
import DomUtil from "../utils/DomUtil";
import ViewerUtil from "../utils/ViewerUtil";
import UrlUtil from "../utils/dedupper/UrlUtil";
import SubViewerHelper from "../helpers/viewer/SubViewerHelper";
import { DedupperWindow } from "../types/window";

// let subWindowHandle: Window | null = null;

const dc = new DedupperClient();
const ps = new PlayerService();
const gps = new PlayerService();
const actions = (store: Store<State>) => ({
  async createChannel(state: State, channel: DedupperChannel) {
    const newChannel = await dc.createChannel(channel);
    store.setState(
      produce(state, draft => {
        draft.channelById[newChannel.id] = newChannel;
        draft.channels = [...draft.channels, newChannel];
      })
    );
  },
  async updateChannel(state: State, channel: DedupperChannel) {
    await dc.updateChannel(channel);
    store.setState(
      produce(state, draft => {
        draft.channelById[channel.id] = channel;
        draft.channels = [
          ...draft.channels.map(c => {
            if (c.id === channel.id) {
              return channel;
            }
            return c;
          })
        ];
      })
    );
  },
  async deleteChannel(state: State, id: string) {
    await dc.deleteChannel(id);
    store.setState(
      produce(state, draft => {
        delete draft.channelById[id];
        draft.channels = [...draft.channels.filter(c => c.id !== id)];
      })
    );
  },
  changeUnit(state: State, unit: number) {
    store.setState(
      produce(state, draft => {
        draft.gridViewer.unit = unit;
        UrlUtil.changeUnit(unit);
      })
    );
  },
  toggleSubViewer(state: State) {
    store.setState(
      produce(state, draft => {
        draft.gridViewer.subViewer.isOpen = !draft.gridViewer.subViewer.isOpen;
      })
    );
  },
  viewed(state: State, hash: string, index: number) {
    store.setState(
      produce(state, draft => {
        draft.mainViewer.currentImage = draft.imageByHash[hash] || null;
        draft.mainViewer.index = index;
      })
    );
  },
  selected(state: State, hash: string, index: number) {
    const w = SubViewerHelper.getWindow();
    if (w?.navigate) {
      w.navigate(UrlUtil.generateImageViewerUrl(hash), {
        replace: true
      });
    }
    store.setState(
      produce(store.getState(), draft => {
        const [unit, range] = ViewerUtil.detectUnitAndRange(
          draft.gridViewer.unit
        );
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
        let leftTopHash = null;
        if (index % range === 0 || draft.gridViewer.isPlay) {
          leftTopHash = hash;
        }
        if (index % range === range - 1 || draft.gridViewer.isPlay) {
          leftTopHash = draft.mainViewer.images[index - (range - 1)].hash;
        }
        if (index === draft.mainViewer.images.length - 1) {
          leftTopHash = draft.mainViewer.images[index - (index % range)].hash;
        }
        if (leftTopHash) {
          const el = document.getElementById(`photo-container__${leftTopHash}`);
          // scrollIntoView(el, { behavior: "smooth", block: "start" });
          // scrollIntoView(el, { block: "start" });
          // el.scrollIntoView({ block: "end" });
          if (el) {
            scrollIntoView(el, { scrollMode: "if-needed", block: "start" });
            window.scrollBy(0, 1);
          }
        }
      })
    );
  },
  togglePlay(state: State) {
    UrlUtil.togglePlay();
    return produce(state, draft => {
      draft.mainViewer.isPlay = !draft.mainViewer.isPlay;
      ps.switchPlay(draft.mainViewer.isPlay);
    });
  },
  toggleGridPlay(state: State) {
    UrlUtil.togglePlay();
    return produce(state, draft => {
      draft.gridViewer.isPlay = !draft.gridViewer.isPlay;
      const sourceUnit = draft.gridViewer.unit;
      gps.switchGridPlay(draft.gridViewer.isPlay, () => {
        const [unit, range] = ViewerUtil.detectUnitAndRange(sourceUnit);
        let nextIndex = store.getState().gridViewer.index + range;
        if (!store.getState().mainViewer.images[nextIndex]) {
          nextIndex = 0;
        }
        const nextHash = store.getState().mainViewer.images[nextIndex]?.hash;
        if (nextHash) {
          actions(store).selected(store.getState(), nextHash, nextIndex);
        }
      });
    });
  },
  finishSnackbar(state: State, kind: SnackbarKind) {
    return produce(state, draft => {
      draft.snackbar[kind] = false;
    });
  },
  showSnackbarCustom(state: State, snackbarCustom: SnackbarCustomState) {
    store.setState(
      produce(state, draft => {
        draft.snackbarCustom = snackbarCustom;
      })
    );
  },
  finishSnackbarCustom(state: State) {
    return produce(state, draft => {
      draft.snackbarCustom = null;
    });
  },
  async updateTrim(state: State, hash: string, trim: string) {
    let finalTrim = trim;
    if (trim !== "") {
      finalTrim = JSON.stringify(ViewerUtil.restoreImageData(JSON.parse(trim)));
    }
    await StoreUtil.updateField(
      hash,
      { trim: finalTrim },
      "layoutUpdated",
      store
    );
    const updateFn = (w: DedupperWindow) => {
      StoreUtil.updateFieldInState([hash], { trim: finalTrim }, w.store);
      // debounce(() => w.renderDedupperViewer(), 50);
      w.renderDedupperViewer();
    };
    SubViewerHelper.forChild(updateFn);
    SubViewerHelper.forParent(updateFn);
  },
  updateRating(state: State, hash: string, rating: number | null, next = true) {
    if (next && rating && !state.keyStatus.shifted) {
      if (state.mainViewer.currentImage) {
        try {
          DomUtil.getViewer().next(true);
        } catch (e) {
          // ignored
        }
      }
      if (state.gridViewer.selectedImage) {
        let nextIndex = state.gridViewer.index + 1;
        if (!state.mainViewer.images[nextIndex]) {
          nextIndex = 0;
        }
        const nextHash = state.mainViewer.images[nextIndex]?.hash;
        if (nextHash) {
          actions(store).selected(store.getState(), nextHash, nextIndex);
        }
      }
    }
    // no wait
    StoreUtil.updateField(
      hash,
      { rating: rating || 0 },
      "ratingUpdated",
      store
    );
    const updateFn = (w: DedupperWindow) => {
      StoreUtil.updateFieldInState([hash], { rating: rating || 0 }, w.store);
      // debounce(() => w.renderDedupperViewer(), 50);
      w.renderDedupperViewer();
    };
    SubViewerHelper.forChild(updateFn);
    SubViewerHelper.forParent(updateFn);
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
      if (state.mainViewer.currentImage) {
        try {
          DomUtil.getViewer().next(true);
        } catch (e) {
          // ignored for no viewer page
        }
      }
      if (state.gridViewer.selectedImage && hashList.length === 1) {
        if (state.gridViewer.selectedImage.hash === hashList[0]) {
          let nextIndex = state.gridViewer.index + 1;
          if (!state.mainViewer.images[nextIndex]) {
            nextIndex = 0;
          }
          const nextHash = state.mainViewer.images[nextIndex]?.hash;
          if (nextHash) {
            actions(store).selected(store.getState(), nextHash, nextIndex);
          }
        }
      }
    }
    StoreUtil.updateField(
      hashList,
      { [name]: value },
      "tagUpdated",
      store,
      "tag"
    );
    const updateFn = (w: DedupperWindow) => {
      StoreUtil.updateFieldInState(hashList, { [name]: value }, w.store);
      // debounce(() => w.renderDedupperViewer(), 50);
    };
    SubViewerHelper.forChild(updateFn);
    SubViewerHelper.forParent(updateFn);
    SubViewerHelper.forChild(w => {
      w.renderDedupperViewer();
    });
    SubViewerHelper.forParent(w => {
      w.renderDedupperViewer();
      w.focus();
    });
  },
  async loadChannels(state: State) {
    let channels: DedupperChannel[] | null = null;
    try {
      channels = await dc.fetchChannels();
    } catch (e) {
      actions(store).showSnackbarCustom(state, [
        "Failed to load the channel list.",
        {
          variant: "error",
          autoHideDuration: 15000,
          anchorOrigin: { horizontal: "right", vertical: "top" }
        }
      ]);
    }
    store.setState(
      produce(store.getState(), (draft: State) => {
        if (channels != null) {
          draft.channels = channels;
          draft.channelById = keyBy<DedupperChannel>(channels, "id");
        }
      })
    );
  },

  unloadMainViewerImages(state: State) {
    store.setState(
      produce(state, draft => {
        draft.mainViewer.images = [];
        draft.imageByHash = {};
        draft.mainViewer.currentImage = null;
        draft.gridViewer.selectedImage = null;
      })
    );
  },

  async loadMainViewerImage(state: State, hash: string) {
    let images: DedupperImage[] = [];

    const parentStore = SubViewerHelper.getParentStore();
    const cachedImage = parentStore?.getState().imageByHash[hash];
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

  async loadMainViewerImages(state: State, channelId: string) {
    let images: DedupperImage[] | null = null;
    try {
      store.setState(
        produce(store.getState(), draft => {
          draft.mainViewer.isLoading = true;
        })
      );
      let sql = null;
      if (!state.channelById[channelId]) {
        sql = (await dc.fetchChannel(channelId)).sql;
      } else {
        sql = state.channelById[channelId].sql;
      }
      images = await dc.query(sql);
    } catch (e) {
      actions(store).showSnackbarCustom(store.getState(), [
        "Failed to read the image list.",
        {
          variant: "error",
          autoHideDuration: 15000,
          anchorOrigin: { horizontal: "right", vertical: "top" }
        }
      ]);
      actions(store).unloadMainViewerImages(store.getState());
    } finally {
      store.setState(
        produce(store.getState(), draft => {
          draft.mainViewer.isLoading = false;
        })
      );
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
        }
      })
    );
  }
});

export default actions;
