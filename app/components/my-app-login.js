import { html, define, property } from "hybrids";

const langs = ["pt-BR", "en-US"];

const MyAppLogin = {
    value: property({
        redmineUrl: "",
        accessToken: ""
    }),
    render: ({ value }) => html`
    <div class="modal" :class="{ 'is-active': modal.login }">
        <div class="modal-background"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">Autenticação</p>
                <button class="delete" aria-label="close" @click="modal.login = false"></button>
            </header>
            <section class="modal-card-body">
                <div class="field">
                    <label class="label">Redmine URL</label>
                    <div class="control">
                        <input class="input" type="url" placeholder="Redmine URL" v-model="redmine_url" />
                    </div>
                </div>
                <div class="field">
                    <label class="label">User token</label>
                    <div class="control">
                        <input class="input" type="text" placeholder="User token" v-model="user_token" />
                    </div>
                </div>
                <div class="notification is-success is-light">Para saber seu user token, acesse o Redmine em "Minha conta" > "Chave de acesso à API" > "Exibir"</div>
            </section>
            <footer class="modal-card-foot">
                <button class="button is-success" @click="login()">Login</button>
                <button class="button" @click="modal.login = false">Cancel</button>
            </footer>
        </div>
    </div>
    `,
};

export default define("my-app-login", MyAppLogin);