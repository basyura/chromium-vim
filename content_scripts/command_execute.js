CommandExecuter = {
  commands: [],
  completers: {},
  add: function (label, description, cmd) {
    if (!Command.descriptions.some((v) => v[0] == label)) {
      Command.descriptions.push([label, description]);
    }
    this.commands.push(cmd);
    if (cmd.complete != null) {
      this.completers[label] = cmd.complete;
    }
  },
  execute: function (value, repeats, tab) {
    try {
      for (const [_key, cmd] of Object.entries(this.commands)) {
        if (cmd.match(value)) {
          cmd.execute(value, repeats, tab);
        }
      }
    } catch (e) {
      alert(e.message);
    }
  },
};

// ツールバーのアイコンにある Settings から実行する
CommandExecuter.add('settings', 'Open the options page for this extension', {
  match: function (value) {
    return value === 'settings';
  },
  execute: function (_value, _repeats, tab) {
    tab.tabbed = true;
    // オプションページのURLを取得
    const optionsUrl = chrome.runtime.getURL('/pages/options.html');
    // 新しいタブでオプションページを開く
    chrome.tabs.create({ url: optionsUrl }, function (_newTab) {
      if (chrome.runtime.lastError) {
        console.error(
          'Failed to open options page: ',
          chrome.runtime.lastError.message
        );
      }
    });
  },
});

CommandExecuter.add('bookmarks', 'Search through your bookmarks', {
  match: function (value) {
    return /^bookmarks +/.test(value) && !/^\S+\s*$/.test(value);
  },
  execute: function (value, _repeats, tab) {
    if (/^\S+\s+\//.test(value)) {
      RUNTIME('openBookmarkFolder', {
        path: value.replace(/\S+\s+/, ''),
        noconvert: true,
      });
      return;
    }
    if (
      Command.completionResults.length &&
      !Command.completionResults.some(function (e) {
        return e[2] === value.replace(/^\S+\s*/, '');
      })
    ) {
      RUNTIME('openLink', {
        tab: tab,
        url: Command.completionResults[0][2],
        noconvert: true,
      });
      return;
    }
    RUNTIME('openLink', {
      tab: tab,
      url: value.replace(/^\S+\s+/, ''),
      noconvert: true,
    });
    return;
  },
  complete: function (value) {
    Command.completions = {};
    if (value[0] === '/') {
      return Marks.matchPath(value);
    }
    Marks.match(value, function (response) {
      Command.completions.bookmarks = response;
      Command.updateCompletions();
    });
    return true;
  },
});

CommandExecuter.add('buffer', 'Select buffer from a list of current tabs', {
  match: function (value) {
    return /^buffer +/.test(value);
  },
  execute: function (value, _repeats, _tab) {
    const index = +value.replace(/^\S+\s+/, '') - 1;
    let selectedBuffer;
    if (Number.isNaN(index)) {
      selectedBuffer = Command.completionResults[0];
      if (selectedBuffer === void 0) {
        return;
      }
    } else {
      selectedBuffer = Command.completionResults.filter(function (e) {
        return e[1].indexOf((index + 1).toString()) === 0;
      })[0];
    }
    if (selectedBuffer !== void 0) {
      RUNTIME('goToTab', { id: selectedBuffer[3] });
    }
  },
  complete: function (_value) {
    PORT('getBuffers');
    return true;
  },
});

CommandExecuter.add('tabnew', 'Open a link in a new tab', {
  match: function (value) {
    return /^(tabnew|tabedit|tabe|to|tabopen|tabhistory)$/.test(
      value.replace(/ .*/, '')
    );
  },
  execute: function (value, repeats, tab) {
    tab.tabbed = true;
    RUNTIME('openLink', {
      tab: tab,
      url: Complete.convertToLink(value, tab.isURL, tab.isLink),
      repeats: repeats,
      noconvert: true,
    });
  },
});

CommandExecuter.add('history', 'Search through your browser history', {
  match: function (value) {
    return /^history +/.test(value) && !/^\S+\s*$/.test(value);
  },
  execute: function (value, _repeats, tab) {
    RUNTIME('openLink', {
      tab: tab,
      url: Complete.convertToLink(value),
      noconvert: true,
    });
    return;
  },
  complete: function (value) {
    value = value.trim();
    if (value.length < 2 || value === '') {
      Command.hideData();
      return false;
    }
    Command.historyMode = true;
    PORT('searchHistory', { search: value, limit: settings.searchlimit });
    return true;
  },
});
/**
 *
 *
 */
Command.execute = function (value, repeats) {
  // Match commands like ':tabnew*&! search' before
  // commands like ':tabnew search&*!'
  // e.g. :tabnew& google asdf* => opens a new pinned tab
  // ! == whether to open in a new tab or not
  // & == whether the tab will be active
  // * == whether the tab will be pinned
  // = == force cVim to treat text as a URL
  // ? == force cVim to tread text as a search
  // | == whether to open url in incognito mode (only works for new windows)
  const tab = {
    active: true,
    newWindow: false,
    isURL: false,
    isLink: false,
    pinned: false,
    tabbed: true,
    incognito: false,
  };

  value = value.replace(/^([^\s&$*!=?|]*)[&$*!=?|]*\s/, '$1 ');
  value = value.replace(/[&$*!=?|]+$/, function (e) {
    return e.replace(/[^=?]/g, '');
  });

  if (Complete.engineEnabled(Utils.compressArray(value.split(/\s+/g))[1])) {
    value = value.replace(/[=?]+$/, '');
  }

  this.history.index = {};
  CommandExecuter.execute(value, repeats, tab);
};

Command.getCompleter = function (command) {
  return CommandExecuter.completers[command];
};
