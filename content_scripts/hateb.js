var Hateb = {};

Hateb.showComment = function () {
  var self = this;
  const existingDiv = document.getElementById("cVim-hateb-comment");
  if (existingDiv) {
    existingDiv.remove();
    return;
  }

  RUNTIME(
    "showHatebComment",
    { targetUrl: window.location.href },
    function (res) {
      const table = self.createTableFromBookmarks(res.data);
      self.showMessage(table);
    }
  );
  console.log("showHatebComment");
};

Hateb.showMessage = function (table) {
  const div = document.createElement("div");
  div.id = "cVim-hateb-comment";
  // div.style.overflow = "auto";
  // div.style.maxHeight = "50%";

  div.appendChild(table);
  setTimeout(() => {
    table.focus();
  }, 0);

  document.body.appendChild(div);
};

Hateb.createTableFromBookmarks = function (data) {
  if (data == null || data.bookmarks == null || data.bookmarks.length == 0) {
    const empty = document.createElement("div");
    empty.innerText = "no entry";
    return empty;
  }

  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";
  table.style.backgroundColor = "white";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const headers = ["user", "comment", "tag", "time"];

  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.style.color = "black";
    th.style.border = "1px solid black";
    th.style.padding = "8px";
    th.style.backgroundColor = "#f2f2f2";
    th.textContent = headerText;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  let count = 0;
  data.bookmarks.forEach((bookmark) => {
    if (bookmark.comment == "") {
      return;
    }
    count++;

    const row = document.createElement("tr");

    const userCell = document.createElement("td");
    userCell.style.color = "black";
    userCell.style.border = "1px solid black";
    userCell.style.padding = "8px";
    userCell.style.textAlign = "left";
    userCell.textContent = bookmark.user;
    row.appendChild(userCell);

    const commentCell = document.createElement("td");
    commentCell.style.color = "black";
    commentCell.style.border = "1px solid black";
    commentCell.style.padding = "8px";
    commentCell.style.textAlign = "left";
    commentCell.textContent = bookmark.comment;
    row.appendChild(commentCell);

    const tagsCell = document.createElement("td");
    tagsCell.style.color = "black";
    tagsCell.style.border = "1px solid black";
    tagsCell.style.padding = "8px";
    tagsCell.textContent = bookmark.tags.join(", ");
    row.appendChild(tagsCell);

    const timestampCell = document.createElement("td");
    timestampCell.style.color = "black";
    timestampCell.style.border = "1px solid black";
    timestampCell.style.padding = "8px";
    timestampCell.style.width = "100px";
    // timestampCell.textContent = new Date(
    //   bookmark.timestamp * 1000
    // ).toLocaleString();
    timestampCell.textContent = bookmark.timestamp.split(" ")[0];
    row.appendChild(timestampCell);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);

  const tableWrapper = document.createElement("div");
  tableWrapper.style.overflow = "auto";
  tableWrapper.style.maxHeight = "500px"; // ヘッダーの高さを引く
  tableWrapper.style.outline = 0;
  tableWrapper.style.textAlign = "left";
  tableWrapper.tabIndex = 0; // フォーカス可能にする
  tableWrapper.innerText = " " + count + " / " + data.bookmarks.length;
  tableWrapper.appendChild(table);

  return tableWrapper;
};
