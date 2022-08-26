import {settings} from "../settings.js";
import {showNotification} from "../utils.js";

export class ModelBase {
    static MODEL_ERROR = "EMixSlideshowModelError";

    #getCachedAlbumID(album) {
        return `cached-album-${this.modelID}-${album.id}`;
    }

    async _getCachedAlbumImages(album) {
        const cachedAlbumID = this.#getCachedAlbumID(album);
        const cachedAlbum = await settings.get(cachedAlbumID);

        if (cachedAlbum && cachedAlbum.modified <= album.modified)
            return cachedAlbum.images;
    }

    async _cacheAlbumImages(album, images) {
        const cachedAlbumID = this.#getCachedAlbumID(album);
        const cachedAlbum = {
            modified: album.modified,
            images
        };

        return settings.set(cachedAlbumID, cachedAlbum);
    }

    async getImages(albums) {
        let images = [];

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
                            onlineImages = await this._getAlbumImages(albumId);
                        } catch (e) {
                            showNotification("Error obtaining album images.");
                            throw e;
                        }

                        await this._cacheAlbumImages(album, onlineImages);
                        images = [...images, ...onlineImages];
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }

        return images;
    }
}