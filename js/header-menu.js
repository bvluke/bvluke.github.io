const pageHeader = document.querySelector('.page-header');
const pageHeaderMenuButton = pageHeader.querySelector('.page-header__menu-btn');

pageHeaderMenuButton.addEventListener('click', () => {
  pageHeader.classList.toggle('opened');
  pageHeaderMenuButton.classList.toggle('active');
});
