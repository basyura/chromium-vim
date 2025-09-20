var Clipboard = {};

Clipboard.createTextArea = function () {
  // not supported
  return null;
  /*
  if (document == null) {
    return null;
  }
  var t = document.createElement("textarea");
  t.style.position = "absolute";
  t.style.left = "-100%";
  return t;
  */
};

Clipboard.copy = function (text) {
  var t = this.createTextArea();
  if (t == null) {
    return;
  }
  t.value = text;
  document.body.appendChild(t);
  t.select();
  document.execCommand('Copy');
  document.body.removeChild(t);
};

Clipboard.paste = function () {
  var t = this.createTextArea();
  if (t == null) {
    return;
  }
  document.body.appendChild(t);
  t.focus();
  document.execCommand('Paste');
  var text = t.value;
  document.body.removeChild(t);
  return text;
};
