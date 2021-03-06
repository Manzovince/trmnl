//========================
// SCRIPTS
//========================

//========================
// Load functions
//========================

window.onload = function() {
    updateTime();
    updateDate();

    document.querySelector('#input').focus();

    document.querySelector('main').addEventListener('click', () => {
        document.querySelector('#input').focus();
    });

    document.onkeydown = handleKeyDown;
    displayTags();
    displayURLs();
};

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
    t = setTimeout(function() { updateTime() }, 5900);
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
    let dest = (/(http(s)?:\/\/.)/.test(url)) ?
        url :
        'http://' + url;
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
    } else if (validCommand) {
        commands[command](args);
    } else {
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
    'gm': 'map',
    'git': 'gh',
    'ddg': 'dg',
    '?': 'help'
}

const commands = {
    // Google
    'g': (args) => {
        const url = 'https://google.com',
            search = '/search?q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args));
    },

    // DuckDuckGo
    'dg': (args) => {
        const url = 'https://duckduckgo.com',
            search = '/?q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args));
    },

    // Qwant
    'qw': (args) => {
        const url = 'https://www.qwant.com',
            search = '/?l=fr&q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args));
    },

    // Reddit
    'r': (args) => {
        const url = 'https://reddit.com',
            search = '/r/';
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
                query += (validSort(args[1])) ?
                    '/' + args[1] :
                    '';
                redirect(url + search + query);
                break;

                // Given subreddit, sort and range
            case 3:
                if (['top', 'controversial'].includes(args[1])) {
                    query += (validRange(args[2])) ?
                        '/' + args[1] + '?t=' + args[2] :
                        '';
                } else {
                    query += (validSort(args[1])) ?
                        '/' + args[1] :
                        '';
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
        const url = 'https://youtube.com',
            search = '/results?search_query=';
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
        const url = 'https://wikipedia.org',
            search = '/w/index.php?title=Special:Search&search=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // GitHub
    'gh': (args) => {
        const url = 'https://github.com',
            search = '/';
        if (args.length == 0) redirect(url)
        else redirect(url + search + args.join(''));
    },

    // GitHub Gist
    'gist': (args) => {
        const url = 'https://gist.github.com',
            search = '/';
        if (args.length == 0) redirect(url)
        else redirect(url + search + args.join(''));
    },

    // Wolfram Alpha
    'wa': (args) => {
        const url = 'http://wolframalpha.com',
            search = '/input/?i=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Netflix
    'n': (args) => {
        const url = 'https://netflix.com',
            search = '/search?q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Internet Movie Database
    'imdb': (args) => {
        const url = 'http://imdb.com',
            search = '/find?s=all&q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Google Maps
    'map': (args) => {
        const url = 'https://google.com/maps',
            search = '/search/';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Google Drive
    'gd': (args) => {
        const url = 'https://drive.google.com',
            search = '/drive/search?q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Google Calendar
    'gc': (args) => {
        redirect('https://calendar.google.com');
    },

    // Google Images
    'img': (args) => {
        const url = 'https://google.com',
            search = '/search?tbm=isch&q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Dictionary
    'dict': (args) => {
        const url = 'http://dictionary.com',
            search = '/browse/';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Thesaurus
    'thes': (args) => {
        const url = 'http://thesaurus.com',
            search = '/browse/';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Amazon
    'a': (args) => {
        const url = 'https://amazon.com',
            search = '/s/?field-keywords=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // Stack Overflow
    'so': (args) => {
        const url = 'https://stackoverflow.com',
            search = '/search?q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },

    // MDN web docs
    'mdn': (args) => {
        const url = 'https://developer.mozilla.org',
            search = '/search?q=';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')))
    },

    // Figma
    'f': (args) => {
        const url = 'https://www.figma.com/files/recent',
            search = '';
        redirect(url);
    },

    // Unsplash
    'us': (args) => {
        const url = 'https://unsplash.com/',
            search = 's/photos/';
        if (args.length == 0) redirect(url)
        else redirect(buildURL(url, search, args.join(' ')));
    },
}

//========================
// Bookmarks
//========================

function displayFolders() {
    console.log('Folders!');
}

function displayTags() {
    console.log('Tags!');
    var tagList = "";

    for (let i = 0; i < dataBookmarks.tags.length; i++) {
        const tag = dataBookmarks.tags[i];
        console.log("tag:", tag);

        tagList += `<div class="tag"><label><input type="checkbox" value="0" class="tag-input"><span>` + tag + `</span></label></div>`
    }
    document.getElementById('tag-list').innerHTML = tagList;
}

function filterTags(data) {
    var selectedTags = [];
}

function displayURLs(query) {
    var urlList = "";

    for (let i = 0; i < dataBookmarks.bookmarks.length; i++) {
        const title = dataBookmarks.bookmarks[i].title;
        const url = dataBookmarks.bookmarks[i].url;
        const tags = dataBookmarks.bookmarks[i].tags;
        console.log("title:", title, "-url:", url, "-tags:", tags);

        urlList += `
        <a class="url" href="` + url + `">
            <img class="url-favicon" src="https://www.google.com/s2/favicons?sz=32&domain_url=` + url + `">` + title + `
        </a>`
    }
    document.getElementById('url-list').innerHTML = urlList;
}

//========================
// Modal to add bookmark
//========================

var modal = document.getElementById("modal-addbookmark");
var btn = document.getElementById("btn-add");
var span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
    modal.style.display = "block";
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}