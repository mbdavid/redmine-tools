import { html, define, store } from "hybrids";
import router from "router";
import { change, culture } from "culture";
import session from "../stores/session.js";
import { setLang } from "../stores/session.js";
import MyAppLogin from "./my-app-login.js";

console.log(session)

const langs = ["pt-BR", "en-US"];

function update(el, redmineUrl, accessToken) {
}

const MyApp = {
    session: store(session),
    render: ({ session }) => html`
    <header>
        <div>
            Culture: 
            <select onchange=${(_, e) => setLang(e.target.value)}>
                ${langs.map(lang => html`
                    <option selected=${lang == session.lang}>${lang}</option>
                `)}
            </select>
        </div>
        <div>
            User: ${session.username || "no authentication"}
            ${!session.username && html`
                <button>Login</button>
                <my-app-login></my-app-login>
            `}
        </div>

    </header>

    <style>
        // layout 

    </style>

    `,
};

export default define("my-app", MyApp);