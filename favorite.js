const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const users = JSON.parse(localStorage.getItem('favoriteUsers'));
const dataPanel = document.querySelector("#data-panel");

function renderUserList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-2">
        <div class="mb-2">
          <div class="card">
            <img
              src="${item.avatar}"
              class="card-img-top" alt="User Avatar"/>
            <div class="card-body">
              <h5 class="card-title">${item.name} ${item.surname}</h5>
            </div>
            <div class="card-footer px-0">
              <button class="btn button-primary btn-show-user" data-toggle="modal" data-id="${item.id}"
                data-target="#user-modal">About me</button>
              <button class="btn btn-danger btn-delete-favorite btn-sm" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

function showUserModal(id) {
  const modalName = document.querySelector("#user-modal-name");
  const modalBio = document.querySelector("#user-modal-bio");
  const modalEmail = document.querySelector("#user-modal-email");
  const modalID = document.querySelector("#user-modal-id");
  const modalImage = document.querySelector("#user-modal-image");
  console.log(id)

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data;
      modalName.innerText = `${data.name} ${data.surname}`
      modalBio.innerText = `${data.age}-year-old ${data.gender} from ${data.region}`;
      modalEmail.innerText = data.email;
      modalID.innerText = `Member since ${data.created_at.substring(0, 10)}`;
      console.log(data.avatar) //check
      modalImage.innerHTML = `
                  <img src="${data.avatar}"
                  alt="user-avatar" class="img-fluid">`;
    });
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-user")) {
    // console.log(event.target.dataset.id);
    showUserModal(Number(event.target.dataset.id));
  } else if (event.target.matches('.btn-delete-favorite')) {
    deleteFromFavorite(Number(event.target.dataset.id))
    console.log(users)
  }
});

renderUserList(users)

function deleteFromFavorite(id) {
  const removeIndex = users.findIndex((user) => user.id === id)
  if (removeIndex > -1) {
    users.splice(removeIndex, 1)
  }
  localStorage.setItem('favoriteUsers', JSON.stringify(users))
  renderUserList(users)
}
