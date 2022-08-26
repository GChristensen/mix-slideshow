import {ModelBase} from "./ui/model_base.js";

export class PinterestAPI {
    PINTEREST_URL = "https://www.pinterest.com";

    #userName;

    constructor() {
        return this.authorize().then(() => this);
    }

    async authorize() {
        const json = await this.#fetchPinterestJSON("/resource/UserSettingsResource/get/");
        const [userDetails] = this.#handleResponse(json);
        if (userDetails)
            this.#userName = userDetails.username;
    }

    async checkAuthorization() {
        if (!this.isAuthorized)
            await this.authorize();
        return this.isAuthorized;
    }

    get isAuthorized() {
        return !!this.#userName;
    }

    getURL(url) {
        return this.PINTEREST_URL + url;
    }

    async #fetchPinterestJSON(url, params, method) {
        url = `${this.PINTEREST_URL}${url}`;

        const init = {method: method || "get"};

        if (params) {
            params = new URLSearchParams(params).toString();

            if (init.method === "get")
                url = `${url}?${params}`;
            else
                init.body = params;
        }

        let json;
        try {
            const response = await fetch(url, init);

            if (response.redirected)
                this.PINTEREST_URL = new URL(response.url).origin;

            json = response.json();
        } catch (e) {
            console.error(e);
        }

        return json;
    }

    #printError(error) {
        if (error) {
            const status = error.http_status;
            const message = error.message + " " + (error.message_detail || "");
            console.error(`Pinterest API error: HTTP status ${status}, (${message})`);
        }
        else
            console.error(`Pinterest API error: unknown`);
    }

    #handleResponse(json) {
        const success = json?.resource_response?.status === "success";

        if (success)
            return [json.resource_response.data, json.resource_response.bookmark];
        else {
            this.#printError(json?.resource_response?.error);

            const error = new Error("Error accessing Pinterest.");
            error.name = ModelBase.MODEL_ERROR;
            throw error;
        }
    }

    async #getPages(f) {
        let items = [], page, bookmark;

        do {
            [page, bookmark] = await f(bookmark);
            if (page?.length)
                items = [...items, ...page];
        } while (bookmark);

        if (items.length)
            return items;
    }

    async #getBoardsPage(bookmark) {
        const pinterestOptions = {
            "options": {
                "username": this.#userName,
                "page_size": 100,
                "privacy_filter": "all",
                "field_set_key": "detailed",
                "group_by": "mix_public_private",
                "no_fetch_context_on_resource": false
            },
            "context": {}
        };

        if (bookmark)
            pinterestOptions.options.bookmarks = [bookmark];

        const params = {data: JSON.stringify(pinterestOptions)};
        const json = await this.#fetchPinterestJSON("/resource/BoardsResource/get/", params);

        return this.#handleResponse(json);
    }

    async getBoards() {
        return this.#getPages(this.#getBoardsPage.bind(this));
    }

    async #getPinsPage(boardId, bookmark) {
        const pinterestOptions = {
            "options": {
                "board_id": boardId,
                "currentFilter": -1,
                "field_set_key": "react_grid_pin",
                "filter_section_pins": false,
                "sort": "default",
                "layout": "default",
                "page_size": 100,
                "redux_normalize_feed": true,
                "no_fetch_context_on_resource": false
            }, "context": {}
        };

        if (bookmark)
            pinterestOptions.options.bookmarks = [bookmark];

        const params = {data: JSON.stringify(pinterestOptions)};
        const json = await this.#fetchPinterestJSON("/resource/BoardFeedResource/get/", params);

        return this.#handleResponse(json);
    }

    async getPins(boardId) {
        const items = await this.#getPages(this.#getPinsPage.bind(this, boardId));
        return items.filter(pin => pin.type === "pin");
    }
}
