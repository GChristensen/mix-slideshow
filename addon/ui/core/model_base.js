import {settings} from "../../settings.js";
import {showNotification} from "../../utils.js";

export class ModelBase {
    static CACHED_ALBUM_PREFIX = "cached-album";
    static MODEL_ERROR = "EMixSlideshowModelError";

    #getCachedAlbumID(album) {
        return `${ModelBase.CACHED_ALBUM_PREFIX}-${this.modelID}-${album.id}`;
    }

    async _getCachedAlbumImages(album) {
        const cachedAlbumID = this.#getCachedAlbumID(album);
        const cachedAlbum = await settings.get(cachedAlbumID);

        if (cachedAlbum && album.modified && cachedAlbum.modified <= album.modified)
            return cachedAlbum.images;
    }

    async _cacheAlbumImages(album, images) {
        if (album.modified) {
            const cachedAlbumID = this.#getCachedAlbumID(album);
            const cachedAlbum = {
                modified: album.modified,
                images
            };

            return settings.set(cachedAlbumID, cachedAlbum);
        }
    }

    _sortAlbumsByName(albums) {
        const byNameInsensitive = (a, b) => a.name.localeCompare(b.name, undefined, {sensitivity: "base"});
        albums.sort(byNameInsensitive);
    }

    async getImages(albums) {
        let images = [];

        if (albums?.length) {
            const allAlbums = await this.getAlbums();

            for (const albumId of albums) {
                try {
                    const album = allAlbums.find(a => a.id === albumId);

                    if (album) {
                        const cachedImages = await this._getCachedAlbumImages(album);

                        if (cachedImages)
                            images = [...images, ...cachedImages];
                        else {
                            let onlineImages;

                            try {
                                onlineImages = await this._getAlbumImages(album);
                            } catch (e) {
                                showNotification("Error obtaining album images.");
                                throw e;
                            }

                            onlineImages = onlineImages || [];
                            await this._cacheAlbumImages(album, onlineImages);
                            images = [...images, ...onlineImages];
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        }

        return images;
    }
}