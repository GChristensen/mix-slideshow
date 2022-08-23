import {PinterestModel} from "../model_pinterest.js";
import {settings} from "../settings.js";

export class ControllerBase {
    PINTEREST_BOARDS = "pinterest-boards";

    _sources;

    constructor() {
        this._sources = [this.PINTEREST_BOARDS];
    }

    async createModel(sourceId) {
        switch (sourceId) {
            case this.PINTEREST_BOARDS:
                return new PinterestModel();
        }
    }

    getSelectedAlbums(sourceId) {
        return settings.get(`${sourceId}-selected-albums`) || [];
    }

    setSelectedAlbums(sourceId, albums) {
        return settings.set(`${sourceId}-selected-albums`, albums);
    }
}