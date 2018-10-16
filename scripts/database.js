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
      _callData(txt);
    })

    return listItem;
  }

  const loader = new LoaderController('.loading');
  const queryBox = document.querySelector('[name=query]');

  // EVENT LISTENERS //
  document.querySelector('.fab').addEventListener('click', () => {
    closeSession()
  });

  queryBox.addEventListener('keydown', e=>{
    e.keyCode == 13 && e.ctrlKey && _readQuery()
  })

  // POPULATE DATABASE LIST //
  let sdReq = new XMLHttpRequest();
  sdReq.addEventListener("load", _setDataList);
  sdReq.open("GET", `/api/databases?name=${sessionInfo.server}&pass=${sessionInfo.password}`);
  sdReq.send();

  // FUNCTIONS //
  function _callData(e) {
    sessionInfo.table = e;
    _getdata()
  }

  function _callTables(e) {
    for (let el of document.querySelectorAll('.list-head')) el.textContent == e && el.classList.add('active');
    sessionInfo.database = e;
    _getTables()
  }

  function _getdata() {
    loader.show();
    let query = `SELECT * FROM ${sessionInfo.database}.${sessionInfo.table} LIMIT 1000`;
    queryBox.value = `${query};`;
    _readQuery();
  }

  function _getTables() {
    let oReq = new XMLHttpRequest();
    oReq.addEventListener("load", _setTables);
    oReq.open("GET", `/api/tables?name=${sessionInfo.server}&pass=${sessionInfo.password}&db=${sessionInfo.database}`);
    oReq.send();
  }

  function _initTable() { 
    let gdReq = new XMLHttpRequest();
    gdReq.addEventListener("load", (res) => {
      const DB = JSON.parse(res.srcElement.response);
      if (!DB) return
      sessionInfo.database = DB;
      _callTables(DB);
    });
    gdReq.open("GET", `/api/get_database?name=${sessionInfo.server}`);
    gdReq.send();
  }

  function _readQuery() {
    if(!queryBox.value) return
    let query = queryBox.value.replace(";","");
    _runQuery(query);
  }

  function _runQuery(query) {
    let datReq = new XMLHttpRequest();
    datReq.addEventListener("load", _setdata);
    datReq.open("GET", `/api/run_query?name=${sessionInfo.server}&pass=${sessionInfo.password}&db=${sessionInfo.database}&qry=${query}`);
    datReq.send();
  }

  function _setdata() {
    const res = JSON.parse(this.response);
    const tableData = document.querySelector('.table-data');
    const tableBody = document.createElement('div');
    tableBody.classList.add('table-body');

    const tbDelete = tableData.querySelector('.table-body');
    tbDelete && tableData.removeChild(tbDelete);
    tableBody.innerHTML = "";
    if(!res[0]) {
      new MatToast(`${sessionInfo.table} has no data to display`);
      loader.hide();
      return
    }

    const tableHeaders = Object.keys(res[0]);
    
    let table = document.createElement('table');
    table.classList.add('mat-table');
    let thead = document.createElement('thead');
    let trhead = document.createElement('tr');
    for (let th of tableHeaders) {
      let thNode = document.createElement('th');
      thNode.appendChild(document.createTextNode(th));
      trhead.appendChild(thNode);
    }

    thead.appendChild(trhead);
    table.appendChild(thead);

    let tbody = document.createElement('tbody');
    for (let row of res) {
      let trbody = document.createElement('tr');
      for (let td of tableHeaders) {
        let tdNode = document.createElement('td');
        tdNode.appendChild(document.createTextNode(row[td]));
        trbody.appendChild(tdNode);
      }
      tbody.appendChild(trbody);
    }
    
    table.appendChild(tbody);
    tableBody.appendChild(table);
    tableData.appendChild(tableBody);
    loader.hide();
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
    sessionInfo.database = "";
    sessionInfo.password = "";
    sessionInfo.server = "";
    sessionInfo.table = "";
    stateHandler.setState('connection');
  }

  loader.hide();

})(window);