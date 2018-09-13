// CLASSES //
class ShowHide {
  constructor(selector) {
    this.element = document.querySelector(selector);
  }
  show() {
    this.element.hasAttribute('hidden') && this.element.removeAttribute('hidden');
  }
  hide() {
    this.element.hasAttribute('hidden') || this.element.setAttribute('hidden', '');
  }
}

class LoaderController extends ShowHide {
  constructor(selector) {
    super(selector);
  }
}

class ModalController extends ShowHide {
  constructor(selector, confirmModal = false) {
    super(selector);
    this.confirmModal = confirmModal;
    this.hide();
  }
  confirm() {
    let confirmObj = new CustomEvent('confirm', { detail: true });
    this.element.dispatchEvent(confirmObj);
    this.hide();
  }
  reject() {
    let confirmObj = new CustomEvent('confirm', { detail: false });
    this.element.dispatchEvent(confirmObj);
    this.hide();
  }
  confirmPromise() {
    if (!this.confirmModal) return false;
    this.show();
    return new Promise((res, rej) => {
      this.element.addEventListener('confirm', (e) => {
        if (e.detail) { res() } else { rej() }
      }, { once: true })
    })
  }
}

class MatInput {
  constructor(ele) {
    this.element = ele;
    this.input = this.element.querySelector('input');
    this.element.$ = this;
    this.float();
    this.input.addEventListener('change', () => { this.float() });
  }
  float() {
    if (this.input.value) {
      this.element.classList.add('float');
    } else {
      this.element.classList.remove('float');
    }
  }
}

// TEMPLATES //
const boxTemplate = (name, host, user) => {
  // Main node
  let node = document.createElement('div');
  node.classList.add('boxes');
  node.classList.add('shadow');
  node.classList.add('shadow-hover');
  // Div containing name
  let nameNode = document.createElement('div');
  nameNode.classList.add('name');
  nameNode.appendChild(document.createTextNode(name));
  node.appendChild(nameNode);
  // Span containing host
  let hostNode = document.createElement('span');
  hostNode.appendChild(document.createTextNode(host));
  node.appendChild(hostNode);
  // Add break
  let breakNode = document.createElement('br');
  node.appendChild(breakNode);
  // Span contain user
  let userNode = document.createElement('span');
  userNode.appendChild(document.createTextNode(`${user}@${host}`));
  node.appendChild(userNode);

  node.addEventListener('click', event => {
    let nameContainer = sessionDetail.element.querySelector('[name=name]')
    nameContainer.value = name;
    nameContainer.parentNode.$.float();
    let hostContainer = sessionDetail.element.querySelector('[name=host]')
    hostContainer.value = host;
    hostContainer.parentNode.$.float();
    let userContainer = sessionDetail.element.querySelector('[name=user]')
    userContainer.value = user;
    userContainer.parentNode.$.float();
    sessionDetail.show();
  })

  return node
};

// CLASS INSTASTANCES //
const newConnection = new ModalController('.modal.connection');
const sessionDetail = new ModalController('.modal.login');
const confirmationB = new ModalController('.modal.conf', true);
const loader = new LoaderController('.loading');
for (let e of document.querySelectorAll(".mat-input")) new MatInput(e);

// EVENT LISTENERS //
document.querySelector('.fab').addEventListener('click', () => { newConnection.show() });

newConnection.element.querySelector('.backdrop').addEventListener('click', () => { newConnection.hide() });
newConnection.element.querySelector('.modal-close').addEventListener('click', () => { newConnection.hide() });
newConnection.element.querySelector('.modal-add').addEventListener('click', () => { addConnection() });

sessionDetail.element.querySelector('.backdrop').addEventListener('click', () => { sessionDetail.hide() });
sessionDetail.element.querySelector('.modal-close').addEventListener('click', () => { sessionDetail.hide() });
sessionDetail.element.querySelector('.modal-delete').addEventListener('click', () => { deleteConnection() });
sessionDetail.element.querySelector('.modal-connect').addEventListener('click', () => { sessionDetail.hide() });
sessionDetail.element.querySelector('.modal-save').addEventListener('click', () => { updateConnection() });

confirmationB.element.querySelector('.backdrop').addEventListener('click', () => { confirmationB.reject() });
confirmationB.element.querySelector('.modal-reject').addEventListener('click', () => { confirmationB.reject() });
confirmationB.element.querySelector('.modal-confirm').addEventListener('click', () => { confirmationB.confirm() });

// POPULATE SERVER BOXES //
let oReq = new XMLHttpRequest();
oReq.addEventListener("load", _setBoxes);
oReq.open("GET", "/api/servers");
oReq.send();

// FUNCTIONS //

function _setBoxes() {
  const boxContainer = document.querySelector('.box-container');
  boxContainer.innerHTML = "";
  const res = JSON.parse(this.response);
  let servers = Object.keys(res);

  for (let server of servers) {
    boxContainer.appendChild(boxTemplate(server, res[server].host, res[server].user));
  }

  loader.hide();
}

function addConnection() {
  loader.show();
  const name = newConnection.element.querySelector('[name=name]').value;
  const host = newConnection.element.querySelector('[name=host]').value;
  const user = newConnection.element.querySelector('[name=user]').value;

  let oUpd = new XMLHttpRequest();
  oUpd.addEventListener("load", () => {
    oReq.open("GET", "/api/servers");
    oReq.send();
    newConnection.hide();
  });
  oUpd.open("GET", `/api/add_server?name=${name}&host=${host}&user=${user}`);
  oUpd.send();
}

function deleteConnection() {
  const name = sessionDetail.element.querySelector('[name=name]').value;
  confirmationB.confirmPromise().then(() => {
    loader.show();
    let oUpd = new XMLHttpRequest();
    oUpd.addEventListener("load", () => {
      oReq.open("GET", "/api/servers");
      oReq.send();
      sessionDetail.hide();
    });
    oUpd.open("GET", `/api/remove_server?name=${name}`);
    oUpd.send();
  }).catch(() => {
    console.log(`changes to ${name} rejected!`)
  })
}

function updateConnection() {
  loader.show();
  const name = sessionDetail.element.querySelector('[name=name]').value;
  const host = sessionDetail.element.querySelector('[name=host]').value;
  const user = sessionDetail.element.querySelector('[name=user]').value;

  let oUpd = new XMLHttpRequest();
  oUpd.addEventListener("load", () => {
    oReq.open("GET", "/api/servers");
    oReq.send();
    sessionDetail.hide();
  });
  oUpd.open("GET", `/api/update_server?name=${name}&host=${host}&user=${user}`);
  oUpd.send();
}
