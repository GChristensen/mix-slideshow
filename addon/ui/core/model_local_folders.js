import {ModelBase} from "./model_base.js";
import {settings} from "../../settings.js";
import {helperApp} from "../../helper_app.js";
import {sortByName} from "../../utils.js";

export class LocalFoldersModel extends ModelBase {
    static ID = "local-folders";

    #authorized;

    constructor() {
        super();

        return helperApp.probe().then(helperApp => {
            this.#authorized = !!helperApp;
            return this;
        });
    }

    get authorizationText() {
        return "Install Helper";
    }

    get modelID() {
        return LocalFoldersModel.ID;
    }

    get isAuthorized() {
        return this.#authorized;
    }

    async authorize() {
        return browser.tabs.create({url: "https://github.com/gchristensen/mix-slideshow/releases", active: true});
    }

    async getAlbums() {
        await settings.load();
        const localFolders = settings.local_folders() || [];
        const albums = [...localFolders];
        sortByName(albums);

        return albums;
    }

    async _getAlbumImages(album) {
        const response = await helperApp.post("/list/images", album);

        if (response.ok)
            return response.json();
    }
}