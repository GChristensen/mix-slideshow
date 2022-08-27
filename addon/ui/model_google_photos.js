import {ModelBase} from "./model_base.js";
import {settings} from "../settings.js";
import {PKCE} from "../lib/PKCE.js";

export class GooglePhotosModel extends ModelBase {
    static ID = "google-photos";

    #pkce = new PKCE({
        client_id: "",
        client_secret: "",
        redirect_uri: "https://gchristensen.github.io/mix-slideshow",
        authorization_endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        token_endpoint: "https://oauth2.googleapis.com/token",
        requested_scopes: "https://www.googleapis.com/auth/photoslibrary.readonly",
    });
    #accessToken;

    get name() {
        return "Google Photos";
    }

    get modelID() {
        return GooglePhotosModel.ID;
    }

    get isAuthorized() {
        return settings.google_photos_refresh_token();
    }

    async authorize() {
        let resolveAuthorization;
        const result = new Promise(resolve => resolveAuthorization = resolve);
        const authorizationURL = await this.#pkce.getAuthorizationUrl({
            access_type: "offline",
            prompt: "consent"
        });
        const authTab = await browser.tabs.create({url: authorizationURL});

        let listener = async (id, changed, tab) => {
            if (id === authTab.id && changed.url?.startsWith(this.#pkce.config.redirect_uri)) {
                await browser.tabs.onUpdated.removeListener(listener);
                browser.tabs.remove(authTab.id);

                if (changed.url.includes("code=")) {
                    try {
                        const response = await this.#pkce.exchangeForAccessToken(changed.url);
                        if (response?.refresh_token) {
                            await settings.google_photos_refresh_token(response.refresh_token);
                            this.#accessToken = response.access_token;
                        }
                    } catch (e) {
                        console.error(e);
                    }

                    resolveAuthorization();
                }
            }
        };

        browser.tabs.onUpdated.addListener(listener);

        return result;
    }

    async #getAccessToken() {
        const response = await this.#pkce.refreshAccessToken(settings.google_photos_refresh_token());
        return response.access_token;
    }

    async getAlbums() {
        const accessToken = await this.#getAccessToken();
        // TODO: add pagination support
        const response = await fetch("https://photoslibrary.googleapis.com/v1/albums", {
            headers: {"Authorization": `Bearer ${accessToken}`}
        });
        let albums = [];

        if (response.ok) {
            const json = await response.json();

            albums = json.albums.map(a => ({
                id: a.id,
                name: a.title,
                modified: parseInt(a.mediaItemsCount)
            }))
        }

        return albums;
    }

    // since Google Photos use base-URLs which are valid only for 60 minutes
    // it is impractical to use this service with the current slideshow caching scheme
    async _getAlbumImages(albumId) {
        return [];
    }
}