//========================
// SCRIPTS
//========================

//========================
// Load functions
//========================

window.onload = function () {
    updateTime();
    updateDate();

    document.querySelector('#input').focus();

    document.querySelector('body').addEventListener('click', () => {
        document.querySelector('#input').focus();
    });

    document.onkeydown = handleKeyDown;
    UnsplashBg();
};

//========================
// Header Background
//========================

// Unsplash Image Background
function UnsplashBg() {
    fetch(`https://source.unsplash.com/1600x900/?space,nature,sea,mountain,sky`).then((response) => {
        document.getElementById("header").src = `${response.url}`;
        console.log(response.url);
        //document.getElementById("header").backgroundImage = "url('" + response.url + "')";
    })
}

//========================
// Date and time
//========================

function updateTime() {
    function checkTime(i) {
        return (i < 10) ? "0" + i : i;
    }
    var today = new Date();
    hour = checkTime(today.getHours());
    minutes = checkTime(today.getMinutes());
    document.getElementById('time').innerHTML = hour + '<span class="blink">·</span>' + minutes;
    t = setTimeout(function () { updateTime() }, 5900);
}

function updateDate() {
    var today = new Date();
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    day = today.getDay();
    num = today.getDate();
    month = today.getMonth();

    document.getElementById('date').innerHTML = days[day] + ", " + num + " " + months[month];
}

//========================
// Terminal commands
//========================

function handleKeyDown(e) {
    let keycode = e.which || e.keyCode;

    // Enter key
    if (keycode === 13) {
        evaluateInput();
    }
}

function clearMessage() { document.querySelector('#message').innerHTML = ''; }

function checkIfURL(url) {
    if (/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(url)) {
        if (!url.includes(' ')) {
            return true;
        }
    }
    return false;
}

// Opens a URL either in current or new tab
function redirect(url) {
    window.location.href = url;
    newTab = false;
    return false;
}

// Adds protocol if not present, encodes search string
function buildURL(url, search = '', query = '') {
    let dest = (/(http(s)?:\/\/.)/.test(url))
        ? url
        : 'http://' + url;
    return dest + search + encodeURIComponent(query);
}

function evaluateInput() {
    let input = document.querySelector('#input').value.trim();
    document.querySelector('#input').value = '';
    clearMessage();

    // Input is empty
    if (input === '') return;

    // Format input
    let args = input.split(';');
    let command = args[0].toLowerCase();
    for (let i = 0; i < args.length; i++) {
        args[i] = args[i].trim();
    }

    // Check if valid command or alias
    const commandList = Object.keys(commands);
    const aliasList = Object.keys(aliases);
    let validCommand = false;
    for (let i = 0; i < commandList.length; i++) {
        if (command === commandList[i]) {
            validCommand = true;
            args.shift(); // remove command from args
            break;
        } else if (command === aliasList[i]) {
            validCommand = true;
            command = aliases[command];
            args.shift();
            break;
        }
    }

    // Check if URL
    let isURL = false;
    if (checkIfURL(args[0])) {
        isURL = true;
        command = args.shift();
    }

    // Check for newtab flag
    if (args[args.length - 1] === 'n') {
        newTab = true;
        args.pop(); // remove newtab flag
    }

    // Execute
    if (isURL) {
        redirect(buildURL(command));
    }

    else if (validCommand) {
        commands[command](args);
    }

    else {
        commands[['g']](args);
    }

    return false;
}

// ******************************************************************************
// Commands
// ******************************************************************************


let aliases = {
    // alias: command
    'cal': 'gc',
    'gk': 'k',
    'ddg': 'dg',
    '?': 'help'
}

const commands = {
    // Google
    'g': (args) => {
        const url = 'https://google.com', search = '/search?q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args));
    },

    // DuckDuckGo
    'dg': (args) => {
        const url = 'https://duckduckgo.com', search = '/?q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args));
    },

    // Reddit
    'r': (args) => {
        const url = 'https://reddit.com', search = '/r/';
        let query = (args.length > 0) ? args[0] : '';

        const validSort = (sort) => {
            return (['hot', 'new', 'rising', 'controversial', 'top', 'gilded', 'wiki', 'promoted'].includes(sort))
        };
        const validRange = (range) => {
            return (['day', 'week', 'month', 'year', 'all'].includes(range))
        };

        switch (args.length) {
            // Given nothing
            case 0:
                redirect(url);
                break;

            // Given a subreddit
            case 1:
                redirect(buildURL(url, search, args[0]));
                break;

            // Given subreddit and sort
            case 2:
                query += (validSort(args[1]))
                    ? '/' + args[1]
                    : '';
                redirect(url + search + query);
                break;

            // Given subreddit, sort and range
            case 3:
                if (['top', 'controversial'].includes(args[1])) {
                    query += (validRange(args[2]))
                        ? '/' + args[1] + '?t=' + args[2]
                        : '';
                } else {
                    query += (validSort(args[1]))
                        ? '/' + args[1]
                        : '';
                }
                redirect(url + search + query);
                break;
        }
    },

    // Hacker News
    'hn': (args) => {
        const url = 'https://news.ycombinator.com';
        if (args.length == 0) {
            redirect(url);
        } else {
            switch (args[0]) {
                case 'new':
                    redirect(url + '/newest');
                    break;

                case 'comments':
                    redirect(url + '/newcomments');
                    break;

                case 'show':
                    redirect(url + '/show');
                    break;

                case 'ask':
                    redirect(url + '/ask');
                    break;

                case 'jobs':
                    redirect(url + '/jobs');
                    break;

                case 'submit':
                    redirect(url + '/submit');
                    break;
            }
        }
    },

    // Youtube
    'y': (args) => {
        const url = 'https://youtube.com', search = '/results?search_query=';
        if (args.length == 0) {
            redirect(url);
        } else {
            if (['subs', 's'].includes(args[0]))
                redirect(url + '/feed/subscriptions');
            else
                redirect(buildURL(url, search, args[0]));
        }
    },

    // Wikipedia
    'w': (args) => {
        const url = 'https://wikipedia.org', search = '/w/index.php?title=Special:Search&search=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // GitHub
    'gh': (args) => {
        const url = 'https://github.com', search = '/';
        if (args.length == 0) redirect(url)
        else redirect(url + search + args.join(''));
    },

    // GitHub Gist
    'gist': (args) => {
        const url = 'https://gist.github.com', search = '/';
        if (args.length == 0) redirect(url)
        else redirect(url + search + args.join(''));
    },

    // Wolfram Alpha
    'wa': (args) => {
        const url = 'http://wolframalpha.com', search = '/input/?i=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Netflix
    'n': (args) => {
        const url = 'https://netflix.com', search = '/search?q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Internet Movie Database
    'imdb': (args) => {
        const url = 'http://imdb.com', search = '/find?s=all&q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Google Maps
    'map': (args) => {
        const url = 'https://google.com/maps', search = '/search/';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Google Drive
    'gd': (args) => {
        const url = 'https://drive.google.com', search = '/drive/search?q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Google Calendar
    'gc': (args) => {
        redirect('https://calendar.google.com');
    },

    // Google Images
    'img': (args) => {
        const url = 'https://google.com', search = '/search?tbm=isch&q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Gmail
    'gm': (args) => {
        const url = 'https://mail.google.com', search = '/mail/u/0/#search/';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Google Keep
    'k': (args) => {
        const url = 'https://keep.google.com', search = '/#search/text=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Trello
    'tr': (args) => {
        const url = 'https://trello.com', search = '/search?q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Dictionary
    'dict': (args) => {
        const url = 'http://dictionary.com', search = '/browse/';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Thesaurus
    'thes': (args) => {
        const url = 'http://thesaurus.com', search = '/browse/';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Amazon
    'a': (args) => {
        const url = 'https://amazon.com', search = '/s/?field-keywords=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Node package manager
    'npm': (args) => {
        const url = 'https://npmjs.org', search = '/search?q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Python package index
    'pypi': (args) => {
        const url = 'https://pypi.org', search = '/search/?q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Stack Overflow
    'so': (args) => {
        const url = 'https://stackoverflow.com', search = '/search?q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // MDN web docs
    'mdn': (args) => {
        const url = 'https://developer.mozilla.org', search = '/search?q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')))
    }
}



//========================
// Bookmarks
//========================