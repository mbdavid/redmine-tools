# redmine-tools

Some external tools for `Redmine 2.4+` using client side only.

## Demo

Try here: https://mbdavid.github.io/redmine-tools/

> For external domain access, redmine server must run with CORS enabled

## Tools

- Database Sync
- User Timesheet (Month Calendar View)
- User Dash

## Stack

- Serverless - 100% client script
- **NO** build process - Push to git repository and works
- ES modules with `importmap` - [check browsers support](https://caniuse.com/?search=importmap)
- Web Components using [Hybirds](https://hybrids.js.org/#/)
- Background user-data syncronization into `IndexedDB` using workers
- ??? for `IndexedDB` wrapper
