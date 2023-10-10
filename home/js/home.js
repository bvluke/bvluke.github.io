const pageHeaderConnect = pageHeader.querySelector('.page-header__connect');
const pageHeaderUserMenuButtons = pageHeader.querySelector('.page-header__user-actions button');
const pageHeaderUserButton = pageHeader.querySelector('.page-header__user-button');
const copyAddressButton = pageHeader.querySelector('.page-header__copy-button');
const changeWalletButton = pageHeader.querySelector('.page-header__change-wallet');
const modalWindow = document.querySelector('.modal-window');
const modalWindowClose = modalWindow.querySelector('.modal-window__close');
const walletButtons = modalWindow.querySelectorAll('.connect-wallet__wallet-button');

pageHeaderConnect.addEventListener('click', () => {
  modalWindow.classList.add('active');
});

modalWindowClose.addEventListener('click', () => {
  modalWindow.classList.remove('active');
});

walletButtons.forEach(button => {
  button.addEventListener('click', () => {
    modalWindow.classList.remove('active');
    pageHeader.classList.add('page-header--auth')
  })
});

pageHeaderUserButton.addEventListener('click', () => {
  pageHeaderUserButton.classList.toggle('active');

  document.body.addEventListener('click', (e) => {
    if(pageHeaderUserButton.classList.contains('active') && e.target !== pageHeaderUserButton && e.target !== pageHeaderUserMenuButtons) {
      pageHeaderUserButton.classList.remove('active');
      console.log(e.currentTarget);
    }
  })
});

copyAddressButton.addEventListener('click', () => {
  copyAddressButton.classList.add('active');
  setTimeout(() => {
    copyAddressButton.classList.remove('active');
  }, 3000)
});

changeWalletButton.addEventListener('click', () => {
  pageHeaderUserButton.classList.remove('active');
  pageHeader.classList.remove('page-header--auth');
});
