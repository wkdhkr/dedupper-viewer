import produce from "immer";
import keyBy from "lodash/keyBy";
import { Store } from "unistore";
import DedupperClient from "../services/dedupper/DedupperClient";
import PlayerService from "../services/Viewer/PlayerService";
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

const dc = new DedupperClient();
const ps = new PlayerService();
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
  viewed(state: State, hash: string, index: number) {
    store.setState(
      produce(state, draft => {
        draft.mainViewer.currentImage = draft.imageByHash[hash] || null;
        draft.mainViewer.index = index;
      })
    );
  },
  togglePlay(state: State) {
    return produce(state, draft => {
      draft.mainViewer.isPlay = !draft.mainViewer.isPlay;
      ps.switchPlay(draft.mainViewer.isPlay);
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
  },
  updateRating(state: State, hash: string, rating: number | null) {
    // no wait
    StoreUtil.updateField(
      hash,
      { rating: rating || 0 },
      "ratingUpdated",
      store
    );
    if (rating && !state.keyStatus.shifted) {
      DomUtil.getViewer().next(true);
    }
  },
  updateTag(state: State, hash: string, value: number | null, name: string) {
    // no wait
    StoreUtil.updateField(hash, { [name]: value }, "tagUpdated", store, "tag");
    if (value && !state.keyStatus.shifted) {
      DomUtil.getViewer().next(true);
    }
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
      produce(state, (draft: State) => {
        if (channels != null) {
          draft.channels = channels;
          draft.channelById = keyBy<DedupperChannel>(channels, "id");
        }
      })
    );
  },

  unloadMainViewerImages(state: State) {
    return produce(state, draft => {
      draft.mainViewer.images = [];
      draft.imageByHash = {};
    });
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
          draft.imageByHash = keyBy<DedupperImage>(images, "hash");
        }
      })
    );
  }
});

export default actions;
