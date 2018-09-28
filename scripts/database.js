(function (window, undefined) {
  new MatToast(`Successfully connected to ${sessionInfo.server}`);

  const listItemTemplate = txt => {
    let listText = document.createTextNode(txt);
    let listItem = document.createElement('div');
    listItem.classList.add('list-item');

    let listHead = document.createElement('div');
    listHead.classList.add('list-head');
    listHead.appendChild(listText);
    listHead.addEventListener('click', e => {
      if (e.target.classList.contains('active')) {
        e.target.classList.remove('active');
        e.target.parentElement.querySelector('.list-inner').innerHTML = "";
        let Req = new XMLHttpRequest();
        Req.open("GET", `/api/set_database?name=${sessionInfo.server}&db=`);
        Req.send();
      } else {
        for (let el of document.querySelectorAll('.list-head')) {
          el.classList.remove('active');
          el.parentElement.querySelector('.list-inner').innerHTML = "";
        };
        e.target.classList.add('active');
        _callTables(txt);
      }
    })

    let listInner = document.createElement('div');
    listInner.classList.add('list-inner');

    listItem.appendChild(listHead);
    listItem.appendChild(listInner);

    return listItem;
  }

  const innerListItemTemplate = txt => {
    let listText = document.createTextNode(txt);
    let listItem = document.createElement('div');
    listItem.classList.add('list-item');
    listItem.appendChild(listText);

    listItem.addEventListener('click', e => {
      for (let el of document.querySelectorAll('.list-inner .list-item')) el.classList.remove('active');
      e.target.classList.add('active');
      console.log(txt);
    })

    return listItem;
  }

  // EVENT LISTENERS //
  document.querySelector('.fab').addEventListener('click', () => { closeSession() });

  // POPULATE DATABASE LIST //
  let sdReq = new XMLHttpRequest();
  sdReq.addEventListener("load", _setDataList);
  sdReq.open("GET", `/api/databases?name=${sessionInfo.server}&pass=${sessionInfo.password}`);
  sdReq.send();

  // FUNCTIONS //
  function _callTables(e) {
    for (let el of document.querySelectorAll('.list-head')) el.textContent == e && el.classList.add('active');
    let tabReq = new XMLHttpRequest();
    tabReq.addEventListener("load", _getTables);
    tabReq.open("GET", `/api/set_database?name=${sessionInfo.server}&db=${e}`);
    tabReq.send();
  }

  function _getTables() {
    if (JSON.parse(this.response) != "success") {
      new MatToast(`Something went wrong`);
      closeSession();
      return;
    }

    let oReq = new XMLHttpRequest();
    oReq.addEventListener("load", _setTables);
    oReq.open("GET", `/api/tables?name=${sessionInfo.server}&pass=${sessionInfo.password}`);
    oReq.send();
  }

  function _initTable() {
    let gdReq = new XMLHttpRequest();
    gdReq.addEventListener("load", (res) => {
      const DB = JSON.parse(res.srcElement.response);
      if (!DB) return
      _callTables(DB);
    });
    gdReq.open("GET", `/api/get_database?name=${sessionInfo.server}`);
    gdReq.send();
  }

  function _setTables() {
    let active = document.querySelector('.list-head.active');
    let text = active.textContent;
    let inner = active.parentElement.querySelector('.list-inner');
    for (let response of JSON.parse(this.response)) {
      inner.appendChild(innerListItemTemplate((response[`Tables_in_${text}`])));
    }
  }

  function _setDataList() {
    const list = document.querySelector('.table-column');
    for (let response of JSON.parse(this.response)) {
      list.appendChild(listItemTemplate(response.Database));
    }
    _initTable();
  }

  function closeSession() {
    sessionInfo.server = "";
    sessionInfo.password = "";
    stateHandler.setState('connection');
  }

})(window);