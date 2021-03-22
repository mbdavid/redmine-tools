import { store } from "hybrids";
import { change } from "culture";
import { LANG, REDMINE_URL } from "../../config-env.js";

const state = {
    userId: 0,
    username: "",
    email: "",
    lang: LANG,
    redmineUrl: REDMINE_URL,
    accessToken: ""
};

export function setLang(lang) {

    // update state
    store.set(state, { lang });

    // change culture
    change(lang);

    // update localStorage
}

export function login(redmineUrl, accessToken) {

}

export default state;