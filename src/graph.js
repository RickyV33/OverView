/* eslint-env browser */

// TODO: Hook this up to the log out button on the graph view. It is currently not hooked up to anything,
// but functions properly
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('logOut').addEventListener('click', () => {
    document.location.href = '/logout';
  });
});
