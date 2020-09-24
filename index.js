const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const USERS_PER_PAGE = 12;
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const searchClear = document.querySelector("#clear-result");
const paginator = document.querySelector("#paginator");

let users = [];
let filteredUsers = [];

//obtain user database via API
axios
  .get(INDEX_URL) // 修改這裡
  .then((response) => {
    users.push(...response.data.results);
    renderPaginator(users.length); //處理分頁區塊
    renderUserList(getUsersByPage(1)); //套用分頁只顯示第一頁
  })
  .catch((err) => console.log(err));

//render user list in the main panel
function renderUserList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
      <div class="col-6 col-sm-3 col-md-2 pr-3 pl-0">
        <div class="mb-3">
          <div class="card">
            <img
              src="${item.avatar}"
              class="card-img-top btn-show-user" data-toggle="modal" data-target="#user-modal" data-id="${item.id}" alt="User Avatar"/>
            <div class="card-footer d-flex justify-content-between px-1">
              <div class="user-name">
                <h5 class="card-title mb-0 ml-1">${item.name}</h5>
                <p class="card-surname ml-1"><em>${item.surname}</em></p> 
              </div>
              <div class="btn-add-favorite mr-2 align-self-end pb-2" data-id="${item.id}"> 
                <i class="far fa-star btn-add-favorite" data-id="${item.id}"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

//check if user has been selected as favorite
function isFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteUsers")) || [];
  if (list.some((user) => user.id === id)) {
    return `<i class="fas fa-star btn-add-favorite" data-id="${item.id}"></i>`;
  }
  return `<i class="far fa-star btn-add-favorite" data-id="${item.id}"></i>`;
}

//show more user info
function showUserModal(id) {
  const modalName = document.querySelector("#user-modal-name");
  const modalBio = document.querySelector("#user-modal-bio");
  const modalEmail = document.querySelector("#user-modal-email");
  const modalID = document.querySelector("#user-modal-id");
  const modalImage = document.querySelector("#user-modal-image");
  // console.log("I'm in showUserModal"); //check
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data;
    modalName.innerText = `${data.name} ${data.surname}`;
    modalBio.innerText = `${data.age}-year-old ${data.gender} from ${data.region}`;
    modalEmail.innerText = data.email;
    modalID.innerText = `Member since ${data.created_at.substring(0, 10)}`;
    modalImage.innerHTML = `
                  <img src="${data.avatar}"
                  alt="user-avatar" class="img-fluid">`;
  });
}

//Listen to "show more user info" or "add to favorite list"
dataPanel.addEventListener("click", function onPanelClicked(event) {
  // console.log(event.target);
  if (event.target.matches(".btn-show-user")) {
    // console.log(event.target.dataset.id); //check
    showUserModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    // console.log(event.target.dataset.id); //check
    addToFavorite(Number(event.target.dataset.id));
  }
});

//收藏我的最愛
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteUsers")) || [];
  const favoriteUser = users.find((user) => user.id === id);
  if (list.some((user) => user.id === id)) {
    return alert("This user is aleady in your favorite user list");
  }
  list.push(favoriteUser);
  localStorage.setItem("favoriteUsers", JSON.stringify(list));
}

//Listen to utilze search function
searchForm.addEventListener("submit", function onSearchInputSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase(); //將input值抓出, 去除空格並且轉小寫以方便比對

  if (!keyword) {
    //check invalid input
    alert("Please enter something valid.");
  }

  filteredUsers = [];

  for (const user of users) {
    //迴圈與原始user名稱比對, 有比對到則push到filteredUsers裡
    const fullName = user.name + " " + user.surname;
    // console.log(fullName)
    if (fullName.toLowerCase().includes(keyword)) {
      filteredUsers.push(user);
    }
  }
  if (filteredUsers.length === 0) {
    return alert(`Your keyword "${keyword}" does not generate any result.`);
  }
  renderPaginator(filteredUsers.length);
  renderUserList(getUsersByPage(1));
});

//Listen to clear search results
searchClear.addEventListener("click", function onClearSearchClicked(event) {
  filteredUsers = [];
  renderPaginator(users.length); //處理分頁區塊
  renderUserList(getUsersByPage(1)); //套用分頁只顯示第一頁
});

//break down user list for pagination
function getUsersByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users;
  const startIndex = (page - 1) * USERS_PER_PAGE;
  return data.slice(startIndex, startIndex + USERS_PER_PAGE); //注意END INDEX不回傳
}

//render paginator
function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / USERS_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

//listen to paginator to access various pages
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName != "A") return; //如果點到的不是A標籤, 就return掉
  const page = Number(event.target.dataset.page);
  renderUserList(getUsersByPage(page));
});
